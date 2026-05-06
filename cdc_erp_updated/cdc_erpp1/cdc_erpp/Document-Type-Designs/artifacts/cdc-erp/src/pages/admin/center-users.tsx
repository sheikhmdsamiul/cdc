import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users, Loader2, Building2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Role = { id: number; roleName: string; scope: string; centerId: number | null };
type User = {
  id: number;
  username: string;
  fullName: string;
  roleName: string | null;
  centerName: string | null;
  centerNameBn: string | null;
  isActive: boolean;
};

function fetchJson(url: string) {
  return fetch(url, { credentials: "include" }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
}

export default function CenterUsersPage() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { toast } = useToast();
  const qc = useQueryClient();

  const currentCenterId = user?.centerId;

  const { data: rolesData } = useQuery<{ roles: Role[] }>({
    queryKey: ["roles"],
    queryFn: () => fetchJson("/api/roles"),
  });

  // Show all roles except Super Admin and Center Admin
  const roles = (rolesData?.roles ?? []).filter(
    (r) => 
      r.roleName !== "Super Admin" && 
      r.roleName !== "Center Admin" &&
      (r.scope === "Center" || r.scope === "All")
  );

  const { data: usersData } = useQuery<{ users: User[] }>({
    queryKey: ["center-users", currentCenterId],
    queryFn: () => fetchJson("/api/users"),
    enabled: !!currentCenterId,
  });

  const centerUsers = (usersData?.users ?? []).filter(
    (u) => u.centerId === currentCenterId && u.isActive !== false
  );

  const createMutation = useMutation({
    mutationFn: (data: { username: string; fullName: string; password: string; roleId: number }) => {
      return fetch("/api/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          centerId: currentCenterId,
        }),
      }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      });
    },
    onSuccess: () => {
      toast({ title: isBn ? "ব্যবহারকারী তৈরি হয়েছে" : "User created successfully" });
      qc.invalidateQueries({ queryKey: ["center-users"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    onSuccess: () => {
      toast({ title: isBn ? "ব্যবহারকারী নিষ্ক্রিয় করা হয়েছে" : "User deactivated" });
      qc.invalidateQueries({ queryKey: ["center-users"] });
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{isBn ? "ব্যবহারকারী" : "Users"}</h1>
          <p className="text-sm text-muted-foreground">
            {isBn
              ? `${user?.centerName} এর ব্যবহারকারীদের তালিকা`
              : `Users for ${user?.centerName}`}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base">
            {isBn ? "কেন্দ্রের ব্যবহারকারী" : "Center Users"}
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                {isBn ? "নতুন ব্যবহারকারী" : "Add User"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {isBn ? "নতুন ব্যবহারকারী তৈরি করুন" : "Create New User"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {isBn
                    ? `${user?.centerName} এর জন্য নতুন ব্যবহারকারী তৈরি করুন`
                    : `Create user for ${user?.centerName}`}
                </p>
              </DialogHeader>
              <AddUserForm
                isBn={isBn}
                roles={roles}
                centerId={currentCenterId}
                centerName={user?.centerName}
                onSubmit={(data) => createMutation.mutate(data)}
                isLoading={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {centerUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isBn ? "কোনো ব্যবহারকারী নেই" : "No users yet"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">{isBn ? "ব্যবহারকারীর নাম" : "Username"}</th>
                    <th className="text-left py-2 font-medium">{isBn ? "পূর্ণ নাম" : "Full Name"}</th>
                    <th className="text-left py-2 font-medium">{isBn ? "ভূমিকা" : "Role"}</th>
                    <th className="text-left py-2 font-medium">{isBn ? "কেন্দ্র" : "Center"}</th>
                    <th className="text-right py-2 font-medium">{isBn ? "কার্যক্রম" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {centerUsers.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-muted/30">
                      <td className="py-2">{u.username}</td>
                      <td className="py-2">{u.fullName}</td>
                      <td className="py-2">{u.roleName ?? "—"}</td>
                      <td className="py-2">
                        {isBn ? u.centerNameBn ?? u.centerName : u.centerName}
                      </td>
                      <td className="py-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => {
                            if (confirm(isBn ? "নিষ্ক্রিয় করবেন?" : "Deactivate?")) {
                              deleteMutation.mutate(u.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserPlus className="h-4 w-4 rotate-45" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddUserForm({
  isBn,
  roles,
  centerId,
  centerName,
  onSubmit,
  isLoading,
}: {
  isBn: boolean;
  roles: Role[];
  centerId: number | null;
  centerName: string | null | undefined;
  onSubmit: (data: { username: string; fullName: string; password: string; roleId: number }) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    password: "",
    roleId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.fullName || !form.password || !form.roleId) {
      return;
    }
    onSubmit({
      username: form.username,
      fullName: form.fullName,
      password: form.password,
      roleId: Number(form.roleId),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1">
        <Label>{isBn ? "ব্যবহারকারীর নাম (লগইন)*" : "Username (login)*"}</Label>
        <Input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="e.g. worker_tongi"
          required
        />
      </div>
      <div className="space-y-1">
        <Label>{isBn ? "পূর্ণ নাম*" : "Full Name*"}</Label>
        <Input
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          placeholder={isBn ? "যেমন: কর্মী — টঙ্গী" : "e.g. Worker — Tongi"}
          required
        />
      </div>
      <div className="space-y-1">
        <Label>{isBn ? "পাসওয়ার্ড*" : "Password*"}</Label>
        <Input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
          required
        />
      </div>
      <div className="space-y-1">
        <Label>{isBn ? "ভূমিকা*" : "Role*"}</Label>
        <Select
          value={form.roleId}
          onValueChange={(v) => setForm({ ...form, roleId: v })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder={isBn ? "ভূমিকা বেছে নিন" : "Choose role"} />
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-60 overflow-y-auto">
            {roles.map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>
                {r.roleName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>{isBn ? "কেন্দ্র" : "Center"}</Label>
        <Input value={centerName ?? ""} disabled className="bg-muted" />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {isBn ? "তৈরি করুন" : "Create User"}
      </Button>
    </form>
  );
}