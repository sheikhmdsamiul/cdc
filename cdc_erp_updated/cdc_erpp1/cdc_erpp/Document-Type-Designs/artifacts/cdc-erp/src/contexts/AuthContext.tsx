import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CurrentUser = {
  id: number;
  username: string;
  fullName: string;
  email: string | null;
  roleId: number | null;
  roleName: string | null;
  roleScope: string | null;
  roleAccess: string | null;
  centerId: number | null;
  centerName: string | null;
  administrativeUnitId: number | null;
  isActive: boolean | null;
};

type AuthState = {
  user: CurrentUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

async function readJsonSafely<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text.trim()) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (r) => (r.ok ? readJsonSafely<{ user?: CurrentUser }>(r) : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await readJsonSafely<{ user?: CurrentUser; error?: string }>(res);

    if (!res.ok) {
      throw new Error(data?.error ?? `Login failed (${res.status})`);
    }

    if (data?.user) {
      setUser(data.user);
      return;
    }

    // Some proxies may forward the session cookie correctly but still yield an
    // empty login response body. Fall back to `/auth/me` in that case.
    const meRes = await fetch("/api/auth/me", { credentials: "include" });
    const meData = await readJsonSafely<{ user?: CurrentUser; error?: string }>(meRes);
    if (!meRes.ok || !meData?.user) {
      throw new Error(meData?.error ?? "Login succeeded but user session could not be loaded");
    }
    setUser(meData.user);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function hasRole(user: CurrentUser | null, ...roles: string[]) {
  const roleName = user?.roleName;
  if (!roleName) return false;
  if (roles.includes(roleName)) return true;

  if (
    roleName === "Head Office" &&
    (roles.includes("Super Admin") || roles.includes("Center Admin"))
  ) {
    return true;
  }

  return false;
}

export function canDoWorkflow(user: CurrentUser | null, action: "submit" | "review1" | "review2" | "approve" | "reject") {
  const role = user?.roleName ?? "";
  const map: Record<string, string[]> = {
    submit:  ["Worker", "House Parent", "Data Entry Operator", "Center Admin", "Super Admin"],
    review1: ["Case Worker", "Center Admin", "Super Admin"],
    review2: ["Probation Officer", "Center Admin", "Super Admin"],
    approve: ["Superintendent", "Center Admin", "Super Admin"],
    reject:  ["Case Worker", "Probation Officer", "Superintendent", "Center Admin", "Super Admin"],
  };
  return (map[action] ?? []).includes(role);
}
