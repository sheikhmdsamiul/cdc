import React, { useState } from "react";
import { useAuth, usePermission } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Save, Loader2, Building2, Lock, Plus, Trash2, User } from "lucide-react";

// ─── Module Groups ────────────────────────────────────────────────────────────
const MODULE_GROUPS = [
  {
    groupBn: "মূল ব্যবস্থাপনা", groupEn: "Core Management",
    modules: [
      { key: "dashboard",            labelBn: "ড্যাশবোর্ড",            labelEn: "Dashboard" },
      { key: "admissions",           labelBn: "ভর্তি",                  labelEn: "Admissions" },
      { key: "children",             labelBn: "শিশু প্রোফাইল",           labelEn: "Children" },
      { key: "cases",                labelBn: "মামলা ফাইল",              labelEn: "Cases" },
      { key: "family-socioeconomic", labelBn: "পারিবারিক আর্থ-সামাজিক", labelEn: "Family Socioeconomic" },
    ],
  },
  {
    groupBn: "সেবা ও পরিচর্যা", groupEn: "Services & Care",
    modules: [
      { key: "health",               labelBn: "স্বাস্থ্য রেকর্ড",         labelEn: "Health Records" },
      { key: "counseling",           labelBn: "পরামর্শ",                 labelEn: "Counseling" },
      { key: "education-skills",     labelBn: "শিক্ষা ও দক্ষতা",         labelEn: "Education & Skills" },
      { key: "guardians",            labelBn: "অভিভাবক",                labelEn: "Guardians" },
    ],
  },
  {
    groupBn: "আইনি প্রক্রিয়া", groupEn: "Legal Procedures",
    modules: [
      { key: "court-cases",          labelBn: "আদালত মামলা",             labelEn: "Court Cases" },
      { key: "police-requisitions",  labelBn: "পুলিশ তলব",              labelEn: "Police Requisitions" },
    ],
  },
  {
    groupBn: "মূল্যায়ন ও ফলো-আপ", groupEn: "Assessment & Follow-up",
    modules: [
      { key: "risk-assessments",     labelBn: "ঝুঁকি মূল্যায়ন",          labelEn: "Risk Assessments" },
      { key: "release-records",      labelBn: "মুক্তি রেকর্ড",            labelEn: "Release Records" },
      { key: "follow-ups",           labelBn: "ফলো-আপ",                 labelEn: "Follow-ups" },
      { key: "reports",              labelBn: "প্রতিবেদন",               labelEn: "Reports" },
      { key: "measurement-surveys",  labelBn: "পরিমাপ জরিপ",             labelEn: "Measurement Surveys" },
    ],
  },
  {
    groupBn: "প্রশাসনিক", groupEn: "Administrative",
    modules: [
      { key: "users",                labelBn: "ব্যবহারকারী",            labelEn: "Users" },
      { key: "centers",              labelBn: "কেন্দ্র",                labelEn: "Centers" },
      { key: "case_types",           labelBn: "মামলার ধরন",             labelEn: "Case Types" },
      { key: "family_types",          labelBn: "পরিবারের ধরন",           labelEn: "Family Types" },
      { key: "education",            labelBn: "শিক্ষা ও প্রশিক্ষণ",       labelEn: "Education & Training" },
      { key: "address",              labelBn: "ঠিকানা ও প্রশাসনিক একক",  labelEn: "Address & Admin Units" },
      { key: "org_structure",        labelBn: "সাংগঠনিক কাঠামো",       labelEn: "Org Structure" },
      { key: "permissions",          labelBn: "অনুমতি",                 labelEn: "Permissions" },
    ],
  },
];

const ALL_MODULES = MODULE_GROUPS.flatMap((g) => g.modules);
const ACTIONS = ["canView", "canCreate", "canEdit", "canDelete"] as const;
type Action = typeof ACTIONS[number];

type PermRow = { module: string; labelBn: string; labelEn: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean };
type AppUser = { id: number; username: string; fullName: string; roleId: number | null; roleName: string | null; centerId: number | null; centerName: string | null; centerNameBn: string | null; isActive: boolean };
type Role = { id: number; roleName: string };
type Center = { id: number; centerName: string; centerNameBn: string | null; centerType: string };

function fetchJson(url: string) {
  return fetch(url, { credentials: "include" }).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });
}
function putJson(url: string, body: unknown) {
  return fetch(url, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());
}

// Group users by center
function groupUsersByCenter(users: AppUser[]) {
  const global: AppUser[] = [];
  const byCenter: Record<string, { label: string; users: AppUser[] }> = {};
  for (const u of users) {
    if (!u.centerId) { global.push(u); continue; }
    const key = String(u.centerId);
    if (!byCenter[key]) byCenter[key] = { label: u.centerName ?? `Center ${u.centerId}`, users: [] };
    byCenter[key].users.push(u);
  }
  return { global, byCenter };
}

export default function PermissionsPage() {
  const { user, refreshPermissions } = useAuth();
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { toast } = useToast();
  const qc = useQueryClient();

  const [selectedUserId, setSelectedUserId] = useState("");
  const [matrix, setMatrix] = useState<Record<string, PermRow>>({});

  // ─── Queries ───────────────────────────────────────────────────────────────
  const { data: usersData } = useQuery<{ users: AppUser[] }>({
    queryKey: ["users"],
    queryFn: () => fetchJson("/api/users"),
  });
  const users = (usersData?.users ?? []).filter((u) => u.isActive !== false);
  const { global: globalUsers, byCenter } = groupUsersByCenter(users);

  const { data: rolesData } = useQuery<{ roles: Role[] }>({
    queryKey: ["roles"],
    queryFn: () => fetchJson("/api/roles"),
  });
  const roles = rolesData?.roles ?? [];

  const { data: centersData } = useQuery<{ centers: Center[] }>({
    queryKey: ["centers"],
    queryFn: () => fetchJson("/api/centers"),
  });
  const centers = (centersData?.centers ?? []).filter((c: any) => c.isHq !== "yes");

  const selectedUser = users.find((u) => String(u.id) === selectedUserId) ?? null;

  const { data: permsData, isLoading: loadingPerms } = useQuery<{ roleId: number; matrix: PermRow[] }>({
    queryKey: ["permissions", "user", selectedUserId],
    queryFn: () => fetchJson(`/api/permissions?userId=${selectedUserId}`),
    enabled: !!selectedUserId && !!selectedUser?.roleId,
    staleTime: 0,
    gcTime: 0,
  } as any);

  // Bug 1 fix: reset matrix immediately when user selection changes, before new data arrives
  useEffect(() => {
    setMatrix({});
  }, [selectedUserId]);

  // Populate matrix once fresh data arrives for the selected user
  useEffect(() => {
    if (permsData?.matrix) {
      const m: Record<string, PermRow> = {};
      for (const row of permsData.matrix) m[row.module] = row;
      setMatrix(m);
    }
  }, [permsData]);

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: () => putJson("/api/permissions", {
      userId: parseInt(selectedUserId, 10),
      permissions: ALL_MODULES.map((m) => ({
        module: m.key,
        canView:   matrix[m.key]?.canView   ?? false,
        canCreate: matrix[m.key]?.canCreate ?? false,
        canEdit:   matrix[m.key]?.canEdit   ?? false,
        canDelete: matrix[m.key]?.canDelete ?? false,
      })),
    }),
    onSuccess: async () => {
      toast({ title: isBn ? "অনুমতি সংরক্ষণ হয়েছে" : "Permissions saved" });
      qc.invalidateQueries({ queryKey: ["permissions"] });
      // Bug 2 fix: refresh current user's permission cache so changes take effect immediately
      await refreshPermissions();
    },
    onError: () => toast({ title: isBn ? "ত্রুটি" : "Error", variant: "destructive" }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/users/${id}`, { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: isBn ? "ব্যবহারকারী নিষ্ক্রিয় করা হয়েছে" : "User deactivated" });
      qc.invalidateQueries({ queryKey: ["users"] });
      setSelectedUserId("");
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function toggle(moduleKey: string, action: Action) {
    setMatrix((prev) => ({
      ...prev,
      [moduleKey]: { ...(prev[moduleKey] ?? { module: moduleKey, labelBn: "", labelEn: "", canView: false, canCreate: false, canEdit: false, canDelete: false }), [action]: !prev[moduleKey]?.[action] },
    }));
  }

  function toggleAllForModule(moduleKey: string, value: boolean) {
    setMatrix((prev) => ({
      ...prev,
      [moduleKey]: { ...(prev[moduleKey] ?? { module: moduleKey, labelBn: "", labelEn: "", canView: false, canCreate: false, canEdit: false, canDelete: false }), canView: value, canCreate: value, canEdit: value, canDelete: value },
    }));
  }

  function toggleAllForAction(action: Action, value: boolean) {
    setMatrix((prev) => {
      const next = { ...prev };
      for (const m of ALL_MODULES) {
        next[m.key] = { ...(next[m.key] ?? { module: m.key, labelBn: "", labelEn: "", canView: false, canCreate: false, canEdit: false, canDelete: false }), [action]: value };
      }
      return next;
    });
  }

  const actionLabels: Record<Action, { en: string; bn: string }> = {
    canView:   { en: "View",   bn: "দেখুন" },
    canCreate: { en: "Create", bn: "তৈরি" },
    canEdit:   { en: "Edit",   bn: "সম্পাদনা" },
    canDelete: { en: "Delete", bn: "মুছুন" },
  };

  const canManagePerms = usePermission("permissions", "edit");
  const canAdmin = user?.roleName === "Super Admin" || canManagePerms;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><ShieldCheck className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">{isBn ? "অনুমতি ব্যবস্থাপনা" : "Permission Management"}</h1>
          <p className="text-sm text-muted-foreground">{isBn ? "ব্যবহারকারীর মডিউল-স্তরের অ্যাক্সেস নিয়ন্ত্রণ করুন" : "Control user-level module access"}</p>
        </div>
      </div>

      {/* User Selector */}
      <Card>
        <CardContent className="pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Label className="text-sm font-semibold shrink-0">{isBn ? "ব্যবহারকারী নির্বাচন করুন:" : "Select User:"}</Label>
            <div className="flex items-center gap-2">
              <Select value={selectedUserId} onValueChange={(v) => { setSelectedUserId(v); }}>
                <SelectTrigger className="w-72">
                  <SelectValue placeholder={isBn ? "একজন ব্যবহারকারী বেছে নিন" : "Choose a user"} />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="max-h-72 overflow-y-auto"
                  sideOffset={4}
                >
                  {globalUsers.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>{isBn ? "বৈশ্বিক" : "Global"}</SelectLabel>
                      {globalUsers.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.username} — {u.roleName ?? "No Role"}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {Object.entries(byCenter).map(([centerId, group]) => (
                    <SelectGroup key={centerId}>
                      <SelectLabel>{group.label}</SelectLabel>
                      {group.users.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.username} — {u.roleName ?? "No Role"}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              {selectedUserId && canAdmin && (
                <Button
                  variant="destructive" size="icon"
                  title={isBn ? "ব্যবহারকারী নিষ্ক্রিয় করুন" : "Deactivate User"}
                  onClick={() => { if (confirm(isBn ? "এই ব্যবহারকারীকে নিষ্ক্রিয় করবেন?" : "Deactivate this user?")) deleteUserMutation.mutate(parseInt(selectedUserId, 10)); }}
                  disabled={deleteUserMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {canAdmin && (
            <div className="flex gap-2">
              <AddRoleDialog isBn={isBn} onCreated={() => qc.invalidateQueries({ queryKey: ["roles"] })} />
              <AddUserDialog isBn={isBn} roles={roles} centers={centers} onCreated={(id) => { qc.invalidateQueries({ queryKey: ["users"] }); setSelectedUserId(String(id)); }} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected user info */}
      {selectedUser && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{selectedUser.fullName}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-sm">{isBn ? "ভূমিকা:" : "Role:"} <strong>{selectedUser.roleName ?? "—"}</strong></span>
            </div>
            {selectedUser.centerName && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-sm">{isBn ? "কেন্দ্র:" : "Center:"} <strong>{isBn ? selectedUser.centerNameBn ?? selectedUser.centerName : selectedUser.centerName}</strong></span>
              </div>
            )}
            {!selectedUser.roleId && (
              <p className="text-sm text-amber-600 font-medium">⚠️ {isBn ? "এই ব্যবহারকারীর কোনো ভূমিকা নেই — অনুমতি সম্পাদনা করা যাবে না।" : "This user has no role — permissions cannot be edited."}</p>
            )}
            {selectedUser.roleName && (
              <p className="text-xs text-muted-foreground">ℹ️ {isBn ? `এই অনুমতিগুলি "${selectedUser.roleName}" ভূমিকার সকল ব্যবহারকারীর জন্য প্রযোজ্য।` : `These permissions apply to all users with the "${selectedUser.roleName}" role.`}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Permission Matrix */}
      {selectedUserId && selectedUser?.roleId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{isBn ? "মডিউল অনুমতি" : "Module Permissions"}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPerms ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-semibold w-52">{isBn ? "মডিউল" : "Module"}</th>
                      {ACTIONS.map((a) => (
                        <th key={a} className="text-center py-2 px-3 font-semibold">
                          <div className="flex flex-col items-center gap-1">
                            <span>{isBn ? actionLabels[a].bn : actionLabels[a].en}</span>
                            <div className="flex gap-1">
                              <button className="text-xs text-green-600 hover:underline" onClick={() => toggleAllForAction(a, true)}>✓</button>
                              <button className="text-xs text-red-500 hover:underline" onClick={() => toggleAllForAction(a, false)}>✗</button>
                            </div>
                          </div>
                        </th>
                      ))}
                      <th className="text-center py-2 px-3 font-semibold">{isBn ? "সব" : "All"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODULE_GROUPS.map((group) => (
                      <>
                        <tr key={group.groupEn} className="bg-muted/50">
                          <td colSpan={6} className="py-2 px-2 text-xs font-bold uppercase text-muted-foreground tracking-wide">
                            {isBn ? group.groupBn : group.groupEn}
                          </td>
                        </tr>
                        {group.modules.map((mod) => {
                          const row = matrix[mod.key];
                          const allOn = ACTIONS.every((a) => row?.[a]);
                          return (
                            <tr key={mod.key} className="border-b hover:bg-muted/30">
                              <td className="py-2.5 pr-4 font-medium">{isBn ? mod.labelBn : mod.labelEn}</td>
                              {ACTIONS.map((a) => (
                                <td key={a} className="text-center py-2.5 px-3">
                                  <Checkbox checked={!!row?.[a]} onCheckedChange={() => toggle(mod.key, a)} />
                                </td>
                              ))}
                              <td className="text-center py-2.5 px-3">
                                <Checkbox checked={allOn} onCheckedChange={(v) => toggleAllForModule(mod.key, !!v)} />
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Save */}
      {selectedUserId && selectedUser?.roleId && (
        <div className="flex justify-end">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isBn ? "সংরক্ষণ করুন" : "Save Permissions"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Add User Dialog ──────────────────────────────────────────────────────────
function AddUserDialog({ isBn, roles, centers, onCreated }: { isBn: boolean; roles: Role[]; centers: Center[]; onCreated: (id: number) => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ username: "", fullName: "", password: "", roleId: "", centerId: "" });
  const [loading, setLoading] = useState(false);
  
  // New role state
  const [showRoleInput, setShowRoleInput] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [creatingRole, setCreatingRole] = useState(false);
  const qc = useQueryClient();

  async function handleSubmit() {
    if (!form.username || !form.fullName || !form.password) {
      toast({ title: isBn ? "সব তথ্য পূরণ করুন" : "Fill all required fields", variant: "destructive" }); return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/users", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: form.username, 
          fullName: form.fullName, 
          password: form.password, 
          roleId: (form.roleId && form.roleId !== "none") ? parseInt(form.roleId) : null, 
          centerId: (form.centerId && form.centerId !== "none") ? parseInt(form.centerId) : null 
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
      toast({ title: isBn ? "ব্যবহারকারী তৈরি হয়েছে" : "User created successfully" });
      onCreated(data.id);
      setOpen(false);
      setForm({ username: "", fullName: "", password: "", roleId: "", centerId: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  }

  async function handleAddRole() {
    if (!newRoleName.trim()) return;
    setCreatingRole(true);
    try {
      const r = await fetch("/api/roles", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleName: newRoleName.trim() }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Failed to create role");
      toast({ title: isBn ? "নতুন ভূমিকা তৈরি হয়েছে" : "New role created" });
      qc.invalidateQueries({ queryKey: ["roles"] });
      setNewRoleName("");
      setShowRoleInput(false);
      // Automatically select the new role
      if (data.role?.id) setForm(f => ({ ...f, roleId: String(data.role.id) }));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setCreatingRole(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2"><Plus className="h-4 w-4" />{isBn ? "নতুন ব্যবহারকারী" : "New User"}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isBn ? "নতুন ব্যবহারকারী তৈরি করুন" : "Create New User"}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isBn ? "ব্যবহারকারীর তথ্য প্রদান করুন এবং ভূমিকা নির্বাচন করুন।" : "Provide user details and assign a role."}
          </p>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>{isBn ? "ব্যবহারকারীর নাম (লগইন)*" : "Username (for login)*"}</Label>
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="e.g. deo_tongi" />
          </div>
          <div className="space-y-1">
            <Label>{isBn ? "পূর্ণ নাম*" : "Full Name*"}</Label>
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder={isBn ? "যেমন: ডেটা এন্ট্রি অপারেটর — টঙ্গী" : "e.g. Data Entry Operator — Tongi"} />
          </div>
          <div className="space-y-1">
            <Label>{isBn ? "পাসওয়ার্ড*" : "Password*"}</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label>{isBn ? "ভূমিকা" : "Role"}</Label>
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 text-xs" 
                onClick={() => setShowRoleInput(!showRoleInput)}
              >
                {showRoleInput ? (isBn ? "বাতিল" : "Cancel") : (isBn ? "+ নতুন ভূমিকা" : "+ New Role")}
              </Button>
            </div>
            {showRoleInput ? (
              <div className="flex gap-2">
                <Input 
                  placeholder={isBn ? "যেমন: Social Worker" : "e.g. Social Worker"} 
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddRole()}
                />
                <Button size="sm" onClick={handleAddRole} disabled={creatingRole}>
                  {creatingRole ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                </Button>
              </div>
            ) : (
              <Select value={form.roleId} onValueChange={(v) => setForm({ ...form, roleId: v })}>
                <SelectTrigger><SelectValue placeholder={isBn ? "ভূমিকা বেছে নিন" : "Choose role"} /></SelectTrigger>
                <SelectContent position="popper" className="max-h-60 overflow-y-auto" sideOffset={4}>
                  {roles.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.roleName}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-1">
            <Label>{isBn ? "কেন্দ্র" : "Center"}</Label>
            <Select value={form.centerId} onValueChange={(v) => setForm({ ...form, centerId: v })}>
              <SelectTrigger><SelectValue placeholder={isBn ? "কেন্দ্র বেছে নিন (বৈকল্পিক)" : "Choose center (optional)"} /></SelectTrigger>
              <SelectContent position="popper" className="max-h-60 overflow-y-auto" sideOffset={4}>
                <SelectItem value="none">{isBn ? "কোনো কেন্দ্র নেই (বৈশ্বিক)" : "No center (Global)"}</SelectItem>
                {centers.map((c) => <SelectItem key={c.id} value={String(c.id)}>{isBn ? c.centerNameBn ?? c.centerName : c.centerName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isBn ? "তৈরি করুন" : "Create User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Role Dialog ──────────────────────────────────────────────────────────
function AddRoleDialog({ isBn, onCreated }: { isBn: boolean; onCreated: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ roleName: "", scope: "Center", centerId: "", description: "" });
  const [matrix, setMatrix] = useState<Record<string, PermRow>>({});

  const { data: centersData } = useQuery<{ centers: Center[] }>({
    queryKey: ["centers"],
    queryFn: () => fetchJson("/api/centers"),
  });
  const centers = (centersData?.centers ?? []).filter((c: any) => c.isHq !== "yes");

  const togglePerm = (moduleKey: string, action: Action) => {
    setMatrix((prev) => ({
      ...prev,
      [moduleKey]: {
        ...(prev[moduleKey] ?? { module: moduleKey, labelBn: "", labelEn: "", canView: false, canCreate: false, canEdit: false, canDelete: false }),
        [action]: !prev[moduleKey]?.[action],
      },
    }));
  };

  const toggleAllForModule = (moduleKey: string, value: boolean) => {
    setMatrix((prev) => ({
      ...prev,
      [moduleKey]: {
        ...(prev[moduleKey] ?? { module: moduleKey, labelBn: "", labelEn: "", canView: false, canCreate: false, canEdit: false, canDelete: false }),
        canView: value, canCreate: value, canEdit: value, canDelete: value,
      },
    }));
  };

  const hasAnyPermission = Object.values(matrix).some((m) => m.canView || m.canCreate || m.canEdit || m.canDelete);

  function resetForm() {
    setForm({ roleName: "", scope: "Center", centerId: "", description: "" });
    setMatrix({});
  }

  async function handleSubmit() {
    if (!form.roleName.trim()) {
      toast({ title: isBn ? "ভূমিকার নাম দিন" : "Enter role name", variant: "destructive" });
      return;
    }
    if (form.scope === "Center" && !form.centerId) {
      toast({ title: isBn ? "কেন্দ্র নির্বাচন করুন" : "Select a center", variant: "destructive" });
      return;
    }
    if (!hasAnyPermission) {
      toast({ title: isBn ? "অনুমতি সেট করুন" : "Set at least one permission", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const permissions = ALL_MODULES.map((m) => ({
        module: m.key,
        canView: matrix[m.key]?.canView ?? false,
        canCreate: matrix[m.key]?.canCreate ?? false,
        canEdit: matrix[m.key]?.canEdit ?? false,
        canDelete: matrix[m.key]?.canDelete ?? false,
      }));

      const r = await fetch("/api/roles", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleName: form.roleName,
          scope: form.scope,
          centerId: form.centerId ? parseInt(form.centerId) : null,
          description: form.description,
          permissions,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Failed to create role");
      toast({ title: isBn ? "ভূমিকা তৈরি হয়েছে" : "Role created successfully" });
      onCreated();
      setOpen(false);
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  // Reset form when dialog opens fresh
  useEffect(() => {
    if (open) resetForm();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2"><Plus className="h-4 w-4" />{isBn ? "নতুন ভূমিকা" : "New Role"}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isBn ? "নতুন ভূমিকা তৈরি করুন" : "Create New Role"}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isBn ? "ভূমিকার তথ্য ও অনুমতি সেট করুন।" : "Set role details and permissions."}
          </p>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>{isBn ? "ভূমিকার নাম*" : "Role Name*"}</Label>
              <Input value={form.roleName} onChange={(e) => setForm({ ...form, roleName: e.target.value })} placeholder="e.g. Social Worker" />
            </div>
            <div className="space-y-1">
              <Label>{isBn ? "ব্যাপ্তি (Scope)*" : "Scope*"}</Label>
              <Select value={form.scope} onValueChange={(v) => setForm({ ...form, scope: v, centerId: v === "Center" ? form.centerId : "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">{isBn ? "সকল কেন্দ্র (Global)" : "All Centers (Global)"}</SelectItem>
                  <SelectItem value="Center">{isBn ? "কেন্দ্র ভিত্তিক (Center-based)" : "Center-based"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {form.scope === "Center" && (
            <div className="space-y-1">
              <Label>{isBn ? "কেন্দ্র*" : "Center*"}</Label>
              <Select value={form.centerId} onValueChange={(v) => setForm({ ...form, centerId: v })}>
                <SelectTrigger><SelectValue placeholder={isBn ? "কেন্দ্র বেছে নিন" : "Choose center"} /></SelectTrigger>
                <SelectContent position="popper" className="max-h-60 overflow-y-auto" sideOffset={4}>
                  {centers.map((c) => <SelectItem key={c.id} value={String(c.id)}>{isBn ? c.centerNameBn ?? c.centerName : c.centerName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1">
            <Label>{isBn ? "বিবরণ" : "Description"}</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="..." />
          </div>

          {/* Module Permissions */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <Label>{isBn ? "মডিউল অনুমতি*" : "Module Permissions*"}</Label>
              {!hasAnyPermission && <span className="text-xs text-amber-600">{isBn ? "অনুমতি সেট করুন" : "Set permissions to continue"}</span>}
            </div>
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-2 px-3 font-medium w-48">{isBn ? "মডিউল" : "Module"}</th>
                    <th className="text-center py-2 px-2 font-medium">{isBn ? "দেখুন" : "View"}</th>
                    <th className="text-center py-2 px-2 font-medium">{isBn ? "তৈরি" : "Create"}</th>
                    <th className="text-center py-2 px-2 font-medium">{isBn ? "সম্পাদনা" : "Edit"}</th>
                    <th className="text-center py-2 px-2 font-medium">{isBn ? "মুছুন" : "Delete"}</th>
                    <th className="text-center py-2 px-2 font-medium">{isBn ? "সব" : "All"}</th>
                  </tr>
                </thead>
<tbody>
                  {MODULE_GROUPS.map((group) => (
                    <React.Fragment key={group.groupEn}>
                      <tr>
                        <td colSpan={6} className="py-1 px-2 text-xs font-bold bg-muted/30 text-muted-foreground">
                          {isBn ? group.groupBn : group.groupEn}
                        </td>
                      </tr>
                      {group.modules.map((mod) => {
                        const row = matrix[mod.key];
                        const allOn = ACTIONS.every((a) => row?.[a]);
                        return (
                          <tr key={mod.key} className="border-b">
                            <td className="py-2 px-3 font-medium">{isBn ? mod.labelBn : mod.labelEn}</td>
                            {ACTIONS.map((a) => (
                              <td key={a} className="text-center py-1 px-1">
                                <Checkbox checked={!!row?.[a]} onCheckedChange={() => togglePerm(mod.key, a)} />
                              </td>
                            ))}
                            <td className="text-center py-1 px-1">
                              <Checkbox checked={allOn} onCheckedChange={(v) => toggleAllForModule(mod.key, !!v)} />
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={loading || !hasAnyPermission}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isBn ? "তৈরি করুন" : "Create Role"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
