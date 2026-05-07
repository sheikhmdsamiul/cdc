import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useListReleaseRecords, useCreateReleaseRecord, useListChildren, getListReleaseRecordsQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, XCircle, Send, Pencil, Trash2 } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/DataTable";
import { useAuth, hasRole, usePermission } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const RELEASE_TYPES = ["Court Order", "Guardian Request", "Transfer", "Escape", "Medical", "Other"];
const EMPTY_FORM = { childId: "", releaseDate: "", releaseType: "Court Order", handedOverTo: "", remarks: "" };

const STATUS_BADGE: Record<string, { label: string; labelBn: string; className: string }> = {
  Draft:                   { label: "Draft",                   labelBn: "খসড়া",        className: "bg-gray-100 text-gray-700" },
  "Submitted to PO":       { label: "Submitted to PO",       labelBn: "PO-এ জমা",      className: "bg-indigo-100 text-indigo-700" },
  "Update Needed by CW":   { label: "Update Needed by CW",   labelBn: "আপডেট প্রয়োজন", className: "bg-orange-100 text-orange-800" },
  "Submitted to SUPT":     { label: "Submitted to SUPT",     labelBn: "SUPT-এ জমা",    className: "bg-purple-100 text-purple-700" },
  Approved:                { label: "Approved",                labelBn: "অনুমোদিত",     className: "bg-green-100 text-green-700" },
  Rejected:                { label: "Rejected",                labelBn: "প্রত্যাখ্যাত",   className: "bg-red-100 text-red-700" },
};

export default function ReleaseRecordsList() {
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { user } = useAuth();
  const { toast } = useToast();
  const canView    = usePermission("release-records", "view");
  const canCreate  = usePermission("release-records", "create");
  const canEdit    = usePermission("release-records", "edit");
  const canDelete  = usePermission("release-records", "delete");
  // In this system, "Approve" is treated as an "edit" action on the record status.
  const canApprove = canEdit;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [actionTarget, setActionTarget] = useState<any>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: records = [], isLoading } = useListReleaseRecords({}, { query: { queryKey: getListReleaseRecordsQueryKey({}) } });
  const { data: childrenResp } = useListChildren({}, { query: { queryKey: [] } });
  const children = childrenResp?.data ?? [];
  const createRecord = useCreateReleaseRecord();
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListReleaseRecordsQueryKey({}) });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      fetch(`/api/release-records/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
        .then(async r => { if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e?.error ?? "Update failed"); } return r.json(); }),
    onSuccess: () => { invalidate(); setEditing(null); toast({ title: isBn ? "আপডেট হয়েছে" : "Updated" }); },
    onError: (e: any) => toast({ title: isBn ? "ত্রুটি" : "Error", description: e?.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/release-records/${id}`, { method: "DELETE", credentials: "include" }).then(async r => {
        if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e?.error ?? "Delete failed"); }
        if (r.status === 204) return {};
        return r.json();
      }),
    onSuccess: () => { invalidate(); setDeleting(null); toast({ title: isBn ? "মুছে ফেলা হয়েছে" : "Deleted" }); },
    onError: (e: any) => toast({ title: isBn ? "ত্রুটি" : "Error", description: e?.message, variant: "destructive" }),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action, note }: { id: number; action: string; note?: string }) =>
      fetch(`/api/release-records/${id}/action`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, note }) })
        .then(async r => { if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e?.error ?? "Action failed"); } return r.json(); }),
    onSuccess: (_data, vars) => {
      invalidate();
      setActionTarget(null); setActionType(null); setRejectNote("");
      const successMsg = vars.action === "submit_to_po"
        ? (isBn ? "PO-এ জমা দেওয়া হয়েছে" : "Submitted to Probation Officer")
        : vars.action === "forward_to_supt"
          ? (isBn ? "SUPT-এ পাঠানো হয়েছে" : "Forwarded to Superintendent")
          : vars.action === "approve"
            ? (isBn ? "অনুমোদন দেওয়া হয়েছে" : "Approved — child marked as Released")
            : (isBn ? "প্রত্যাখ্যাত হয়েছে" : "Rejected");
      toast({ title: isBn ? "সফল" : "Success", description: successMsg });
    },
    onError: (e: any) => toast({ title: isBn ? "ত্রুটি" : "Error", description: e?.message, variant: "destructive" }),
  });

  const RELEASE_LABEL: Record<string, string> = isBn
    ? { "Court Order": "আদালতের নির্দেশ", "Guardian Request": "অভিভাবকের অনুরোধ", Transfer: "স্থানান্তর", Escape: "পলায়ন", Medical: "চিকিৎসা", Other: "অন্যান্য" }
    : Object.fromEntries(RELEASE_TYPES.map(t => [t, t]));

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setOpen(true); }
  function openEdit(r: any) {
    const editableStatuses = ["Draft", "Update Needed by CW"];
    if (!editableStatuses.includes(r.approvalStatus)) {
      toast({ title: isBn ? "সম্পাদনা করা যাবে না" : "Cannot edit", description: isBn ? "শুধুমাত্র খসড়া বা আপডেট প্রয়োজন এমন রেকর্ড সম্পাদনা করা যায়।" : "Only Draft or records needing update can be edited.", variant: "destructive" });
      return;
    }
    setForm({ childId: String(r.childId), releaseDate: r.releaseDate ?? "", releaseType: r.releaseType ?? "Court Order", handedOverTo: r.handedOverTo ?? "", remarks: r.remarks ?? "" });
    setEditing(r); setOpen(true);
  }

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.childId) {
      toast({ title: isBn ? "ত্রুটি" : "Error", description: isBn ? "একটি শিশু নির্বাচন করুন।" : "Please select a child.", variant: "destructive" });
      return;
    }
    if (!form.releaseDate) {
      toast({ title: isBn ? "ত্রুটি" : "Error", description: isBn ? "মুক্তির তারিখ দিন।" : "Please enter a release date.", variant: "destructive" });
      return;
    }
    const data = { ...form, childId: parseInt(form.childId) };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createRecord.mutate({ data } as any, {
        onSuccess: () => { invalidate(); setOpen(false); setForm(EMPTY_FORM); toast({ title: isBn ? "রেকর্ড তৈরি হয়েছে" : "Record created", description: isBn ? "এখন জমা দিন অনুমোদনের জন্য।" : "Now submit it for approval." }); },
        onError: (e: any) => toast({ title: isBn ? "ত্রুটি" : "Error", description: e?.message, variant: "destructive" }),
      });
    }
  };

  type RRow = (typeof records)[number] & { approvalStatus?: string; submittedBy?: string; approvedByName?: string; rejectionNote?: string };

  const columns: ColumnDef<RRow>[] = [
    { key: "releaseId", label: "Release ID", labelBn: "মুক্তি আইডি", filterType: "text", exportValue: r => (r as any).releaseId ?? "", render: r => <span className="font-mono text-xs">{(r as any).releaseId}</span> },
    { key: "childName", label: "Child", labelBn: "শিশু", filterType: "text", exportValue: r => (r as any).childName ?? `#${(r as any).childId}`, render: r => <span className="font-medium">{(r as any).childName || `#${(r as any).childId}`}</span> },
    { key: "releaseDate", label: "Release Date", labelBn: "মুক্তির তারিখ", exportValue: r => (r as any).releaseDate ?? "" },
    {
      key: "releaseType", label: "Type", labelBn: "ধরন", filterType: "select",
      filterOptions: RELEASE_TYPES.map(t => ({ value: t, label: t, labelBn: RELEASE_LABEL[t] ?? t })),
      exportValue: r => (r as any).releaseType ?? "",
      render: r => <span className="px-2 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700">{RELEASE_LABEL[(r as any).releaseType ?? ""] ?? (r as any).releaseType}</span>,
    },
    {
      key: "approvalStatus", label: "Status", labelBn: "অবস্থা",
      filterType: "select",
      filterOptions: Object.entries(STATUS_BADGE).map(([v, d]) => ({ value: v, label: d.label, labelBn: d.labelBn })),
      exportValue: r => (r as any).approvalStatus ?? "",
      render: r => {
        const s = (r as any).approvalStatus ?? "Draft";
        const b = STATUS_BADGE[s] ?? STATUS_BADGE.Draft;
        return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${b.className}`}>{isBn ? b.labelBn : b.label}</span>;
      },
    },
    { key: "handedOverTo", label: "Handed Over To", labelBn: "যার কাছে হস্তান্তর", exportValue: r => (r as any).handedOverTo ?? "", render: r => (r as any).handedOverTo || "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("releaseRecords.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{isBn ? "আনুষ্ঠানিক মুক্তির নথি ও হস্তান্তরের রেকর্ড" : "Official release documentation and handover records"}</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate} className="gap-2 bg-[#166534] hover:bg-[#0d4427]">
            <Plus className="h-4 w-4" />{isBn ? "নতুন মুক্তি" : "New Release"}
          </Button>
        )}
      </div>

      <DataTable
        columns={columns} data={records as RRow[]} isLoading={isLoading} isBn={isBn}
        exportTitle="Release Records" exportTitleBn="মুক্তির রেকর্ড"
        emptyText="No release records found." emptyTextBn="কোনো মুক্তির রেকর্ড নেই।"
        onRowClick={r => navigate(`/release-records/${(r as any).id}`)}
        actions={r => {
          const status = (r as any).approvalStatus ?? "Draft";
          return (
            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
              {/* Submit for approval — anyone with create/edit permission on Draft records */}
              {(canCreate || canEdit) && ["Draft", "Update Needed by CW"].includes(status) && (
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" onClick={() => actionMutation.mutate({ id: (r as any).id, action: "submit_to_po" })}>
                  <Send className="h-3 w-3" />{isBn ? "জমা দিন" : "Submit"}
                </Button>
              )}
              {/* Approve/Forward logic is complex, better to handle in detail page for secondary reviewers */}
              {canEdit && status === "Submitted to PO" && (
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" onClick={() => actionMutation.mutate({ id: (r as any).id, action: "forward_to_supt" })}>
                  {isBn ? "SUPT-এ পাঠান" : "Forward"}
                </Button>
              )}
              {canApprove && status === "Submitted to SUPT" && (
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1 text-green-700 border-green-300 hover:bg-green-50" onClick={() => { setActionTarget(r); setActionType("approve"); }}>
                  <CheckCircle2 className="h-3 w-3" />{isBn ? "অনুমোদন" : "Approve"}
                </Button>
              )}
              {/* Edit Draft */}
              {canEdit && status === "Draft" && (
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
              )}
              {/* Delete Draft only */}
              {canDelete && status === "Draft" && (
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleting(r)}><Trash2 className="h-3.5 w-3.5" /></Button>
              )}
              {!canEdit && !canDelete && (
                <Button variant="ghost" size="sm" onClick={() => navigate(`/release-records/${(r as any).id}`)}>{t("common.view")}</Button>
              )}
            </div>
          );
        }}
      />

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={v => { if (!v) { setOpen(false); setEditing(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? (isBn ? "মুক্তির রেকর্ড সম্পাদনা" : "Edit Release Record") : (isBn ? "নতুন মুক্তির রেকর্ড" : "New Release Record")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitForm} className="space-y-4">
            {!editing && (
              <div>
                <Label>{isBn ? "শিশু *" : "Child *"}</Label>
                <Select value={form.childId} onValueChange={v => setForm(f => ({ ...f, childId: v }))}>
                  <SelectTrigger><SelectValue placeholder={isBn ? "শিশু বাছুন" : "Select child"} /></SelectTrigger>
                  <SelectContent>{children.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.fullName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isBn ? "মুক্তির তারিখ *" : "Release Date *"}</Label>
                <Input type="date" value={form.releaseDate} onChange={e => setForm(f => ({ ...f, releaseDate: e.target.value }))} required />
              </div>
              <div>
                <Label>{isBn ? "মুক্তির ধরন *" : "Release Type *"}</Label>
                <Select value={form.releaseType} onValueChange={v => setForm(f => ({ ...f, releaseType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{RELEASE_TYPES.map(ty => <SelectItem key={ty} value={ty}>{RELEASE_LABEL[ty] ?? ty}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{isBn ? "যার কাছে হস্তান্তর" : "Handed Over To"}</Label>
              <Input value={form.handedOverTo} onChange={e => setForm(f => ({ ...f, handedOverTo: e.target.value }))} />
            </div>
            <div>
              <Label>{isBn ? "মন্তব্য" : "Remarks"}</Label>
              <Textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={createRecord.isPending || updateMutation.isPending}>
                {editing ? (isBn ? "আপডেট করুন" : "Update") : (isBn ? "রেকর্ড তৈরি করুন" : "Create Record")}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditing(null); }}>{isBn ? "বাতিল" : "Cancel"}</Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {isBn ? "রেকর্ড তৈরির পরে জমা দিন অনুমোদনের জন্য।" : "After creating, submit the record for superintendent approval."}
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Approve Confirm Dialog */}
      <Dialog open={!!actionTarget && actionType === "approve"} onOpenChange={v => { if (!v) { setActionTarget(null); setActionType(null); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{isBn ? "মুক্তি অনুমোদন করুন" : "Approve Release"}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            {isBn
              ? `"${(actionTarget as any)?.childName}" এর মুক্তি অনুমোদন করলে শিশুর অবস্থা "মুক্তিপ্রাপ্ত" হয়ে যাবে।`
              : `Approving will mark "${(actionTarget as any)?.childName}" as Released. This cannot be undone.`}
          </p>
          <div className="flex gap-2 mt-4">
            <Button className="flex-1 bg-green-700 hover:bg-green-800" onClick={() => actionMutation.mutate({ id: (actionTarget as any).id, action: "approve" })} disabled={actionMutation.isPending}>
              <CheckCircle2 className="h-4 w-4 mr-1" />{isBn ? "অনুমোদন দিন" : "Approve"}
            </Button>
            <Button variant="outline" onClick={() => { setActionTarget(null); setActionType(null); }}>{isBn ? "বাতিল" : "Cancel"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!actionTarget && actionType === "reject"} onOpenChange={v => { if (!v) { setActionTarget(null); setActionType(null); setRejectNote(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{isBn ? "মুক্তি প্রত্যাখ্যান করুন" : "Reject Release"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{isBn ? "প্রত্যাখ্যানের কারণ লিখুন (বাধ্যতামূলক):" : "Provide a reason for rejection (required):"}</p>
            <Textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder={isBn ? "কারণ লিখুন..." : "Enter reason..."} />
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="destructive" className="flex-1" disabled={!rejectNote.trim() || actionMutation.isPending} onClick={() => actionMutation.mutate({ id: (actionTarget as any).id, action: "reject", note: rejectNote })}>
              <XCircle className="h-4 w-4 mr-1" />{isBn ? "প্রত্যাখ্যান করুন" : "Reject"}
            </Button>
            <Button variant="outline" onClick={() => { setActionTarget(null); setActionType(null); setRejectNote(""); }}>{isBn ? "বাতিল" : "Cancel"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleting} onOpenChange={v => { if (!v) setDeleting(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{isBn ? "মুক্তির রেকর্ড মুছুন" : "Delete Release Record"}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{isBn ? `"${(deleting as any)?.releaseId}" মুছে ফেলতে চান?` : `Delete "${(deleting as any)?.releaseId}"?`}</p>
          <div className="flex gap-2 mt-4">
            <Button variant="destructive" onClick={() => deleteMutation.mutate((deleting as any).id)} disabled={deleteMutation.isPending}>{isBn ? "মুছুন" : "Delete"}</Button>
            <Button variant="outline" onClick={() => setDeleting(null)}>{isBn ? "বাতিল" : "Cancel"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
