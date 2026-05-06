import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useListRiskAssessments, useCreateRiskAssessment, useListChildren, getListRiskAssessmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, ShieldAlert, Pencil, Trash2 } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/DataTable";
import { useAuth, hasRole, usePermission } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const riskColors: Record<string, string> = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};
const RISK_LEVELS = ["Low", "Medium", "High"];
const COUNSELING_STATUS_OPTIONS = ["চলমান", "চলমান নয়"];
const EMPTY_FORM = { childId: "", assessmentDate: "", assessedBy: "", previousOccupation: "", childNature: "", communicationSkill: "", communicationWithGuardian: "", educationTrainingInfo: "", childCounselingStatus: "চলমান", familyCounselingStatus: "চলমান", recreationArrangement: "", otherRehabilitationInfo: "", abuseRisk: "Low", traffickingRisk: "Low", reoffendingRisk: "Low", selfHarmRisk: "Low", overallRiskLevel: "Low", immediateActionRequired: false, protectionMeasures: "", status: "Draft" };

export default function RiskAssessmentsList() {
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { user } = useAuth();
  const { toast } = useToast();
  const canView   = usePermission("risk-assessments", "view");
  const canCreate = usePermission("risk-assessments", "create");
  const canEdit   = usePermission("risk-assessments", "edit");
  const canDelete = usePermission("risk-assessments", "delete");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: assessments = [], isLoading } = useListRiskAssessments({}, { query: { queryKey: getListRiskAssessmentsQueryKey({}) } });
  const { data: childrenResp } = useListChildren({}, { query: { queryKey: [] } });
  const children = childrenResp?.data ?? [];
  const selectedChild = children.find((child) => String(child.id) === form.childId) as any;
  const createAssessment = useCreateRiskAssessment();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const r = await fetch(`/api/risk-assessments/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await r.json();
      if (!r.ok) throw new Error(json.message || json.error || "Failed to update");
      return json;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListRiskAssessmentsQueryKey({}) }); setEditing(null); toast({ title: isBn ? "আপডেট হয়েছে" : "Updated" }); },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/risk-assessments/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListRiskAssessmentsQueryKey({}) }); setDeleting(null); toast({ title: isBn ? "মুছে ফেলা হয়েছে" : "Deleted" }); },
  });

  const RISK_LABEL: Record<string, string> = isBn ? { Low: "কম", Medium: "মাঝারি", High: "উচ্চ" } : { Low: "Low", Medium: "Medium", High: "High" };

  const RISK_FIELDS: Array<{ key: keyof typeof EMPTY_FORM; label: string }> = [
    { key: "abuseRisk", label: t("riskAssessments.abuseRisk") },
    { key: "traffickingRisk", label: t("riskAssessments.traffickingRisk") },
    { key: "reoffendingRisk", label: t("riskAssessments.reoffendingRisk") },
    { key: "selfHarmRisk", label: t("riskAssessments.selfHarmRisk") },
  ];

  function openEdit(r: any) {
    const parsedDate = r.assessmentDate ? new Date(r.assessmentDate).toISOString().split("T")[0] : "";
    setForm({ childId: String(r.childId), assessmentDate: parsedDate, assessedBy: r.assessedBy ?? "", previousOccupation: r.previousOccupation ?? "", childNature: r.childNature ?? "", communicationSkill: r.communicationSkill ?? "", communicationWithGuardian: r.communicationWithGuardian ?? "", educationTrainingInfo: r.educationTrainingInfo ?? "", childCounselingStatus: r.childCounselingStatus ?? "চলমান", familyCounselingStatus: r.familyCounselingStatus ?? "চলমান", recreationArrangement: r.recreationArrangement ?? "", otherRehabilitationInfo: r.otherRehabilitationInfo ?? "", abuseRisk: r.abuseRisk ?? "Low", traffickingRisk: r.traffickingRisk ?? "Low", reoffendingRisk: r.reoffendingRisk ?? "Low", selfHarmRisk: r.selfHarmRisk ?? "Low", overallRiskLevel: r.overallRiskLevel ?? "Low", immediateActionRequired: !!r.immediateActionRequired, protectionMeasures: r.protectionMeasures ?? "", status: r.status ?? "Draft" });
    setEditing(r);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payloadData = { ...form, childId: parseInt(form.childId) };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payloadData });
    } else {
      createAssessment.mutate({ data: payloadData as any }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListRiskAssessmentsQueryKey({}) }); setOpen(false); setForm(EMPTY_FORM); } });
    }
  };

  type ARRow = (typeof assessments)[number];
  const mapStatusBn = (s: string) => s === "Draft" ? "খসড়া" : s === "Submitted" ? "দাখিলকৃত" : s === "Reviewed" ? "পর্যালোচিত" : s;
  const columns: ColumnDef<ARRow>[] = [
    { key: "riskId", label: "Assessment ID", labelBn: "মূল্যায়ন আইডি", filterType: "text", exportValue: r => r.riskId ?? "", render: r => <span className="font-mono text-xs">{r.riskId}</span> },
    { key: "childName", label: "Child", labelBn: "শিশু", filterType: "text", exportValue: r => (r as any).childName ?? `#${r.childId}`, render: r => <span className="font-medium">{(r as any).childName || `#${r.childId}`}</span> },
    { key: "assessmentDate", label: "Date", labelBn: "তারিখ", exportValue: r => r.assessmentDate ?? "" },
    { key: "assessedBy", label: "Assessed By", labelBn: "মূল্যায়নকারী", filterType: "text", exportValue: r => r.assessedBy ?? "", render: r => r.assessedBy || "—" },
    { key: "overallRiskLevel", label: "Overall Risk", labelBn: "সামগ্রিক ঝুঁকি", filterType: "select", filterOptions: RISK_LEVELS.map(l => ({ value: l, label: l, labelBn: RISK_LABEL[l] ?? l })), exportValue: r => r.overallRiskLevel ? (RISK_LABEL[r.overallRiskLevel] ?? r.overallRiskLevel) : "", render: r => r.overallRiskLevel ? <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColors[r.overallRiskLevel] || "bg-gray-100 text-gray-700"}`}>{RISK_LABEL[r.overallRiskLevel] ?? r.overallRiskLevel}</span> : <span className="text-muted-foreground">—</span> },
    { key: "status", label: "Status", labelBn: "অবস্থা", filterType: "select", filterOptions: ["Draft", "Submitted", "Reviewed"].map(s => ({ value: s, label: s, labelBn: mapStatusBn(s) })), exportValue: r => r.status ? (isBn ? mapStatusBn(r.status) : r.status) : "", render: r => <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">{isBn ? mapStatusBn(r.status ?? "") : r.status}</span> },
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
        <div><Label>{t("riskAssessments.assessmentDate")} *</Label><Input type="date" value={form.assessmentDate} onChange={e => setForm(f => ({ ...f, assessmentDate: e.target.value }))} required /></div>
        <div><Label>{t("riskAssessments.assessedBy")}</Label><Input value={form.assessedBy} onChange={e => setForm(f => ({ ...f, assessedBy: e.target.value }))} /></div>
      </div>
      <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
        <div>
          <Label className="text-sm font-semibold">{t("riskAssessments.rehabilitationInfo")}</Label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>{t("riskAssessments.previousOccupation")}</Label><Input value={form.previousOccupation} onChange={e => setForm(f => ({ ...f, previousOccupation: e.target.value }))} /></div>
          <div><Label>{t("riskAssessments.childNature")}</Label><Input value={form.childNature} onChange={e => setForm(f => ({ ...f, childNature: e.target.value }))} /></div>
          <div><Label>{t("riskAssessments.communicationSkill")}</Label><Input value={form.communicationSkill} onChange={e => setForm(f => ({ ...f, communicationSkill: e.target.value }))} /></div>
          <div><Label>{t("riskAssessments.communicationWithGuardian")}</Label><Input value={form.communicationWithGuardian} onChange={e => setForm(f => ({ ...f, communicationWithGuardian: e.target.value }))} /></div>
          <div className="md:col-span-2">
            <Label>{t("riskAssessments.educationAndTraining")}</Label>
            <Input
              value={form.educationTrainingInfo}
              onChange={e => setForm(f => ({ ...f, educationTrainingInfo: e.target.value }))}
              onFocus={() => {
                if (!form.educationTrainingInfo) {
                  const next = [selectedChild?.educationLevel, selectedChild?.skills].filter(Boolean).join(" / ");
                  if (next) setForm(f => ({ ...f, educationTrainingInfo: next }));
                }
              }}
            />
          </div>
          <div>
            <Label>{t("riskAssessments.childCounseling")}</Label>
            <Select value={form.childCounselingStatus} onValueChange={v => setForm(f => ({ ...f, childCounselingStatus: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{COUNSELING_STATUS_OPTIONS.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("riskAssessments.familyCounseling")}</Label>
            <Select value={form.familyCounselingStatus} onValueChange={v => setForm(f => ({ ...f, familyCounselingStatus: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{COUNSELING_STATUS_OPTIONS.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>{t("riskAssessments.recreationArrangement")}</Label><Input value={form.recreationArrangement} onChange={e => setForm(f => ({ ...f, recreationArrangement: e.target.value }))} /></div>
          <div><Label>{t("riskAssessments.otherRehabilitation")}</Label><Input value={form.otherRehabilitationInfo} onChange={e => setForm(f => ({ ...f, otherRehabilitationInfo: e.target.value }))} /></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {RISK_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <Label className="text-xs">{label}</Label>
            <Select value={String(form[key as keyof typeof form])} onValueChange={v => setForm(f => ({ ...f, [key]: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{RISK_LEVELS.map(l => <SelectItem key={l} value={l}>{RISK_LABEL[l] ?? l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        ))}
      </div>
      <div>
        <Label>{t("riskAssessments.overallRiskLevel")} *</Label>
        <Select value={form.overallRiskLevel} onValueChange={v => setForm(f => ({ ...f, overallRiskLevel: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{RISK_LEVELS.map(l => <SelectItem key={l} value={l}>{RISK_LABEL[l] ?? l}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox checked={form.immediateActionRequired} onCheckedChange={v => setForm(f => ({ ...f, immediateActionRequired: !!v }))} />
        <Label>{t("riskAssessments.immediateAction")}</Label>
      </div>
      <div><Label>{t("riskAssessments.protectionMeasures")}</Label><Textarea value={form.protectionMeasures} onChange={e => setForm(f => ({ ...f, protectionMeasures: e.target.value }))} /></div>
      <Button type="submit" className="w-full" disabled={createAssessment.isPending || updateMutation.isPending}>
        {editing ? (isBn ? "আপডেট করুন" : "Update") : (isBn ? "মূল্যায়ন সংরক্ষণ করুন" : "Save Assessment")}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("riskAssessments.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{isBn ? "শিশু সুরক্ষার ঝুঁকি পরিমাপ ও পর্যবেক্ষণ" : "Child protection risk measurement and monitoring"}</p>
        </div>
        {canCreate && (
          <Dialog open={open && !editing} onOpenChange={v => { if (!v) setOpen(false); else { setEditing(null); setForm(EMPTY_FORM); setOpen(true); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-[#166534] hover:bg-[#0d4427]"><Plus className="h-4 w-4" /> {isBn ? "নতুন মূল্যায়ন" : "New Assessment"}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{isBn ? "নতুন ঝুঁকি মূল্যায়ন" : "New Risk Assessment"}</DialogTitle></DialogHeader>
              {FormContent()}
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DataTable
        columns={columns} data={assessments} isLoading={isLoading} isBn={isBn}
        exportTitle="Risk Assessments" exportTitleBn="ঝুঁকি মূল্যায়ন"
        emptyText="No risk assessments found." emptyTextBn="কোনো ঝুঁকি মূল্যায়ন নেই।"
        onRowClick={r => navigate(`/risk-assessments/${r.id}`)}
        actions={(r) => (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {canEdit && (
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(r)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={() => setDeleting(r)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {!canEdit && !canDelete && (
              <Button variant="ghost" size="sm" onClick={() => navigate(`/risk-assessments/${r.id}`)}>
                {isBn ? "দেখুন" : "View"}
              </Button>
            )}
          </div>
        )}
      />

      {editing && (
        <Dialog open={!!editing} onOpenChange={v => { if (!v) setEditing(null); }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{isBn ? "ঝুঁকি মূল্যায়ন সম্পাদনা" : "Edit Risk Assessment"}</DialogTitle></DialogHeader>
            {FormContent()}
          </DialogContent>
        </Dialog>
      )}

      {deleting && (
        <Dialog open={!!deleting} onOpenChange={v => { if (!v) setDeleting(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{isBn ? "মূল্যায়ন মুছুন" : "Delete Assessment"}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{isBn ? `"${(deleting as any).riskId}" মুছে ফেলতে চান?` : `Delete "${(deleting as any).riskId}"?`}</p>
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
