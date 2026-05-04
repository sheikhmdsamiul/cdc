import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useListHealthAssessments, useCreateHealthAssessment, useListChildren, getListHealthAssessmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Heart, Pencil, Trash2 } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/DataTable";
import { useAuth, hasRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const conditionColors: Record<string, string> = {
  Normal: "bg-green-100 text-green-700", Weak: "bg-amber-100 text-amber-700", Critical: "bg-red-100 text-red-700",
};

const EMPTY_FORM = {
  childId: "",
  assessmentDate: "",
  height: "",
  weight: "",
  physicalCondition: "Normal",
  mentalCondition: "",
  doctorName: "",
  visibleInjury: false,
  injuryDescription: "",
  chronicDisease: "",
  congenitalDiseaseInfo: "",
  hasHereditaryDiseaseHistory: false,
  hereditaryDiseaseDetails: "",
  hasDisability: false,
  disability: "",
  substanceAbuse: false,
  gbvSurvivor: false,
  ongoingMedication: "",
  immeditateTreatmentRequired: false,
  hospitalReferralNeeded: false,
  recommendation: "",
};

export default function HealthList() {
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

  const { data: assessments = [], isLoading } = useListHealthAssessments({}, { query: { queryKey: getListHealthAssessmentsQueryKey({}) } });
  const { data: childrenResp } = useListChildren({}, { query: { queryKey: [] } });
  const children = childrenResp?.data ?? [];
  const createAssessment = useCreateHealthAssessment();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      fetch(`/api/health-assessments/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListHealthAssessmentsQueryKey({}) }); setEditing(null); setOpen(false); toast({ title: isBn ? "আপডেট হয়েছে" : "Updated" }); },
    onError: (error: any) => {
      toast({
        title: isBn ? "আপডেট ব্যর্থ হয়েছে" : "Update failed",
        description: error?.message || (isBn ? "স্বাস্থ্য মূল্যায়ন আপডেট করা যায়নি।" : "Could not update the health assessment."),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/health-assessments/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListHealthAssessmentsQueryKey({}) }); setDeleting(null); toast({ title: isBn ? "মুছে ফেলা হয়েছে" : "Deleted" }); },
  });

  const CONDITION_LABEL: Record<string, string> = isBn
    ? { Normal: "স্বাভাবিক", Weak: "দুর্বল", Critical: "জরুরি" }
    : { Normal: "Normal", Weak: "Weak", Critical: "Critical" };

  function openEdit(r: any) {
    setForm({
      childId: String(r.childId),
      assessmentDate: r.assessmentDate ?? "",
      height: r.height ? String(r.height) : "",
      weight: r.weight ? String(r.weight) : "",
      physicalCondition: r.physicalCondition ?? "Normal",
      mentalCondition: r.mentalCondition ?? "",
      doctorName: r.doctorName ?? "",
      visibleInjury: !!r.visibleInjury,
      injuryDescription: r.injuryDescription ?? "",
      chronicDisease: r.chronicDisease ?? "",
      congenitalDiseaseInfo: r.congenitalDiseaseInfo ?? "",
      hasHereditaryDiseaseHistory: !!r.hasHereditaryDiseaseHistory,
      hereditaryDiseaseDetails: r.hereditaryDiseaseDetails ?? "",
      hasDisability: !!r.hasDisability,
      disability: r.disability ?? "",
      substanceAbuse: !!r.substanceAbuse,
      gbvSurvivor: !!r.gbvSurvivor,
      ongoingMedication: r.ongoingMedication ?? "",
      immeditateTreatmentRequired: !!r.immeditateTreatmentRequired,
      hospitalReferralNeeded: !!r.hospitalReferralNeeded,
      recommendation: r.recommendation ?? "",
    });
    setEditing(r);
    setOpen(true);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.childId) {
      toast({
        title: isBn ? "শিশু নির্বাচন করুন" : "Select a child",
        description: isBn ? "সংরক্ষণ করার আগে একটি শিশু নির্বাচন করতে হবে।" : "Please choose a child before saving.",
        variant: "destructive",
      });
      return;
    }
    const data = { ...form, childId: parseInt(form.childId), height: form.height ? parseFloat(form.height) : undefined, weight: form.weight ? parseFloat(form.weight) : undefined };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createAssessment.mutate({ data } as any, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListHealthAssessmentsQueryKey({}) });
          setOpen(false);
          setForm(EMPTY_FORM);
          toast({ title: isBn ? "সংরক্ষিত হয়েছে" : "Saved" });
        },
        onError: (error: any) => {
          toast({
            title: isBn ? "সংরক্ষণ ব্যর্থ হয়েছে" : "Save failed",
            description: error?.message || (isBn ? "স্বাস্থ্য মূল্যায়ন সংরক্ষণ করা যায়নি।" : "Could not save the health assessment."),
            variant: "destructive",
          });
        },
      });
    }
  };

  type HRow = (typeof assessments)[number];
  const columns: ColumnDef<HRow>[] = [
    { key: "assessmentId", label: "Assessment ID", labelBn: "মূল্যায়ন আইডি", filterType: "text", exportValue: r => r.assessmentId ?? "", render: r => <span className="font-mono text-xs">{r.assessmentId}</span> },
    { key: "childName", label: "Child", labelBn: "শিশু", filterType: "text", exportValue: r => (r as any).childName ?? `#${r.childId}`, render: r => <span className="font-medium">{(r as any).childName || `#${r.childId}`}</span> },
    { key: "assessmentDate", label: "Date", labelBn: "তারিখ", exportValue: r => r.assessmentDate ?? "" },
    { key: "doctorName", label: "Doctor", labelBn: "চিকিৎসক", filterType: "text", exportValue: r => r.doctorName ?? "", render: r => r.doctorName || "—" },
    { key: "physicalCondition", label: "Condition", labelBn: "অবস্থা", filterType: "select", filterOptions: ["Normal", "Weak", "Critical"].map(v => ({ value: v, label: v, labelBn: CONDITION_LABEL[v] ?? v })), exportValue: r => r.physicalCondition ?? "", render: r => r.physicalCondition ? <span className={`px-2 py-1 rounded-full text-xs font-medium ${conditionColors[r.physicalCondition] || "bg-gray-100 text-gray-700"}`}>{CONDITION_LABEL[r.physicalCondition] ?? r.physicalCondition}</span> : <span className="text-muted-foreground">—</span> },
    { key: "bmi", label: "BMI", labelBn: "বিএমআই", exportValue: r => r.bmi ?? "", render: r => r.bmi ? (r.bmi as number).toFixed(1) : "—" },
    { key: "hospitalReferralNeeded", label: "Referral", labelBn: "রেফারেল", exportValue: r => r.hospitalReferralNeeded ? "Yes" : "No", render: r => r.hospitalReferralNeeded ? <span className="text-red-600 text-xs font-medium">{t("common.yes")}</span> : <span className="text-muted-foreground text-xs">{t("common.no")}</span> },
  ];

  const BooleanChoice = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-6 mt-2">
        <button type="button" className="flex items-center gap-2" onClick={() => onChange(true)}>
          <Checkbox checked={value === true} onCheckedChange={() => onChange(true)} />
          <span>{isBn ? "হ্যাঁ" : "Yes"}</span>
        </button>
        <button type="button" className="flex items-center gap-2" onClick={() => onChange(false)}>
          <Checkbox checked={value === false} onCheckedChange={() => onChange(false)} />
          <span>{isBn ? "না" : "No"}</span>
        </button>
      </div>
    </div>
  );

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
        <div><Label>{t("health.assessmentDate")} *</Label><Input type="date" value={form.assessmentDate} onChange={e => setForm(f => ({ ...f, assessmentDate: e.target.value }))} required /></div>
        <div><Label>{t("health.examiningDoctor")}</Label><Input value={form.doctorName} onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>{t("health.height")}</Label><Input type="number" step="0.1" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} /></div>
        <div><Label>{t("health.weight")}</Label><Input type="number" step="0.1" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} /></div>
      </div>
      <div>
        <Label>{t("health.physicalCondition")}</Label>
        <Select value={form.physicalCondition} onValueChange={v => setForm(f => ({ ...f, physicalCondition: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{["Normal", "Weak", "Critical"].map(s => <SelectItem key={s} value={s}>{CONDITION_LABEL[s] ?? s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label>{t("health.mentalCondition")}</Label><Input value={form.mentalCondition} onChange={e => setForm(f => ({ ...f, mentalCondition: e.target.value }))} /></div>
      <div className="flex items-center gap-2">
        <Checkbox checked={form.visibleInjury} onCheckedChange={v => setForm(f => ({ ...f, visibleInjury: !!v }))} />
        <Label>{t("health.visibleInjury")}</Label>
      </div>
      {form.visibleInjury && <div><Label>{t("health.injuryDescription")}</Label><Textarea value={form.injuryDescription} onChange={e => setForm(f => ({ ...f, injuryDescription: e.target.value }))} /></div>}
      <div><Label>{t("health.chronicDisease")}</Label><Input value={form.chronicDisease} onChange={e => setForm(f => ({ ...f, chronicDisease: e.target.value }))} /></div>
      <div><Label>{t("health.congenitalDiseaseInfo")}</Label><Textarea value={form.congenitalDiseaseInfo} onChange={e => setForm(f => ({ ...f, congenitalDiseaseInfo: e.target.value }))} /></div>
      <BooleanChoice
        label={t("health.hereditaryDiseaseHistory")}
        value={form.hasHereditaryDiseaseHistory}
        onChange={value => setForm(f => ({ ...f, hasHereditaryDiseaseHistory: value, hereditaryDiseaseDetails: value ? f.hereditaryDiseaseDetails : "" }))}
      />
      {form.hasHereditaryDiseaseHistory && (
        <div><Label>{t("health.hereditaryDiseaseDetails")}</Label><Textarea value={form.hereditaryDiseaseDetails} onChange={e => setForm(f => ({ ...f, hereditaryDiseaseDetails: e.target.value }))} /></div>
      )}
      <BooleanChoice
        label={t("health.hasDisability")}
        value={form.hasDisability}
        onChange={value => setForm(f => ({ ...f, hasDisability: value, disability: value ? f.disability : "" }))}
      />
      {form.hasDisability && (
        <div><Label>{t("health.disability")}</Label><Input value={form.disability} onChange={e => setForm(f => ({ ...f, disability: e.target.value }))} /></div>
      )}
      <BooleanChoice
        label={t("health.substanceAbuse")}
        value={form.substanceAbuse}
        onChange={value => setForm(f => ({ ...f, substanceAbuse: value }))}
      />
      <BooleanChoice
        label={t("health.gbvSurvivor")}
        value={form.gbvSurvivor}
        onChange={value => setForm(f => ({ ...f, gbvSurvivor: value }))}
      />
      <div><Label>{t("health.ongoingMedication")}</Label><Input value={form.ongoingMedication} onChange={e => setForm(f => ({ ...f, ongoingMedication: e.target.value }))} /></div>
      <div className="flex gap-4">
        <div className="flex items-center gap-2"><Checkbox checked={form.immeditateTreatmentRequired} onCheckedChange={v => setForm(f => ({ ...f, immeditateTreatmentRequired: !!v }))} /><Label className="text-xs">{t("health.immediateTreatment")}</Label></div>
        <div className="flex items-center gap-2"><Checkbox checked={form.hospitalReferralNeeded} onCheckedChange={v => setForm(f => ({ ...f, hospitalReferralNeeded: !!v }))} /><Label className="text-xs">{t("health.hospitalReferral")}</Label></div>
      </div>
      <div><Label>{t("health.recommendation")}</Label><Textarea value={form.recommendation} onChange={e => setForm(f => ({ ...f, recommendation: e.target.value }))} /></div>
      <Button type="submit" className="w-full" disabled={createAssessment.isPending || updateMutation.isPending}>
        {editing ? (isBn ? "আপডেট করুন" : "Update") : (isBn ? "মূল্যায়ন সংরক্ষণ করুন" : "Save Assessment")}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("health.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{isBn ? "চিকিৎসা মূল্যায়ন ও স্বাস্থ্য পর্যবেক্ষণ রেকর্ড" : "Medical evaluations and health monitoring records"}</p>
        </div>
        {canManage && (
          <Dialog open={open && !editing} onOpenChange={v => { if (!v) setOpen(false); else { setEditing(null); setForm(EMPTY_FORM); setOpen(true); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-[#166534] hover:bg-[#0d4427]"><Plus className="h-4 w-4" /> {isBn ? "নতুন মূল্যায়ন" : "New Assessment"}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{isBn ? "নতুন স্বাস্থ্য মূল্যায়ন" : "New Health Assessment"}</DialogTitle></DialogHeader>
              <FormContent />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DataTable
        columns={columns} data={assessments} isLoading={isLoading} isBn={isBn}
        exportTitle="Health Assessments" exportTitleBn="স্বাস্থ্য মূল্যায়ন"
        emptyText="No assessments found." emptyTextBn="কোনো মূল্যায়ন পাওয়া যায়নি।"
        onRowClick={r => navigate(`/health/${r.id}`)}
        actions={canManage ? r => (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleting(r)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        ) : undefined}
      />

      {/* Edit Dialog */}
      {editing && (
        <Dialog open={!!editing} onOpenChange={v => { if (!v) { setEditing(null); setOpen(false); } }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{isBn ? "স্বাস্থ্য মূল্যায়ন সম্পাদনা" : "Edit Health Assessment"}</DialogTitle></DialogHeader>
            <FormContent />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete */}
      {deleting && (
        <Dialog open={!!deleting} onOpenChange={v => { if (!v) setDeleting(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{isBn ? "মুছে ফেলুন" : "Delete Assessment"}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{isBn ? `"${(deleting as any).assessmentId}" মুছে ফেলতে চান?` : `Delete "${(deleting as any).assessmentId}"?`}</p>
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
