import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Home } from "lucide-react";
import { useListChildren } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type ColumnDef } from "@/components/DataTable";
import { useAuth, hasRole, usePermission } from "@/contexts/AuthContext";
import { FamilyTypeSelect } from "@/components/FamilyTypeSelect";
import { useToast } from "@/hooks/use-toast";

const EMPTY_FORM = {
  childId: "",
  parentsEducation: "",
  parentsOccupation: "",
  parentsMonthlyIncome: "",
  socioeconomicStatus: "",
  parentsContactNumber: "",
  childRelationshipWithParents: "",
  siblingsCountAndOrder: "",
  isMarried: false,
  childrenCount: "",
  familyType: "",
  parentsMaritalStatus: "",
  guardianType: "",
  isOrphan: false,
  familyMemberSubstanceAbuse: false,
  familyCriminalInvolvement: false,
  peerCircleInfo: "",
};

function yesNo(value: boolean | null | undefined, isBn: boolean) {
  if (value == null) return "—";
  return value ? (isBn ? "হ্যাঁ" : "Yes") : (isBn ? "না" : "No");
}

function BooleanChoice({
  label,
  value,
  onChange,
  isBn,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  isBn: boolean;
}) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <Label>{label}</Label>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={value === true} onCheckedChange={() => onChange(true)} />
          <span>{isBn ? "হ্যাঁ" : "Yes"}</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={value === false} onCheckedChange={() => onChange(false)} />
          <span>{isBn ? "না" : "No"}</span>
        </label>
      </div>
    </div>
  );
}

export default function FamilySocioeconomicList() {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { user } = useAuth();
  const { toast } = useToast();
  const canView   = usePermission("family-socioeconomic", "view");
  const canCreate = usePermission("family-socioeconomic", "create");
  const canEdit   = usePermission("family-socioeconomic", "edit");
  const canDelete = usePermission("family-socioeconomic", "delete");
  const canOpenRow = canView;
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: childrenResp } = useListChildren({}, { query: { queryKey: [] } });
  const children = childrenResp?.data ?? [];

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["family-socioeconomic-records"],
    queryFn: async () => {
      const response = await fetch("/api/family-socioeconomic-records", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load family socioeconomic records");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/family-socioeconomic-records", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error((await response.json()).message || "Failed to create record");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-socioeconomic-records"] });
      setOpen(false);
      setForm(EMPTY_FORM);
      toast({ title: isBn ? "সংরক্ষিত হয়েছে" : "Saved" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/family-socioeconomic-records/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error((await response.json()).message || "Failed to update record");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-socioeconomic-records"] });
      setEditing(null);
      setOpen(false);
      toast({ title: isBn ? "আপডেট হয়েছে" : "Updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/family-socioeconomic-records/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error((await response.json()).message || "Failed to delete record");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-socioeconomic-records"] });
      setDeleting(null);
      toast({ title: isBn ? "মুছে ফেলা হয়েছে" : "Deleted" });
    },
  });

  function fillFormFromRecord(record: any) {
    setForm({
      childId: String(record.childId ?? ""),
      parentsEducation: record.parentsEducation ?? "",
      parentsOccupation: record.parentsOccupation ?? "",
      parentsMonthlyIncome: record.parentsMonthlyIncome != null ? String(record.parentsMonthlyIncome) : "",
      socioeconomicStatus: record.socioeconomicStatus ?? "",
      parentsContactNumber: record.parentsContactNumber ?? "",
      childRelationshipWithParents: record.childRelationshipWithParents ?? "",
      siblingsCountAndOrder: record.siblingsCountAndOrder ?? "",
      isMarried: !!record.isMarried,
      childrenCount: record.childrenCount != null ? String(record.childrenCount) : "",
      familyType: record.familyType ?? "",
      parentsMaritalStatus: record.parentsMaritalStatus ?? "",
      guardianType: record.guardianType ?? "",
      isOrphan: !!record.isOrphan,
      familyMemberSubstanceAbuse: !!record.familyMemberSubstanceAbuse,
      familyCriminalInvolvement: !!record.familyCriminalInvolvement,
      peerCircleInfo: record.peerCircleInfo ?? "",
    });
  }

  function normalizePayload() {
    return {
      ...form,
      childId: parseInt(form.childId, 10),
      parentsMonthlyIncome: form.parentsMonthlyIncome ? parseInt(form.parentsMonthlyIncome, 10) : null,
      childrenCount: form.childrenCount ? parseInt(form.childrenCount, 10) : null,
    };
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(record: any) {
    setEditing(record);
    fillFormFromRecord(record);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit && !canCreate) return;
    const payload = normalizePayload();
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  type Row = (typeof records)[number];
  const columns: ColumnDef<Row>[] = [
    { key: "recordId", label: "Record ID", labelBn: "রেকর্ড আইডি", exportValue: (r) => r.recordId ?? "", render: (r) => <span className="font-mono text-xs">{r.recordId}</span> },
    { key: "childName", label: "Child", labelBn: "শিশু", filterType: "text", exportValue: (r) => r.childName ?? "", render: (r) => <span className="font-medium">{r.childName ?? `#${r.childId}`}</span> },
    { key: "parentsOccupation", label: "Parents Occupation", labelBn: "পিতা ও মাতার পেশা", filterType: "text", exportValue: (r) => r.parentsOccupation ?? "", render: (r) => r.parentsOccupation || "—" },
    { key: "parentsMonthlyIncome", label: "Monthly Income", labelBn: "মাসিক আয়", exportValue: (r) => r.parentsMonthlyIncome ?? "", render: (r) => r.parentsMonthlyIncome ?? "—" },
    { key: "guardianType", label: "Guardian Type", labelBn: "অভিভাবকের ধরণ", exportValue: (r) => r.guardianType ?? "", render: (r) => r.guardianType || "—" },
    { key: "isOrphan", label: "Orphan", labelBn: "এতিম", exportValue: (r) => yesNo(r.isOrphan, false), render: (r) => yesNo(r.isOrphan, isBn) },
  ];

  const FormContent = ({ readOnly = false }: { readOnly?: boolean }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset className="space-y-4" disabled={readOnly}>
      <div>
        <Label>{isBn ? "শিশু *" : "Child *"}</Label>
        <Select value={form.childId} onValueChange={(v) => setForm((f) => ({ ...f, childId: v }))}>
          <SelectTrigger><SelectValue placeholder={isBn ? "শিশু বাছুন" : "Select child"} /></SelectTrigger>
          <SelectContent>{children.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.fullName}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>{isBn ? "পিতা মাতার শিক্ষাগত যোগ্যতা" : "Parents' Education"}</Label><Input value={form.parentsEducation} onChange={(e) => setForm((f) => ({ ...f, parentsEducation: e.target.value }))} /></div>
        <div><Label>{isBn ? "পিতা ও মাতার পেশা" : "Parents' Occupation"}</Label><Input value={form.parentsOccupation} onChange={(e) => setForm((f) => ({ ...f, parentsOccupation: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>{isBn ? "পিতা/মাতার মাসিক আয়" : "Parents' Monthly Income"}</Label><Input type="number" min={0} value={form.parentsMonthlyIncome} onChange={(e) => setForm((f) => ({ ...f, parentsMonthlyIncome: e.target.value }))} /></div>
        <div><Label>{isBn ? "আর্থ-সামাজিক অবস্থান" : "Socioeconomic Status"}</Label><Input value={form.socioeconomicStatus} onChange={(e) => setForm((f) => ({ ...f, socioeconomicStatus: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>{isBn ? "পিতা/মাতার সাথে যোগাযোগের নম্বর" : "Parents' Contact Number"}</Label><Input value={form.parentsContactNumber} onChange={(e) => setForm((f) => ({ ...f, parentsContactNumber: e.target.value }))} /></div>
        <div><Label>{isBn ? "পিতা/মাতার সাথে শিশুর সম্পর্ক" : "Child's Relationship with Parents"}</Label><Input value={form.childRelationshipWithParents} onChange={(e) => setForm((f) => ({ ...f, childRelationshipWithParents: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>{isBn ? "ভাই বোনের সংখ্যা ও শিশুর ক্রম" : "Number of Siblings and Child Order"}</Label><Input value={form.siblingsCountAndOrder} onChange={(e) => setForm((f) => ({ ...f, siblingsCountAndOrder: e.target.value }))} /></div>
        <div><Label>{isBn ? "সন্তান সংখ্যা" : "Number of Children"}</Label><Input type="number" min={0} value={form.childrenCount} onChange={(e) => setForm((f) => ({ ...f, childrenCount: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><Label>{isBn ? "পরিবারের ধরণ" : "Family Type"}</Label><FamilyTypeSelect value={form.familyType} onChange={(v) => setForm((f) => ({ ...f, familyType: v }))} /></div>
        <div><Label>{isBn ? "পিতা মাতার বৈবাহিক সম্পর্কের অবস্থা" : "Parents' Marital Status"}</Label><Input value={form.parentsMaritalStatus} onChange={(e) => setForm((f) => ({ ...f, parentsMaritalStatus: e.target.value }))} /></div>
        <div><Label>{isBn ? "শিশুর অভিভাবকের ধরণ" : "Guardian Type"}</Label><Input value={form.guardianType} onChange={(e) => setForm((f) => ({ ...f, guardianType: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BooleanChoice
          label={isBn ? "শিশু বিবাহিত কি না" : "Is the Child Married?"}
          value={form.isMarried}
          onChange={(value) => setForm((f) => ({ ...f, isMarried: value }))}
          isBn={isBn}
        />
        <BooleanChoice
          label={isBn ? "শিশু এতিম কিনা" : "Is the Child Orphaned?"}
          value={form.isOrphan}
          onChange={(value) => setForm((f) => ({ ...f, isOrphan: value }))}
          isBn={isBn}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BooleanChoice
          label={isBn ? "পরিবারের কোন সদস্য মাদকাসক্ত কিনা" : "Family Member Has Substance Abuse?"}
          value={form.familyMemberSubstanceAbuse}
          onChange={(value) => setForm((f) => ({ ...f, familyMemberSubstanceAbuse: value }))}
          isBn={isBn}
        />
        <BooleanChoice
          label={isBn ? "পরিবারের কেউ অপরাধমূলক কাজে যুক্ত কি না" : "Family Member Involved in Crime?"}
          value={form.familyCriminalInvolvement}
          onChange={(value) => setForm((f) => ({ ...f, familyCriminalInvolvement: value }))}
          isBn={isBn}
        />
      </div>
      <div><Label>{isBn ? "শিশুর বন্ধু/পেয়ার সার্কল সংক্রান্ত তথ্য" : "Friend / Peer Circle Information"}</Label><Textarea value={form.peerCircleInfo} onChange={(e) => setForm((f) => ({ ...f, peerCircleInfo: e.target.value }))} /></div>
      </fieldset>
      {!readOnly && (
        <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
          {editing ? (isBn ? "আপডেট করুন" : "Update") : (isBn ? "রেকর্ড তৈরি করুন" : "Create Record")}
        </Button>
      )}
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isBn ? "পারিবারিক ও আর্থ-সামাজিক তথ্যাদি" : "Family & Socioeconomic"}</h1>
          <p className="text-muted-foreground text-sm mt-1">{isBn ? "ভর্তি ও অভিভাবকের মধ্যবর্তী পারিবারিক ও আর্থ-সামাজিক তথ্য ব্যবস্থাপনা" : "Manage family and socioeconomic records between admissions and guardians."}</p>
        </div>
        {canCreate && (
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm(EMPTY_FORM); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-[#166534] hover:bg-[#0d4427]" onClick={openCreate}><Plus className="h-4 w-4" /> {isBn ? "নতুন রেকর্ড" : "New Record"}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editing ? (isBn ? "রেকর্ড সম্পাদনা" : "Edit Record") : (isBn ? "নতুন পারিবারিক ও আর্থ-সামাজিক রেকর্ড" : "New Family & Socioeconomic Record")}</DialogTitle></DialogHeader>
              <FormContent />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Home className="h-4 w-4" />
          <span>{isBn ? "এই মডিউলটি এখন সাইডবারে Admission এর পরে এবং Guardian এর আগে রাখা হয়েছে।" : "This module is now placed in the sidebar after Admissions and before Guardians."}</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        isBn={isBn}
        onRowClick={canOpenRow ? (row) => navigate("/family-socioeconomic/" + row.id) : undefined}
        exportTitle="Family Socioeconomic"
        exportTitleBn="পারিবারিক ও আর্থ-সামাজিক তথ্যাদি"
        emptyText="No family and socioeconomic records found."
        emptyTextBn="কোনো পারিবারিক ও আর্থ-সামাজিক রেকর্ড নেই।"
        actions={(r) => (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {canEdit && (
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(r)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {canDelete && (
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleting(r)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {!canEdit && !canDelete && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/family-socioeconomic/" + r.id)}>
                {isBn ? "দেখুন" : "View"}
              </Button>
            )}
          </div>
        )}
      />

      {deleting && (
        <Dialog open={!!deleting} onOpenChange={(v) => { if (!v) setDeleting(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{isBn ? "রেকর্ড মুছে ফেলুন" : "Delete Record"}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{isBn ? `"${deleting.recordId}" মুছে ফেলতে চান?` : `Delete "${deleting.recordId}"?`}</p>
            <div className="flex gap-2 mt-4">
              <Button variant="destructive" onClick={() => deleteMutation.mutate(deleting.id)} disabled={deleteMutation.isPending}>{isBn ? "মুছুন" : "Delete"}</Button>
              <Button variant="outline" onClick={() => setDeleting(null)}>{isBn ? "বাতিল" : "Cancel"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
