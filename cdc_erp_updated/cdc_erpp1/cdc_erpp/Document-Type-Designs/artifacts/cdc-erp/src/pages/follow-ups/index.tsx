import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useListFollowUps, useCreateFollowUp, useListChildren, getListFollowUpsQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Clock, Pencil, Trash2 } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/DataTable";
import { useAuth, hasRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const VISIT_TYPES = ["Home", "Phone", "Office", "Community"];
const EMPTY_FORM = { childId: "", followUpDate: "", visitType: "Home", observation: "", nextAction: "" };

export default function FollowUpsList() {
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { user } = useAuth();
  const { toast } = useToast();
  const canManage = hasRole(user, "Super Admin", "Center Admin");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: followUps = [], isLoading } = useListFollowUps({}, { query: { queryKey: getListFollowUpsQueryKey({}) } });
  const { data: childrenResp } = useListChildren({}, { query: { queryKey: [] } });
  const children = childrenResp?.data ?? [];
  const createFollowUp = useCreateFollowUp();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      fetch(`/api/follow-ups/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data }) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListFollowUpsQueryKey({}) }); setEditing(null); toast({ title: isBn ? "আপডেট হয়েছে" : "Updated" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/follow-ups/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListFollowUpsQueryKey({}) }); setDeleting(null); toast({ title: isBn ? "মুছে ফেলা হয়েছে" : "Deleted" }); },
  });

  const VISIT_LABEL: Record<string, string> = isBn ? { Home: "বাড়ি পরিদর্শন", Phone: "ফোনে যোগাযোগ", Office: "অফিস ভিজিট", Community: "কমিউনিটি" } : Object.fromEntries(VISIT_TYPES.map(v => [v, v]));

  function openEdit(r: any) {
    setForm({ childId: String(r.childId), followUpDate: r.followUpDate ?? "", visitType: r.visitType ?? "Home", observation: r.observation ?? "", nextAction: r.nextAction ?? "" });
    setEditing(r);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
      ...form, 
      childId: parseInt(form.childId),
      followUpDate: form.followUpDate || null
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createFollowUp.mutate({ data: payload } as any, { 
        onSuccess: () => { 
          queryClient.invalidateQueries({ queryKey: getListFollowUpsQueryKey({}) }); 
          setOpen(false); 
          setForm(EMPTY_FORM); 
          toast({ title: isBn ? "সফলভাবে সংরক্ষিত" : "Saved successfully" });
        },
        onError: () => {
          toast({ title: isBn ? "সংরক্ষণ ব্যর্থ" : "Save failed", variant: "destructive" });
        }
      });
    }
  };

  type FRow = (typeof followUps)[number];
  const columns: ColumnDef<FRow>[] = [
    { key: "followUpId", label: "Follow-up ID", labelBn: "ফলো-আপ আইডি", filterType: "text", exportValue: r => r.followUpId ?? "", render: r => <span className="font-mono text-xs">{r.followUpId}</span> },
    { key: "childName", label: "Child", labelBn: "শিশু", filterType: "text", exportValue: r => (r as any).childName ?? `#${r.childId}`, render: r => <span className="font-medium">{(r as any).childName || `#${r.childId}`}</span> },
    { key: "followUpDate", label: "Date", labelBn: "তারিখ", exportValue: r => r.followUpDate ?? "" },
    { key: "visitType", label: "Type", labelBn: "ধরন", filterType: "select", filterOptions: VISIT_TYPES.map(v => ({ value: v, label: v, labelBn: VISIT_LABEL[v] ?? v })), exportValue: r => r.visitType ?? "", render: r => <span className={`px-2 py-1 rounded-full text-xs ${r.visitType === "Home" ? "bg-teal-50 text-teal-700" : "bg-blue-50 text-blue-700"}`}>{VISIT_LABEL[r.visitType ?? ""] ?? r.visitType}</span> },
    { key: "observation", label: "Observations", labelBn: "পর্যবেক্ষণ", exportValue: r => r.observation ?? "", render: r => <span className="max-w-xs truncate block">{r.observation || "—"}</span> },
    { key: "nextAction", label: "Next Action", labelBn: "পরবর্তী পদক্ষেপ", exportValue: r => r.nextAction ?? "", render: r => <span className="max-w-xs truncate block">{r.nextAction || "—"}</span> },
  ];

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>{isBn ? "শিশু *" : "Child *"}</Label>
        <Select value={form.childId} onValueChange={v => setForm(f => ({ ...f, childId: v }))}>
          <SelectTrigger><SelectValue placeholder={isBn ? "শিশু বাছুন" : "Select child"} /></SelectTrigger>
          <SelectContent>{children.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.fullName}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>{t("followUps.followUpDate")} *</Label><Input type="date" value={form.followUpDate} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} required /></div>
        <div>
          <Label>{t("followUps.visitType")}</Label>
          <Select value={form.visitType} onValueChange={v => setForm(f => ({ ...f, visitType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{VISIT_TYPES.map(v => <SelectItem key={v} value={v}>{VISIT_LABEL[v] ?? v}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>{t("followUps.observations")}</Label><Textarea value={form.observation} onChange={e => setForm(f => ({ ...f, observation: e.target.value }))} /></div>
      <div><Label>{t("followUps.nextAction")}</Label><Textarea value={form.nextAction} onChange={e => setForm(f => ({ ...f, nextAction: e.target.value }))} /></div>
      <Button type="submit" className="w-full" disabled={createFollowUp.isPending || updateMutation.isPending}>
        {editing ? (isBn ? "আপডেট করুন" : "Update") : (isBn ? "ফলো-আপ সংরক্ষণ করুন" : "Save Follow-up")}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("followUps.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{isBn ? "মুক্তি পরবর্তী পর্যবেক্ষণ ও ফলো-আপ রেকর্ড" : "Post-release monitoring and follow-up records"}</p>
        </div>
        {canManage && (
          <Dialog open={open && !editing} onOpenChange={v => { if (!v) setOpen(false); else { setEditing(null); setForm(EMPTY_FORM); setOpen(true); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-[#166534] hover:bg-[#0d4427]"><Plus className="h-4 w-4" /> {isBn ? "নতুন ফলো-আপ" : "New Follow-up"}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{isBn ? "নতুন ফলো-আপ রেকর্ড" : "New Follow-up Record"}</DialogTitle></DialogHeader>
              {FormContent()}
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DataTable
        columns={columns} data={followUps} isLoading={isLoading} isBn={isBn}
        exportTitle="Follow-ups" exportTitleBn="ফলো-আপ তালিকা"
        emptyText="No follow-up records found." emptyTextBn="কোনো ফলো-আপ রেকর্ড নেই।"
        onRowClick={r => navigate(`/follow-ups/${r.id}`)}
        actions={canManage ? r => (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleting(r)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        ) : undefined}
      />

      {editing && (
        <Dialog open={!!editing} onOpenChange={v => { if (!v) setEditing(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{isBn ? "ফলো-আপ সম্পাদনা" : "Edit Follow-up"}</DialogTitle></DialogHeader>
            {FormContent()}
          </DialogContent>
        </Dialog>
      )}

      {deleting && (
        <Dialog open={!!deleting} onOpenChange={v => { if (!v) setDeleting(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{isBn ? "ফলো-আপ মুছুন" : "Delete Follow-up"}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{isBn ? `"${(deleting as any).followUpId}" মুছে ফেলতে চান?` : `Delete "${(deleting as any).followUpId}"?`}</p>
            <div className="flex gap-2 mt-4">
              <Button variant="destructive" onClick={() => deleteMutation.mutate((deleting as any).id)} disabled={deleteMutation.isPending}>{isBn ? "মুছুন" : "Delete"}</Button>
              <Button variant="outline" onClick={() => setDeleting(null)}>{isBn ? "বাতিল" : "Cancel"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
