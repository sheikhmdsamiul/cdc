import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useListCounselingSessions, useCreateCounselingSession, useListChildren, getListCounselingSessionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Activity, Pencil, Trash2 } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/DataTable";
import { useAuth, hasRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const outcomeColors: Record<string, string> = {
  Positive: "bg-green-100 text-green-700", Neutral: "bg-amber-100 text-amber-700", Negative: "bg-red-100 text-red-700",
};

const EMPTY_FORM = { childId: "", sessionDate: "", counselor: "", sessionType: "Individual", issuesDiscussed: "", observations: "", outcome: "Positive", nextSessionDate: "" };

export default function CounselingList() {
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

  const { data: sessions = [], isLoading } = useListCounselingSessions({}, { query: { queryKey: getListCounselingSessionsQueryKey({}) } });
  const { data: childrenResp } = useListChildren({}, { query: { queryKey: [] } });
  const children = childrenResp?.data ?? [];
  const createSession = useCreateCounselingSession();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      fetch(`/api/counseling-sessions/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCounselingSessionsQueryKey({}) }); setEditing(null); toast({ title: isBn ? "আপডেট হয়েছে" : "Updated" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/counseling-sessions/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCounselingSessionsQueryKey({}) }); setDeleting(null); toast({ title: isBn ? "মুছে ফেলা হয়েছে" : "Deleted" }); },
  });

  const OUTCOME_LABEL: Record<string, string> = isBn ? { Positive: "ইতিবাচক", Neutral: "নিরপেক্ষ", Negative: "নেতিবাচক" } : { Positive: "Positive", Neutral: "Neutral", Negative: "Negative" };
  const SESSION_TYPE_LABEL: Record<string, string> = isBn ? { Individual: "ব্যক্তিগত", Group: "দলগত", Family: "পারিবারিক" } : { Individual: "Individual", Group: "Group", Family: "Family" };

  function openEdit(r: any) {
    setForm({ childId: String(r.childId), sessionDate: r.sessionDate ?? "", counselor: r.counselor ?? "", sessionType: r.sessionType ?? "Individual", issuesDiscussed: r.issuesDiscussed ?? "", observations: r.observations ?? "", outcome: r.outcome ?? "Positive", nextSessionDate: r.nextSessionDate ?? "" });
    setEditing(r);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { 
      ...form, 
      childId: parseInt(form.childId),
      sessionDate: form.sessionDate || null,
      nextSessionDate: form.nextSessionDate || null
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createSession.mutate({ data: data as any }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCounselingSessionsQueryKey({}) }); setOpen(false); setForm(EMPTY_FORM); } });
    }
  };

  type SRow = (typeof sessions)[number];
  const columns: ColumnDef<SRow>[] = [
    { key: "sessionId", label: "Session ID", labelBn: "সেশন আইডি", filterType: "text", exportValue: r => r.sessionId ?? "", render: r => <span className="font-mono text-xs">{r.sessionId}</span> },
    { key: "childName", label: "Child", labelBn: "শিশু", filterType: "text", exportValue: r => (r as any).childName ?? `#${r.childId}`, render: r => <span className="font-medium">{(r as any).childName || `#${r.childId}`}</span> },
    { key: "sessionDate", label: "Session Date", labelBn: "সেশনের তারিখ", exportValue: r => r.sessionDate ?? "" },
    { key: "counselor", label: "Counselor", labelBn: "পরামর্শদাতা", filterType: "text", exportValue: r => r.counselor ?? "", render: r => r.counselor || "—" },
    { key: "sessionType", label: "Type", labelBn: "ধরন", filterType: "select", filterOptions: ["Individual", "Group", "Family"].map(t => ({ value: t, label: t, labelBn: SESSION_TYPE_LABEL[t] ?? t })), exportValue: r => r.sessionType ?? "", render: r => <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">{SESSION_TYPE_LABEL[r.sessionType ?? ""] ?? r.sessionType}</span> },
    { key: "outcome", label: "Outcome", labelBn: "ফলাফল", filterType: "select", filterOptions: ["Positive", "Neutral", "Negative"].map(o => ({ value: o, label: o, labelBn: OUTCOME_LABEL[o] ?? o })), exportValue: r => r.outcome ?? "", render: r => r.outcome ? <span className={`px-2 py-1 rounded-full text-xs font-medium ${outcomeColors[r.outcome] || "bg-gray-100 text-gray-700"}`}>{OUTCOME_LABEL[r.outcome] ?? r.outcome}</span> : <span className="text-muted-foreground">—</span> },
    { key: "nextSessionDate", label: "Next Session", labelBn: "পরবর্তী সেশন", exportValue: r => r.nextSessionDate ?? "", render: r => r.nextSessionDate || "—" },
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
        <div><Label>{t("counseling.sessionDate")} *</Label><Input type="date" value={form.sessionDate} onChange={e => setForm(f => ({ ...f, sessionDate: e.target.value }))} required /></div>
        <div><Label>{t("counseling.counselorName")}</Label><Input value={form.counselor} onChange={e => setForm(f => ({ ...f, counselor: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{t("counseling.sessionType")} *</Label>
          <Select value={form.sessionType} onValueChange={v => setForm(f => ({ ...f, sessionType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Individual", "Group", "Family"].map(s => <SelectItem key={s} value={s}>{SESSION_TYPE_LABEL[s] ?? s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t("counseling.sessionOutcome")}</Label>
          <Select value={form.outcome} onValueChange={v => setForm(f => ({ ...f, outcome: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Positive", "Neutral", "Negative"].map(s => <SelectItem key={s} value={s}>{OUTCOME_LABEL[s] ?? s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>{t("counseling.issuesDiscussed")}</Label><Textarea value={form.issuesDiscussed} onChange={e => setForm(f => ({ ...f, issuesDiscussed: e.target.value }))} /></div>
      <div><Label>{t("counseling.counselorObservations")}</Label><Textarea value={form.observations} onChange={e => setForm(f => ({ ...f, observations: e.target.value }))} /></div>
      <div><Label>{t("counseling.nextSessionDate")}</Label><Input type="date" value={form.nextSessionDate} onChange={e => setForm(f => ({ ...f, nextSessionDate: e.target.value }))} /></div>
      <Button type="submit" className="w-full" disabled={createSession.isPending || updateMutation.isPending}>
        {editing ? (isBn ? "আপডেট করুন" : "Update") : (isBn ? "সেশন সংরক্ষণ করুন" : "Save Session")}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("counseling.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{isBn ? "মনোবৈজ্ঞানিক পরামর্শ সেশনের রেকর্ড ও ফলাফল" : "Psychological counseling session records and outcomes"}</p>
        </div>
        {canManage && (
          <Dialog open={open && !editing} onOpenChange={v => { if (!v) setOpen(false); else { setEditing(null); setForm(EMPTY_FORM); setOpen(true); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-[#166534] hover:bg-[#0d4427]"><Plus className="h-4 w-4" /> {isBn ? "নতুন সেশন" : "New Session"}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{isBn ? "নতুন পরামর্শ সেশন" : "New Counseling Session"}</DialogTitle></DialogHeader>
              {FormContent()}
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DataTable
        columns={columns} data={sessions} isLoading={isLoading} isBn={isBn}
        exportTitle="Counseling Sessions" exportTitleBn="কাউন্সেলিং সেশন"
        emptyText="No sessions recorded." emptyTextBn="কোনো সেশন নথিভুক্ত নেই।"
        onRowClick={r => navigate(`/counseling/${r.id}`)}
        actions={canManage ? r => (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleting(r)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        ) : undefined}
      />

      {editing && (
        <Dialog open={!!editing} onOpenChange={v => { if (!v) setEditing(null); }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{isBn ? "পরামর্শ সেশন সম্পাদনা" : "Edit Counseling Session"}</DialogTitle></DialogHeader>
            {FormContent()}
          </DialogContent>
        </Dialog>
      )}

      {deleting && (
        <Dialog open={!!deleting} onOpenChange={v => { if (!v) setDeleting(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{isBn ? "সেশন মুছুন" : "Delete Session"}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{isBn ? `"${(deleting as any).sessionId}" মুছে ফেলতে চান?` : `Delete "${(deleting as any).sessionId}"?`}</p>
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
