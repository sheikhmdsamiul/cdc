import { useState } from "react";
import { useAuth, hasRole } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Pencil, UserX } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoleLabel } from "@/i18n/labels";

type User = {
  id: number;
  username: string;
  fullName: string;
  email: string | null;
  roleName: string | null;
  centerName: string | null;
  centerNameBn?: string | null;
  isActive: boolean | null;
  createdAt: string;
};

type Role = { id: number; roleName: string };
type Center = { id: number; centerName: string; centerNameBn?: string | null };

function fetchJson(url: string) {
  return fetch(url, { credentials: "include" }).then((r) => r.json());
}

function UserForm({ initial, roles, centers, onSave, onClose, isBn }: {
  initial?: Partial<User & { roleId?: number; centerId?: number }>;
  roles: Role[];
  centers: Center[];
  onSave: (data: any) => void;
  onClose: () => void;
  isBn: boolean;
}) {
  const [form, setForm] = useState({
    username: initial?.username ?? "",
    fullName: initial?.fullName ?? "",
    email: initial?.email ?? "",
    password: "",
    roleId: initial?.roleId?.toString() ?? "",
    centerId: initial?.centerId?.toString() ?? "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      roleId: form.roleId ? Number(form.roleId) : null,
      centerId: form.centerId ? Number(form.centerId) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isBn ? "ব্যবহারকারীর নাম (Username)" : "Username"}</Label>
          <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required disabled={!!initial?.id} />
        </div>
        <div className="space-y-2">
          <Label>{isBn ? "পূর্ণ নাম" : "Full Name"}</Label>
          <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{isBn ? "ইমেইল" : "Email"}</Label>
        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>{initial?.id ? (isBn ? "নতুন পাসওয়ার্ড (পরিবর্তন না করলে খালি রাখুন)" : "New Password (leave blank to keep)") : (isBn ? "পাসওয়ার্ড" : "Password")}</Label>
        <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!initial?.id} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isBn ? "ভূমিকা" : "Role"}</Label>
              <Select value={form.roleId} onValueChange={(v) => setForm({ ...form, roleId: v })}>
            <SelectTrigger><SelectValue placeholder={isBn ? "ভূমিকা নির্বাচন করুন" : "Select role"} /></SelectTrigger>
            <SelectContent>
              {roles.map((r) => <SelectItem key={r.id} value={r.id.toString()}>{getRoleLabel(r.roleName, isBn)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{isBn ? "কেন্দ্র" : "Center"}</Label>
          <Select value={form.centerId} onValueChange={(v) => setForm({ ...form, centerId: v })}>
            <SelectTrigger><SelectValue placeholder={isBn ? "কেন্দ্র নির্বাচন করুন" : "Select center"} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">{isBn ? "কোনটি নয় (প্রধান দপ্তর)" : "None (HQ)"}</SelectItem>
              {centers.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{isBn ? (c.centerNameBn || c.centerName) : c.centerName}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit">{initial?.id ? (isBn ? "আপডেট করুন" : "Update User") : (isBn ? "ব্যবহারকারী তৈরি করুন" : "Create User")}</Button>
        <Button type="button" variant="outline" onClick={onClose}>{isBn ? "বাতিল" : "Cancel"}</Button>
      </div>
    </form>
  );
}

export default function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const canManage = hasRole(user, "Super Admin", "Center Admin");

  const { data: usersData } = useQuery({ queryKey: ["users"], queryFn: () => fetchJson("/api/users") });
  const { data: rolesData } = useQuery({ queryKey: ["roles"], queryFn: () => fetchJson("/api/roles") });
  const { data: centersData } = useQuery({ queryKey: ["centers"], queryFn: () => fetchJson("/api/centers") });

  const users: User[] = usersData?.users ?? [];
  const roles: Role[] = rolesData?.roles ?? [];
  const centers: Center[] = centersData?.centers ?? [];

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      fetch("/api/users", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); setOpen(false); toast({ title: isBn ? "ব্যবহারকারী তৈরি হয়েছে" : "User created" }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      fetch(`/api/users/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); setEditing(null); toast({ title: isBn ? "ব্যবহারকারী আপডেট হয়েছে" : "User updated" }); },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/users/${id}`, { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast({ title: isBn ? "ব্যবহারকারী নিষ্ক্রিয় করা হয়েছে" : "User deactivated" }); },
  });

  const roleBadgeColor: Record<string, string> = {
    "Super Admin": "bg-red-100 text-red-800",
    "Head Office": "bg-purple-100 text-purple-800",
    "Center Admin": "bg-blue-100 text-blue-800",
    "Superintendent": "bg-teal-100 text-teal-800",
    "Probation Officer": "bg-amber-100 text-amber-800",
    "Case Worker": "bg-green-100 text-green-800",
    "Data Entry Operator": "bg-cyan-100 text-cyan-800",
    "House Parent": "bg-orange-100 text-orange-800",
    "Worker": "bg-gray-100 text-gray-800",
    "DD Division": "bg-indigo-100 text-indigo-800",
    "DD District": "bg-cyan-100 text-cyan-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isBn ? "ব্যবহারকারী ব্যবস্থাপনা" : "User Management"}</h1>
          <p className="text-muted-foreground text-sm mt-1">{isBn ? `সিস্টেমে ${users.length} জন ব্যবহারকারী` : `${users.length} users in the system`}</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><UserPlus className="h-4 w-4 mr-2" />{isBn ? "ব্যবহারকারী যোগ করুন" : "Add User"}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{isBn ? "নতুন ব্যবহারকারী তৈরি করুন" : "Create New User"}</DialogTitle></DialogHeader>
              <UserForm isBn={isBn} roles={roles} centers={centers} onSave={(d) => createMutation.mutate(d)} onClose={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isBn ? "নাম" : "Name"}</TableHead>
              <TableHead>{isBn ? "ব্যবহারকারীর নাম" : "Username"}</TableHead>
              <TableHead>{isBn ? "ভূমিকা" : "Role"}</TableHead>
              <TableHead>{isBn ? "কেন্দ্র" : "Center"}</TableHead>
              <TableHead>{isBn ? "অবস্থা" : "Status"}</TableHead>
              {canManage && <TableHead className="text-right">{isBn ? "কার্যক্রম" : "Actions"}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.fullName}</TableCell>
                <TableCell className="text-muted-foreground">{u.username}</TableCell>
                <TableCell>
                  {u.roleName && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeColor[u.roleName] ?? "bg-gray-100 text-gray-800"}`}>
                      {getRoleLabel(u.roleName, isBn)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{isBn ? ((u.centerNameBn || u.centerName) ?? "প্রধান দপ্তর") : (u.centerName ?? "Head Office")}</TableCell>
                <TableCell>
                  <Badge variant={u.isActive ? "default" : "secondary"}>
                    {u.isActive ? (isBn ? "সক্রিয়" : "Active") : (isBn ? "নিষ্ক্রিয়" : "Inactive")}
                  </Badge>
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(u)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {u.id !== user?.id && (
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deactivateMutation.mutate(u.id)}>
                          <UserX className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{isBn ? "ব্যবহারকারী সম্পাদনা" : "Edit User"}</DialogTitle></DialogHeader>
            <UserForm
              isBn={isBn}
              initial={{ ...editing, roleId: roles.find(r => r.roleName === editing.roleName)?.id, centerId: centers.find(c => c.centerName === editing.centerName)?.id }}
              roles={roles}
              centers={centers}
              onSave={(d) => updateMutation.mutate({ id: editing.id, data: d })}
              onClose={() => setEditing(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
