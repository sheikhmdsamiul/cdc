import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useListGuardians, useCreateGuardian, useListGuardianVisits, useCreateGuardianVisit, useListChildren, getListGuardiansQueryKey, getListGuardianVisitsQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, type ColumnDef } from "@/components/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, UsersRound, Pencil, Trash2, Check, ChevronsUpDown, Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useAuth, hasRole, usePermission } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const RELATIONSHIPS = ["Father", "Mother", "Uncle", "Aunt", "Grandparent", "Sibling", "Other"];
const EMPTY_GUARDIAN = { guardianName: "", relationship: "Father", nidNo: "", contactNumber: "", address: "", childId: "" as string | number };
const EMPTY_VISIT = { childId: "", guardianId: "", visitDate: "", purposeOfVisit: "", observations: "" };

export default function GuardiansList() {
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { user } = useAuth();
  const { toast } = useToast();
  const canView   = usePermission("guardians", "view");
  const canCreate = usePermission("guardians", "create");
  const canEdit   = usePermission("guardians", "edit");
  const canDelete = usePermission("guardians", "delete");
  const canOpenRow = canView;

  const [open, setOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<any>(null);
  const [editingVisit, setEditingVisit] = useState<any>(null);
  const [deletingGuardian, setDeletingGuardian] = useState<any>(null);
  const [deletingVisit, setDeletingVisit] = useState<any>(null);
  const [viewingVisit, setViewingVisit] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_GUARDIAN);
  const [visitForm, setVisitForm] = useState(EMPTY_VISIT);

  const { data: guardians = [], isLoading } = useListGuardians({}, { query: { queryKey: getListGuardiansQueryKey({}) } });
  const { data: visits = [] } = useListGuardianVisits({}, { query: { queryKey: getListGuardianVisitsQueryKey({}) } });
  const { data: childrenResp } = useListChildren({ limit: 100 }, { query: { queryKey: ["children", "limit-100"] } });
  const children = childrenResp?.data ?? [];
  const [childSearch, setChildSearch] = useState("");
  const { data: searchResp } = useListChildren({ search: childSearch }, { query: { queryKey: ["children", "search", childSearch] } });
  const searchedChildren = searchResp?.data ?? children;
  const [childComboboxOpen, setChildComboboxOpen] = useState(false);
  const [selectedChildData, setSelectedChildData] = useState<any>(null);
  
  const createGuardian = useCreateGuardian();
  const createVisit = useCreateGuardianVisit();
  const queryClient = useQueryClient();

  const updateGuardianMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      fetch(`/api/guardians/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListGuardiansQueryKey({}) }); setEditingGuardian(null); toast({ title: isBn ? "আপডেট হয়েছে" : "Updated" }); },
  });

  const deleteGuardianMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/guardians/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListGuardiansQueryKey({}) }); setDeletingGuardian(null); toast({ title: isBn ? "মুছে ফেলা হয়েছে" : "Deleted" }); },
  });

  const updateVisitMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      fetch(`/api/guardian-visits/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListGuardianVisitsQueryKey({}) }); setEditingVisit(null); toast({ title: isBn ? "আপডেট হয়েছে" : "Updated" }); },
  });

  const deleteVisitMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/guardian-visits/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListGuardianVisitsQueryKey({}) }); setDeletingVisit(null); toast({ title: isBn ? "মুছে ফেলা হয়েছে" : "Deleted" }); },
  });

  const REL_LABEL: Record<string, string> = isBn ? {
    Father: "পিতা", Mother: "মাতা", Uncle: "চাচা/মামা", Aunt: "চাচি/মামি",
    Grandparent: "দাদা/দাদি/নানা/নানি", Sibling: "ভাই/বোন", Other: "অন্যান্য",
  } : Object.fromEntries(RELATIONSHIPS.map(r => [r, r]));

  const handleGuardianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { 
      guardianName: form.guardianName,
      relationship: form.relationship,
      nidNo: form.nidNo || undefined,
      contactNumber: form.contactNumber || undefined,
      address: form.address || undefined,
      childId: form.childId ? Number(form.childId) : undefined,
    };
    if (editingGuardian) {
      updateGuardianMutation.mutate({ id: editingGuardian.id, data });
    } else {
      createGuardian.mutate({ data } as any, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGuardiansQueryKey({}) });
          setOpen(false);
          setForm(EMPTY_GUARDIAN);
          setChildSearch("");
          setSelectedChildData(null);
          toast({ title: isBn ? "সফল" : "Success", description: isBn ? "অভিভাবক রেকর্ড তৈরি করা হয়েছে।" : "Guardian record created." });
        },
        onError: (err: any) => {
          toast({
            title: isBn ? "ত্রুটি" : "Error",
            description: err?.message ?? (isBn ? "অভিভাবক তৈরি করা যায়নি।" : "Failed to create guardian."),
            variant: "destructive"
          });
        }
      });
    }
  };

  const handleVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit && !canCreate) return;
    const data = { ...visitForm, childId: parseInt(visitForm.childId), guardianId: parseInt(visitForm.guardianId) };
    if (editingVisit) {
      updateVisitMutation.mutate({ id: editingVisit.id, data });
    } else {
      createVisit.mutate(data as any, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGuardianVisitsQueryKey({}) });
          setVisitOpen(false);
          setVisitForm(EMPTY_VISIT);
          toast({ title: isBn ? "সফল" : "Success", description: isBn ? "পরিদর্শন রেকর্ড সংরক্ষিত হয়েছে।" : "Visit recorded successfully." });
        },
        onError: (err: any) => {
          toast({ title: isBn ? "ত্রুটি" : "Error", description: err?.message ?? (isBn ? "পরিদর্শন রেকর্ড সর্ণনয়ায়নি।" : "Failed to record visit."), variant: "destructive" });
        }
      });
    }
  };

  // Guardians connected to a given child: either by their childId FK or by prior visits
  const getGuardiansForChild = (childId: string | number | null | undefined) => {
    if (!childId) return guardians;
    const cid = Number(childId);
    const visitedGuardianIds = new Set(
      (visits as any[]).filter(v => v.childId === cid).map((v: any) => v.guardianId)
    );
    return (guardians as any[]).filter(
      g => g.childId === cid || visitedGuardianIds.has(g.id)
    );
  };

  type GRow = (typeof guardians)[number];
  type VRow = (typeof visits)[number];

  const guardianColumns: ColumnDef<GRow>[] = [
    { key: "guardianId", label: "Guardian ID", labelBn: "অভিভাবক আইডি", filterType: "text", exportValue: r => r.guardianId ?? "", render: r => <span className="font-mono text-xs">{r.guardianId}</span> },
    { key: "guardianName", label: "Name", labelBn: "নাম", filterType: "text", exportValue: r => r.guardianName ?? "", render: r => <span className="font-medium">{r.guardianName}</span> },
    { key: "relationship", label: "Relationship", labelBn: "সম্পর্ক", filterType: "select", filterOptions: RELATIONSHIPS.map(r => ({ value: r, label: r, labelBn: REL_LABEL[r] ?? r })), exportValue: r => r.relationship ?? "", render: r => <span className="px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700">{REL_LABEL[r.relationship ?? ""] ?? r.relationship}</span> },
    { key: "contactNumber", label: "Contact", labelBn: "যোগাযোগ", filterType: "text", exportValue: r => r.contactNumber ?? "", render: r => r.contactNumber || "—" },
    { key: "address", label: "Address", labelBn: "ঠিকানা", exportValue: r => r.address ?? "", render: r => <span className="max-w-xs truncate block">{r.address || "—"}</span> },
  ];

  const visitColumns: ColumnDef<VRow>[] = [
    { key: "visitId", label: "Visit ID", labelBn: "পরিদর্শন আইডি", exportValue: r => r.visitId ?? "", render: r => <span className="font-mono text-xs">{r.visitId}</span> },
    { key: "childName", label: "Child", labelBn: "শিশু", filterType: "text", exportValue: r => (r as any).childName ?? `#${r.childId}`, render: r => <span className="font-medium">{(r as any).childName || `#${r.childId}`}</span> },
    { key: "guardianName", label: "Guardian", labelBn: "অভিভাবক", filterType: "text", exportValue: r => (r as any).guardianName ?? `#${r.guardianId}`, render: r => (r as any).guardianName || `#${r.guardianId}` },
    { key: "visitDate", label: "Visit Date", labelBn: "পরিদর্শনের তারিখ", exportValue: r => r.visitDate ?? "" },
    { key: "purposeOfVisit", label: "Purpose", labelBn: "উদ্দেশ্য", exportValue: r => r.purposeOfVisit ?? "", render: r => <span className="max-w-xs truncate block">{r.purposeOfVisit || "—"}</span> },
  ];

  const GuardianForm = () => (
    <form onSubmit={handleGuardianSubmit} className="space-y-4">
      <div className="flex flex-col gap-2 relative">
        <Label>{isBn ? "শিশু নির্বাচন করুন" : "Select Child"}</Label>
        <Popover open={childComboboxOpen} onOpenChange={setChildComboboxOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                placeholder={form.childId 
                  ? (searchedChildren.find(c => c.id === form.childId)?.fullName ?? children.find(c => c.id === form.childId)?.fullName ?? (isBn ? "শিশু নির্বাচিত" : "Child selected"))
                  : (isBn ? "শিশুর নাম লিখুন..." : "Search child...")} 
                value={childSearch}
                onChange={(e) => {
                  setChildSearch(e.target.value);
                  setChildComboboxOpen(true);
                }}
                role="combobox"
                aria-expanded={childComboboxOpen}
                className="w-full pr-10"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 shrink-0 opacity-50" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[460px] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
            <Command shouldFilter={false}>
              <CommandList>
                <CommandEmpty>{isBn ? "কোনো শিশু পাওয়া যায়নি।" : "No child found."}</CommandEmpty>
                <CommandGroup>
                  {searchedChildren.map((child) => (
                    <CommandItem
                      key={child.id}
                      value={child.id.toString()}
                      onSelect={(currentValue) => {
                        const newChildId = Number(currentValue);
                        setForm((f) => {
                          let newName = f.guardianName;
                          if (f.relationship === "Father" && child.fatherName) newName = child.fatherName;
                          else if (f.relationship === "Mother" && child.motherName) newName = child.motherName;
                          return { ...f, childId: newChildId, guardianName: newName };
                        });
                        setChildSearch(child.fullName);
                        setSelectedChildData(child);
                        setChildComboboxOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          form.childId === child.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {child.fullName} <span className="text-xs text-muted-foreground ml-2">({child.childId})</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Label>{t("guardians.relationship")} *</Label>
        <Select value={form.relationship} onValueChange={v => setForm(f => {
          let newName = f.guardianName;
          const selectedChild = selectedChildData || searchedChildren.find(c => c.id === f.childId) || children.find(c => c.id === f.childId);
          if (selectedChild) {
            if (v === "Father" && selectedChild.fatherName) newName = selectedChild.fatherName;
            if (v === "Mother" && selectedChild.motherName) newName = selectedChild.motherName;
          }
          return { ...f, relationship: v, guardianName: newName };
        })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{REL_LABEL[r] ?? r}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label>{t("guardians.guardianName")} *</Label><Input value={form.guardianName} onChange={e => setForm(f => ({ ...f, guardianName: e.target.value }))} required /></div>
      <div><Label>{t("guardians.nidNumber")}</Label><Input value={form.nidNo} onChange={e => setForm(f => ({ ...f, nidNo: e.target.value }))} /></div>
      <div><Label>{t("guardians.contactNumber")}</Label><Input value={form.contactNumber} onChange={e => setForm(f => ({ ...f, contactNumber: e.target.value }))} /></div>
      <div><Label>{t("guardians.address")}</Label><Textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
      <Button type="submit" className="w-full" disabled={createGuardian.isPending || updateGuardianMutation.isPending}>
        {editingGuardian ? (isBn ? "আপডেট করুন" : "Update") : (isBn ? "অভিভাবক তৈরি করুন" : "Create Guardian")}
      </Button>
    </form>
  );

  function fillVisitForm(v: any) {
    setVisitForm({
      childId: String(v.childId),
      guardianId: String(v.guardianId),
      visitDate: v.visitDate ?? "",
      purposeOfVisit: v.purposeOfVisit ?? "",
      observations: (v as any).observations ?? "",
    });
  }

  const VisitForm = ({ readOnly = false }: { readOnly?: boolean }) => (
    <form onSubmit={handleVisitSubmit} className="space-y-4">
      <fieldset className="space-y-4" disabled={readOnly}>
      <div>
        <Label>{isBn ? "শিশু *" : "Child *"}</Label>
        <Select
          value={visitForm.childId}
          onValueChange={v => setVisitForm(f => ({ ...f, childId: v, guardianId: "" }))}
        >
          <SelectTrigger><SelectValue placeholder={isBn ? "শিশু বাছুন" : "Select child"} /></SelectTrigger>
          <SelectContent>{children.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.fullName}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>{isBn ? "অভিভাবক *" : "Guardian *"}</Label>
        {(() => {
          const filtered = getGuardiansForChild(visitForm.childId);
          return (
            <>
              <Select
                value={visitForm.guardianId}
                onValueChange={v => setVisitForm(f => ({ ...f, guardianId: v }))}
                disabled={!visitForm.childId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !visitForm.childId
                      ? (isBn ? "আগে শিশু বাছুন" : "Select child first")
                      : filtered.length === 0
                        ? (isBn ? "কোনো অভিভাবক নেই" : "No guardians linked")
                        : (isBn ? "অভিভাবক বাছুন" : "Select guardian")
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filtered.map((g: any) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {g.guardianName}
                      <span className="text-xs text-muted-foreground ml-2">
                        ({isBn
                          ? (g.childId === Number(visitForm.childId) ? "নির্ধারিত অভিভাবক" : "পূর্ববর্তী পরিদর্শন")
                          : (g.childId === Number(visitForm.childId) ? "assigned" : "prev visit")})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {visitForm.childId && filtered.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  {isBn
                    ? "এই শিশুর সাথে কোনো অভিভাবক যুক্ত নেই। প্রথমে একজন অভিভাবক তৈরি করুন এবং এই শিশুকে যুক্ত করুন।"
                    : "No guardians linked to this child. Create a guardian and assign this child first."}
                </p>
              )}
            </>
          );
        })()}
      </div>
      <div><Label>{t("guardians.visitDate")} *</Label><Input type="date" value={visitForm.visitDate} onChange={e => setVisitForm(f => ({ ...f, visitDate: e.target.value }))} required /></div>
      <div><Label>{t("guardians.purposeOfVisit")}</Label><Textarea value={visitForm.purposeOfVisit} onChange={e => setVisitForm(f => ({ ...f, purposeOfVisit: e.target.value }))} /></div>
      <div><Label>{t("guardians.observations")}</Label><Textarea value={visitForm.observations} onChange={e => setVisitForm(f => ({ ...f, observations: e.target.value }))} /></div>
      </fieldset>
      {!readOnly && (
        <Button type="submit" className="w-full" disabled={createVisit.isPending || updateVisitMutation.isPending}>
          {editingVisit ? (isBn ? "আপডেট করুন" : "Update") : (isBn ? "পরিদর্শন রেকর্ড করুন" : "Record Visit")}
        </Button>
      )}
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("guardians.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{isBn ? "অভিভাবক তথ্য ও পরিদর্শন লগ ব্যবস্থাপনা" : "Guardian information and visit log management"}</p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <>
              <Dialog open={visitOpen && !editingVisit} onOpenChange={v => { if (!v) setVisitOpen(false); else { setEditingVisit(null); setVisitForm(EMPTY_VISIT); setVisitOpen(true); } }}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2"><Plus className="h-4 w-4" /> {isBn ? "পরিদর্শন যোগ করুন" : "Log Visit"}</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{isBn ? "নতুন পরিদর্শন রেকর্ড" : "New Guardian Visit"}</DialogTitle>
                    <DialogDescription>
                      {isBn ? "অভিভাবকের পরিদর্শনের তথ্য সংগ্রহ করুন।" : "Record information about a guardian's visit."}
                    </DialogDescription>
                  </DialogHeader>
                  {VisitForm({})}
                </DialogContent>
              </Dialog>
              <Dialog open={open && !editingGuardian} onOpenChange={v => { if (!v) setOpen(false); else { setEditingGuardian(null); setForm(EMPTY_GUARDIAN); setOpen(true); } }}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-[#166534] hover:bg-[#0d4427]"><Plus className="h-4 w-4" /> {isBn ? "নতুন অভিভাবক" : "New Guardian"}</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{isBn ? "নতুন অভিভাবক" : "New Guardian"}</DialogTitle>
                    <DialogDescription>
                      {isBn ? "শিশুর জন্য নতুন অভিভাবক যুক্ত করুন।" : "Add a new guardian for the child."}
                    </DialogDescription>
                  </DialogHeader>
                  {GuardianForm()}
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="guardians">
        <TabsList>
          <TabsTrigger value="guardians">{t("guardians.title")}</TabsTrigger>
          <TabsTrigger value="visits">{t("guardians.visitHistory")}</TabsTrigger>
        </TabsList>
        <TabsContent value="guardians" className="mt-4">
          <DataTable
            columns={guardianColumns} data={guardians} isLoading={isLoading} isBn={isBn}
            exportTitle="Guardians" exportTitleBn="অভিভাবকের তালিকা"
            emptyText="No guardians found." emptyTextBn="কোনো অভিভাবক পাওয়া যায়নি।"
            onRowClick={canOpenRow ? (g) => navigate(`/guardians/${g.id}`) : undefined}
            actions={g => (
              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                {canEdit && (
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setForm({ guardianName: g.guardianName ?? "", relationship: g.relationship ?? "Father", nidNo: g.nidNo ?? "", contactNumber: g.contactNumber ?? "", address: g.address ?? "", childId: (g as any).childId ?? "" }); setEditingGuardian(g); setOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {canDelete && (
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeletingGuardian(g)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
                {!canEdit && !canDelete && (
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/guardians/${g.id}`)}>{t("common.view")}</Button>
                )}
              </div>
            )}
          />
        </TabsContent>
        <TabsContent value="visits" className="mt-4">
          <DataTable
            columns={visitColumns} data={visits} isBn={isBn}
            exportTitle="Guardian Visits" exportTitleBn="অভিভাবক পরিদর্শন"
            emptyText="No visit logs." emptyTextBn="কোনো পরিদর্শন লগ নেই।"
            onRowClick={canOpenRow ? (v) => {
              fillVisitForm(v);
              if (canEdit) {
                setEditingVisit(v);
                setVisitOpen(true);
                return;
              }
              setViewingVisit(v);
            } : undefined}
            actions={v => (
              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                {canEdit && (
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { fillVisitForm(v); setEditingVisit(v); setVisitOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {canDelete && (
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeletingVisit(v)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Guardian */}
      {editingGuardian && (
        <Dialog open={!!editingGuardian} onOpenChange={v => { if (!v) setEditingGuardian(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{isBn ? "অভিভাবক সম্পাদনা" : "Edit Guardian"}</DialogTitle>
              <DialogDescription>
                {isBn ? "অভিভাবকের তথ্য পরিবর্তন করুন।" : "Modify guardian information."}
              </DialogDescription>
            </DialogHeader>
            {GuardianForm()}
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Visit */}
      {editingVisit && (
        <Dialog open={!!editingVisit} onOpenChange={v => { if (!v) setEditingVisit(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{isBn ? "পরিদর্শন সম্পাদনা" : "Edit Visit"}</DialogTitle>
              <DialogDescription>
                {isBn ? "পরিদর্শন রেকর্ড পরিবর্তন করুন।" : "Modify visit record."}
              </DialogDescription>
            </DialogHeader>
            {VisitForm({})}
          </DialogContent>
        </Dialog>
      )}

      {viewingVisit && (
        <Dialog open={!!viewingVisit} onOpenChange={v => { if (!v) setViewingVisit(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{isBn ? "পরিদর্শন রেকর্ড দেখুন" : "View Visit Record"}</DialogTitle>
              <DialogDescription>
                {isBn ? "পরিদর্শন রেকর্ডের বিস্তারিত তথ্য।" : "Detailed information about the visit record."}
              </DialogDescription>
            </DialogHeader>
            {VisitForm({ readOnly: true })}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Guardian */}
      {deletingGuardian && (
        <Dialog open={!!deletingGuardian} onOpenChange={v => { if (!v) setDeletingGuardian(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{isBn ? "অভিভাবক মুছুন" : "Delete Guardian"}</DialogTitle>
              <DialogDescription>
                {isBn ? "অভিভাবক রেকর্ড মুছে ফেলার নিশ্চিতকরণ।" : "Confirm deletion of guardian record."}
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{isBn ? `"${(deletingGuardian as any).guardianName}" মুছে ফেলতে চান?` : `Delete "${(deletingGuardian as any).guardianName}"?`}</p>
            <div className="flex gap-2 mt-4">
              <Button variant="destructive" onClick={() => deleteGuardianMutation.mutate((deletingGuardian as any).id)} disabled={deleteGuardianMutation.isPending}>{isBn ? "মুছুন" : "Delete"}</Button>
              <Button variant="outline" onClick={() => setDeletingGuardian(null)}>{isBn ? "বাতিল" : "Cancel"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Visit */}
      {deletingVisit && (
        <Dialog open={!!deletingVisit} onOpenChange={v => { if (!v) setDeletingVisit(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{isBn ? "পরিদর্শন মুছুন" : "Delete Visit"}</DialogTitle>
              <DialogDescription>
                {isBn ? "পরিদর্শন রেকর্ড মুছে ফেলার নিশ্চিতকরণ।" : "Confirm deletion of visit record."}
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{isBn ? `"${(deletingVisit as any).visitId}" মুছে ফেলতে চান?` : `Delete visit "${(deletingVisit as any).visitId}"?`}</p>
            <div className="flex gap-2 mt-4">
              <Button variant="destructive" onClick={() => deleteVisitMutation.mutate((deletingVisit as any).id)} disabled={deleteVisitMutation.isPending}>{isBn ? "মুছুন" : "Delete"}</Button>
              <Button variant="outline" onClick={() => setDeletingVisit(null)}>{isBn ? "বাতিল" : "Cancel"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
