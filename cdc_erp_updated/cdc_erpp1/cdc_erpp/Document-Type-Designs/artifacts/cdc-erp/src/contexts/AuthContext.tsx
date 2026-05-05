import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

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

export type ModulePermission = {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export type PermissionMatrix = Record<string, ModulePermission>;

type AuthState = {
  user: CurrentUser | null;
  loading: boolean;
  permissions: PermissionMatrix;
  allowedCenterIds: number[]; // empty = all centers
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
};

// ─── Context ─────────────────────────────────────────────────────────────────

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

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<PermissionMatrix>({});
  const [allowedCenterIds, setAllowedCenterIds] = useState<number[]>([]);

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await fetch("/api/permissions/my-permissions", { credentials: "include" });
      if (!res.ok) return;
      const data = await readJsonSafely<{ matrix: PermissionMatrix; centerIds: number[] }>(res);
      if (data) {
        setPermissions(data.matrix ?? {});
        setAllowedCenterIds(data.centerIds ?? []);
      }
    } catch {
      // silently fail — permissions stay empty
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (r) => (r.ok ? readJsonSafely<{ user?: CurrentUser }>(r) : null))
      .then(async (data) => {
        const u = data?.user ?? null;
        if (u) {
          await fetchPermissions();
        }
        setUser(u);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [fetchPermissions]);

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

    let loggedInUser = data?.user ?? null;

    if (!loggedInUser) {
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      const meData = await readJsonSafely<{ user?: CurrentUser; error?: string }>(meRes);
      if (!meRes.ok || !meData?.user) {
        throw new Error(meData?.error ?? "Login succeeded but user session could not be loaded");
      }
      loggedInUser = meData.user;
    }

    await fetchPermissions();
    setUser(loggedInUser);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setPermissions({});
    setAllowedCenterIds([]);
  };

  const refreshPermissions = async () => {
    await fetchPermissions();
  };

  return (
    <AuthContext.Provider value={{ user, loading, permissions, allowedCenterIds, login, logout, refreshPermissions }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/**
 * Check if the current user has a specific permission for a module.
 * @param module  e.g. "admissions", "children"
 * @param action  "view" | "create" | "edit" | "delete"
 */
export function usePermission(module: string, action: "view" | "create" | "edit" | "delete"): boolean {
  const { user, permissions } = useAuth();
  if (!user) return false;
  // Super Admin & Head Office always have full access
  if (user.roleName === "Super Admin" || user.roleName === "Head Office") return true;
  const modPerms = permissions[module];
  if (!modPerms) return false;
  switch (action) {
    case "view":   return modPerms.canView;
    case "create": return modPerms.canCreate;
    case "edit":   return modPerms.canEdit;
    case "delete": return modPerms.canDelete;
    default:       return false;
  }
}

// ─── Legacy helpers (kept for backward compatibility) ─────────────────────────

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
