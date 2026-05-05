import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  getListEducationPlansQueryKey,
  useCreateEducationPlan,
  useDeleteEducationPlan,
  useListChildren,
  useListEducationPlans,
  useUpdateEducationPlan,
} from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DataTable, type ColumnDef } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, hasRole, usePermission } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";

type ProgramType = "Admission Form" | "Education" | "Vocational" | "Skills Assessment";

const STATUS_OPTIONS = ["Planned", "Ongoing", "Completed", "Paused"];
const LEVEL_OPTIONS = ["Basic", "Emerging", "Intermediate", "Advanced"];

const EMPTY_FORM = {
  childId: "",
  programType: "Education" as ProgramType,
  admissionEligibleFor: "",
  selectedClass: "",
  selectedTraining: "",
  caseDetails: "",
  recommenderCaseWorkerName: "",
  recordTitle: "",
  status: "Planned",
  institutionName: "",
  startDate: "",
  endDate: "",
  educationLevel: "",
  boardOrCurriculum: "",
  learningGoals: "",
  tradeName: "",
  certificationName: "",
  weeklyHours: "",
  assessmentDate: "",
  assessorName: "",
  literacyLevel: "Basic",
  numeracyLevel: "Basic",
  digitalLiteracyLevel: "Basic",
  interestAreas: "",
  strengths: "",
  supportNeeds: "",
  progressNotes: "",
  recommendations: "",
};

function today() {
  return new Date().toISOString().split("T")[0];
}

export default function EducationSkillsPage() {
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canView   = usePermission("education", "view");
  const canCreate = usePermission("education", "create");
  const canEdit   = usePermission("education", "edit");
  const canDelete = usePermission("education", "delete");

  const activeTab: ProgramType = "Admission Form";
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, startDate: today(), assessmentDate: today() });

  const { data: plans = [], isLoading } = useListEducationPlans({}, {
    query: { queryKey: getListEducationPlansQueryKey({}) },
  });
  const { data: childrenResp } = useListChildren({}, { query: { queryKey: [] } });
  const children = childrenResp?.data ?? [];

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: () => fetch("/api/classes").then((res) => res.json()),
  });

  const { data: trainings = [] } = useQuery({
    queryKey: ["trainings"],
    queryFn: () => fetch("/api/trainings").then((res) => res.json()),
  });

  const createPlan = useCreateEducationPlan({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEducationPlansQueryKey({}) });
        setOpen(false);
        resetForm(activeTab);
        toast({ title: isBn ? "সংরক্ষিত হয়েছে" : "Saved" });
      },
    },
  });
  const updatePlan = useUpdateEducationPlan({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEducationPlansQueryKey({}) });
        setEditing(null);
        toast({ title: isBn ? "আপডেট হয়েছে" : "Updated" });
      },
    },
  });
  const deletePlan = useDeleteEducationPlan({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEducationPlansQueryKey({}) });
        setDeleting(null);
        toast({ title: isBn ? "মুছে ফেলা হয়েছে" : "Deleted" });
      },
    },
  });

  const filteredPlans = useMemo(
    () => plans.filter((plan) => (plan.programType as string) === "Admission Form"),
    [plans],
  );

  function resetForm(programType: ProgramType) {
    setForm({
      ...EMPTY_FORM,
      programType,
      startDate: today(),
      assessmentDate: today(),
    });
  }

  function programLabel(type: ProgramType) {
    if (!isBn) return type;
    if (type === "Admission Form") return "ভর্তি ফরম";
    if (type === "Education") return "শিক্ষা";
    if (type === "Vocational") return "বৃত্তিমূলক";
    return "দক্ষতা মূল্যায়ন";
  }

  function statusLabel(status?: string) {
    if (!status) return "—";
    if (!isBn) return status;
    return {
      Planned: "পরিকল্পিত",
      Ongoing: "চলমান",
      Completed: "সম্পন্ন",
      Paused: "স্থগিত",
    }[status] ?? status;
  }

  function levelLabel(level?: string) {
    if (!level) return "—";
    if (!isBn) return level;
    return {
      Basic: "প্রাথমিক",
      Emerging: "উদীয়মান",
      Intermediate: "মধ্যম",
      Advanced: "উন্নত",
    }[level] ?? level;
  }

  function openNewDialog() {
    setEditing(null);
    resetForm("Admission Form");
    setOpen(true);
  }

  function openEditDialog(row: any) {
    let sClass = "";
    let sTraining = "";
    if (row.admissionEligibleFor) {
      const parts = row.admissionEligibleFor.split(" / ");
      if (parts.length === 2) {
        sClass = parts[0];
        sTraining = parts[1];
      } else if (parts.length === 1) {
        sClass = parts[0]; // Fallback
      }
    }

    setForm({
      childId: String(row.childId),
      programType: "Admission Form",
      admissionEligibleFor: row.admissionEligibleFor ?? "",
      selectedClass: sClass,
      selectedTraining: sTraining,
      caseDetails: row.caseDetails ?? "",
      recommenderCaseWorkerName: row.recommenderCaseWorkerName ?? "",
      recordTitle: row.recordTitle ?? "",
      status: row.status ?? "Planned",
      institutionName: row.institutionName ?? "",
      startDate: row.startDate ?? today(),
      endDate: row.endDate ?? "",
      educationLevel: row.educationLevel ?? "",
      boardOrCurriculum: row.boardOrCurriculum ?? "",
      learningGoals: row.learningGoals ?? "",
      tradeName: row.tradeName ?? "",
      certificationName: row.certificationName ?? "",
      weeklyHours: row.weeklyHours != null ? String(row.weeklyHours) : "",
      assessmentDate: row.assessmentDate ?? row.startDate ?? today(),
      assessorName: row.assessorName ?? "",
      literacyLevel: row.literacyLevel ?? "Basic",
      numeracyLevel: row.numeracyLevel ?? "Basic",
      digitalLiteracyLevel: row.digitalLiteracyLevel ?? "Basic",
      interestAreas: row.interestAreas ?? "",
      strengths: row.strengths ?? "",
      supportNeeds: row.supportNeeds ?? "",
      progressNotes: row.progressNotes ?? "",
      recommendations: row.recommendations ?? "",
    });
    setEditing(row);
  }

  function buildPayload() {
    const isSkills = form.programType === "Skills Assessment";
    const isAdmission = form.programType === "Admission Form";
    
    // Combine class and training
    let combinedEligible = form.admissionEligibleFor;
    if (isAdmission && (form.selectedClass || form.selectedTraining)) {
      combinedEligible = [form.selectedClass, form.selectedTraining].filter(Boolean).join(" / ");
    }

    return {
      childId: parseInt(form.childId, 10),
      programType: form.programType,
      admissionEligibleFor: isAdmission ? (combinedEligible || undefined) : undefined,
      caseDetails: isAdmission ? (form.caseDetails || undefined) : undefined,
      recommenderCaseWorkerName: isAdmission ? (form.recommenderCaseWorkerName || undefined) : undefined,
      recordTitle: isAdmission ? (form.admissionEligibleFor || undefined) : (form.recordTitle || undefined),
      status: form.status || undefined,
      institutionName: isAdmission ? undefined : (form.institutionName || undefined),
      startDate: isSkills ? (form.assessmentDate || today()) : (form.startDate || today()),
      endDate: form.endDate || undefined,
      educationLevel: form.programType === "Education" ? (form.educationLevel || undefined) : undefined,
      boardOrCurriculum: form.programType === "Education" ? (form.boardOrCurriculum || undefined) : undefined,
      learningGoals: form.programType === "Education" ? (form.learningGoals || undefined) : undefined,
      tradeName: form.programType === "Vocational" ? (form.tradeName || undefined) : undefined,
      certificationName: form.programType === "Vocational" ? (form.certificationName || undefined) : undefined,
      weeklyHours: form.programType === "Vocational" && form.weeklyHours ? parseInt(form.weeklyHours, 10) : undefined,
      assessmentDate: isSkills ? (form.assessmentDate || undefined) : undefined,
      assessorName: isSkills ? (form.assessorName || undefined) : undefined,
      literacyLevel: isSkills ? (form.literacyLevel || undefined) : undefined,
      numeracyLevel: isSkills ? (form.numeracyLevel || undefined) : undefined,
      digitalLiteracyLevel: isSkills ? (form.digitalLiteracyLevel || undefined) : undefined,
      interestAreas: isSkills ? (form.interestAreas || undefined) : undefined,
      strengths: isSkills ? (form.strengths || undefined) : undefined,
      supportNeeds: isSkills ? (form.supportNeeds || undefined) : undefined,
      progressNotes: form.progressNotes || undefined,
      recommendations: form.recommendations || undefined,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = buildPayload();
    if (editing) {
      updatePlan.mutate({ id: editing.id, data: payload as any });
      return;
    }
    createPlan.mutate({ data: payload as any });
  }

  const columns: ColumnDef<(typeof filteredPlans)[number]>[] = useMemo(() => {
    if (activeTab === "Admission Form") {
      return [
        { key: "planId", label: "ID", labelBn: "আইডি", exportValue: (r) => r.planId, render: (r) => <span className="font-mono text-xs">{r.planId}</span> },
        { key: "childName", label: "Child", labelBn: "শিশু", exportValue: (r) => r.childName ?? "", render: (r) => <span className="font-medium">{r.childName ?? `#${r.childId}`}</span> },
        { key: "admissionEligibleFor", label: "Eligible For", labelBn: "ভর্তিরযোগ্য শাখা/শ্রেণি", exportValue: (r) => (r as any).admissionEligibleFor ?? "", render: (r) => (r as any).admissionEligibleFor || "—" },
        { key: "recommenderCaseWorkerName", label: "Case Worker", labelBn: "সুপারিশকারী কেসওয়ার্কার", exportValue: (r) => (r as any).recommenderCaseWorkerName ?? "", render: (r) => (r as any).recommenderCaseWorkerName || "—" },
        { key: "status", label: "Status", labelBn: "অবস্থা", exportValue: (r) => r.status ?? "", render: (r) => <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">{statusLabel(r.status)}</span> },
        { key: "startDate", label: "Date", labelBn: "তারিখ", exportValue: (r) => r.startDate ?? "", render: (r) => r.startDate || "—" },
      ];
    }
    if (activeTab === "Education") {
      return [
        { key: "planId", label: "ID", labelBn: "আইডি", exportValue: (r) => r.planId, render: (r) => <span className="font-mono text-xs">{r.planId}</span> },
        { key: "childName", label: "Child", labelBn: "শিশু", exportValue: (r) => r.childName ?? "", render: (r) => <span className="font-medium">{r.childName ?? `#${r.childId}`}</span> },
        { key: "recordTitle", label: "Program", labelBn: "প্রোগ্রাম", exportValue: (r) => r.recordTitle ?? "", render: (r) => r.recordTitle || "—" },
        { key: "institutionName", label: "Institution", labelBn: "প্রতিষ্ঠান", exportValue: (r) => r.institutionName ?? "", render: (r) => r.institutionName || "—" },
        { key: "educationLevel", label: "Level", labelBn: "স্তর", exportValue: (r) => r.educationLevel ?? "", render: (r) => r.educationLevel || "—" },
        { key: "status", label: "Status", labelBn: "অবস্থা", exportValue: (r) => r.status ?? "", render: (r) => <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">{statusLabel(r.status)}</span> },
      ];
    }
    if (activeTab === "Vocational") {
      return [
        { key: "planId", label: "ID", labelBn: "আইডি", exportValue: (r) => r.planId, render: (r) => <span className="font-mono text-xs">{r.planId}</span> },
        { key: "childName", label: "Child", labelBn: "শিশু", exportValue: (r) => r.childName ?? "", render: (r) => <span className="font-medium">{r.childName ?? `#${r.childId}`}</span> },
        { key: "recordTitle", label: "Course", labelBn: "কোর্স", exportValue: (r) => r.recordTitle ?? "", render: (r) => r.recordTitle || "—" },
        { key: "tradeName", label: "Trade", labelBn: "ট্রেড", exportValue: (r) => r.tradeName ?? "", render: (r) => r.tradeName || "—" },
        { key: "weeklyHours", label: "Hours/Week", labelBn: "ঘণ্টা/সপ্তাহ", exportValue: (r) => r.weeklyHours ?? "", render: (r) => r.weeklyHours != null ? r.weeklyHours : "—" },
        { key: "status", label: "Status", labelBn: "অবস্থা", exportValue: (r) => r.status ?? "", render: (r) => <span className="px-2 py-1 rounded-full text-xs bg-amber-50 text-amber-700">{statusLabel(r.status)}</span> },
      ];
    }
    return [
      { key: "planId", label: "ID", labelBn: "আইডি", exportValue: (r) => r.planId, render: (r) => <span className="font-mono text-xs">{r.planId}</span> },
      { key: "childName", label: "Child", labelBn: "শিশু", exportValue: (r) => r.childName ?? "", render: (r) => <span className="font-medium">{r.childName ?? `#${r.childId}`}</span> },
      { key: "recordTitle", label: "Assessment", labelBn: "মূল্যায়ন", exportValue: (r) => r.recordTitle ?? "", render: (r) => r.recordTitle || "—" },
      { key: "assessmentDate", label: "Date", labelBn: "তারিখ", exportValue: (r) => r.assessmentDate ?? "", render: (r) => r.assessmentDate || "—" },
      { key: "assessorName", label: "Assessor", labelBn: "মূল্যায়নকারী", exportValue: (r) => r.assessorName ?? "", render: (r) => r.assessorName || "—" },
      { key: "literacyLevel", label: "Literacy", labelBn: "সাক্ষরতা", exportValue: (r) => r.literacyLevel ?? "", render: (r) => levelLabel(r.literacyLevel) },
    ];
  }, [activeTab, isBn]);

  function TabDescription() {
    if (activeTab === "Admission Form") {
      return isBn
        ? "স্কুল/প্রশিক্ষণ শাখায় ভর্তি ফরম আগে পূরণ করুন, এরপর অন্যান্য শিক্ষা ও দক্ষতার অংশ ব্যবহার করুন।"
        : "Complete the school/training admission form first, then continue with the other education and skills sections.";
    }
    return "";
  }

  const dialogTitle = editing
    ? (isBn ? "ভর্তি ফরম সম্পাদনা" : "Edit Admission Form")
    : (isBn ? "নতুন ভর্তি ফরম" : "New Admission Form");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isBn ? "শিক্ষা ও দক্ষতা" : "Education & Skills"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1 max-w-3xl">
            {TabDescription()}
          </p>
        </div>

        {canCreate && (
          <Dialog open={open && !editing} onOpenChange={(value) => { if (!value) setOpen(false); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={openNewDialog}>
                <Plus className="h-4 w-4" />
                {isBn ? "নতুন ভর্তি ফরম" : "New Admission Form"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
              </DialogHeader>
              <FormContent
                form={form}
                setForm={setForm}
                activeTab={activeTab}
                isBn={isBn}
                children={children}
                classes={classes}
                trainings={trainings}
                onSubmit={handleSubmit}
                isSubmitting={createPlan.isPending || updatePlan.isPending}
                levelLabel={levelLabel}
                programLabel={programLabel}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredPlans}
        isLoading={isLoading}
        isBn={isBn}
        exportTitle="Education Admission Forms"
        exportTitleBn="শিক্ষা ভর্তি ফরম"
        emptyText="No admission forms found."
        emptyTextBn="কোনো ভর্তি ফরম পাওয়া যায়নি।"
        onRowClick={(row) => navigate(`/education-skills/${row.id}`)}
        actions={(row) => (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {canEdit && (
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEditDialog(row)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {canDelete && (
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleting(row)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {!canEdit && !canDelete && (
              <Button variant="ghost" size="sm" onClick={() => navigate(`/education-skills/${row.id}`)}>
                {isBn ? "দেখুন" : "View"}
              </Button>
            )}
          </div>
        )}
      />

      {editing && (
        <Dialog open={!!editing} onOpenChange={(value) => { if (!value) setEditing(null); }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <FormContent
              form={form}
              setForm={setForm}
              activeTab={activeTab}
              isBn={isBn}
              children={children}
              classes={classes}
              trainings={trainings}
              onSubmit={handleSubmit}
              isSubmitting={createPlan.isPending || updatePlan.isPending}
              levelLabel={levelLabel}
              programLabel={programLabel}
            />
          </DialogContent>
        </Dialog>
      )}

      {deleting && (
        <Dialog open={!!deleting} onOpenChange={(value) => { if (!value) setDeleting(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{isBn ? "রেকর্ড মুছুন" : "Delete Record"}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {isBn
                ? `"${deleting.recordTitle || deleting.planId}" মুছে ফেলতে চান?`
                : `Delete "${deleting.recordTitle || deleting.planId}"?`}
            </p>
            <div className="flex gap-2 mt-4">
              <Button variant="destructive" onClick={() => deletePlan.mutate({ id: deleting.id })} disabled={deletePlan.isPending}>
                {isBn ? "মুছুন" : "Delete"}
              </Button>
              <Button variant="outline" onClick={() => setDeleting(null)}>
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function FormContent({
  form,
  setForm,
  activeTab,
  isBn,
  children,
  classes,
  trainings,
  onSubmit,
  isSubmitting,
  levelLabel,
  programLabel,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  activeTab: ProgramType;
  isBn: boolean;
  children: Array<{ id: number; fullName: string }>;
  classes: Array<{ id: number; nameEn: string; nameBn: string }>;
  trainings: Array<{ id: number; nameEn: string; nameBn: string }>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  levelLabel: (value?: string) => string;
  programLabel: (value: ProgramType) => string;
}) {
  const selectedChild = children.find((child) => String(child.id) === form.childId) as any;
  const isEducation = activeTab === "Education";
  const isAdmission = activeTab === "Admission Form";
  const isVocational = activeTab === "Vocational";
  const isSkills = activeTab === "Skills Assessment";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5"
    >
      <div className="rounded-lg border bg-muted/20 p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>{isBn ? "রেকর্ডের ধরন" : "Record Type"}</Label>
            <Input value={programLabel(activeTab)} readOnly />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{isBn ? "শিশু *" : "Child *"}</Label>
            <Select value={form.childId} onValueChange={(value) => setForm((prev) => ({ ...prev, childId: value, programType: activeTab }))}>
              <SelectTrigger><SelectValue placeholder={isBn ? "শিশু নির্বাচন করুন" : "Select child"} /></SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={String(child.id)}>{child.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isAdmission && (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={isBn ? "শিশুর নাম" : "Child Name"}>
            <Input value={selectedChild?.fullName ?? ""} readOnly />
          </Field>
          <Field label={isBn ? "বয়স" : "Age"}>
            <Input value={selectedChild?.currentAge != null ? String(selectedChild.currentAge) : ""} readOnly />
          </Field>
          <Field label={isBn ? "রেজিস্ট্রেশন নম্বর ও আগমনের তারিখ" : "Registration Number and Arrival Date"}>
            <Input value={selectedChild ? `${selectedChild.childId ?? ""}${selectedChild.admissionDate ? ` / ${selectedChild.admissionDate}` : ""}` : ""} readOnly />
          </Field>
          <Field label={isBn ? "পিতা/মাতার নাম" : "Father/Mother Name"}>
            <Input value={selectedChild ? [selectedChild.fatherName, selectedChild.motherName].filter(Boolean).join(" / ") : ""} readOnly />
          </Field>
          <Field label={isBn ? "ঠিকানা" : "Address"} className="md:col-span-2">
            <Textarea className="min-h-[80px]" value={selectedChild ? [selectedChild.presentAddress, selectedChild.presentVillage, selectedChild.presentThana, selectedChild.presentDistrict].filter(Boolean).join(", ") : ""} readOnly />
          </Field>
          <Field label={isBn ? "মামলার বিবরণ" : "Case Details"} className="md:col-span-2">
            <Textarea className="min-h-[96px]" value={form.caseDetails} onChange={(e) => setForm((prev) => ({ ...prev, caseDetails: e.target.value, programType: activeTab }))} placeholder={isBn ? "মামলার বিবরণ লিখুন" : "Write case details"} />
          </Field>
          <Field label={isBn ? "শ্রেণি" : "Class"}>
            <Select value={form.selectedClass} onValueChange={(value) => setForm((prev) => ({ ...prev, selectedClass: value, programType: activeTab }))}>
              <SelectTrigger><SelectValue placeholder={isBn ? "শ্রেণি নির্বাচন করুন" : "Select Class"} /></SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={isBn ? c.nameBn : c.nameEn}>{isBn ? c.nameBn : c.nameEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={isBn ? "প্রশিক্ষণের নাম" : "Training Name"}>
            <Select value={form.selectedTraining} onValueChange={(value) => setForm((prev) => ({ ...prev, selectedTraining: value, programType: activeTab }))}>
              <SelectTrigger><SelectValue placeholder={isBn ? "প্রশিক্ষণ নির্বাচন করুন" : "Select Training"} /></SelectTrigger>
              <SelectContent>
                {trainings.map((t) => (
                  <SelectItem key={t.id} value={isBn ? t.nameBn : t.nameEn}>{isBn ? t.nameBn : t.nameEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={isBn ? "সুপারিশকারী কেসওয়ার্কারএর নাম" : "Recommending Case Worker"}>
            <Input value={form.recommenderCaseWorkerName} onChange={(e) => setForm((prev) => ({ ...prev, recommenderCaseWorkerName: e.target.value, programType: activeTab }))} placeholder={isBn ? "কেসওয়ার্কারের নাম লিখুন" : "Enter case worker name"} />
          </Field>
          <Field label={isBn ? "অবস্থা" : "Status"}>
            <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value, programType: activeTab }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{isBn ? statusLabelBn(status) : status}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={isBn ? "ফরমের তারিখ" : "Form Date"}>
            <Input type="date" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value, programType: activeTab }))} required />
          </Field>
        </div>
      )}

      {isEducation && (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={isBn ? "শিক্ষা কার্যক্রমের নাম" : "Education Program Title"}>
            <Input value={form.recordTitle} onChange={(e) => setForm((prev) => ({ ...prev, recordTitle: e.target.value, programType: activeTab }))} placeholder={isBn ? "যেমন: এসএসসি প্রস্তুতি" : "e.g. SSC Preparation"} />
          </Field>
          <Field label={isBn ? "প্রতিষ্ঠান / স্কুল" : "Institution / School"}>
            <Input value={form.institutionName} onChange={(e) => setForm((prev) => ({ ...prev, institutionName: e.target.value }))} placeholder={isBn ? "প্রতিষ্ঠানের নাম" : "Institution name"} />
          </Field>
          <Field label={isBn ? "শিক্ষার স্তর" : "Education Level"}>
            <Select value={form.educationLevel} onValueChange={(value) => setForm((prev) => ({ ...prev, educationLevel: value }))}>
              <SelectTrigger><SelectValue placeholder={isBn ? "স্তর নির্বাচন করুন" : "Select Level"} /></SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={isBn ? c.nameBn : c.nameEn}>{isBn ? c.nameBn : c.nameEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={isBn ? "বোর্ড / কারিকুলাম" : "Board / Curriculum"}>
            <Input value={form.boardOrCurriculum} onChange={(e) => setForm((prev) => ({ ...prev, boardOrCurriculum: e.target.value }))} placeholder={isBn ? "যেমন: জাতীয় শিক্ষাক্রম" : "e.g. National Curriculum"} />
          </Field>
          <Field label={isBn ? "শুরুর তারিখ *" : "Start Date *"}>
            <Input type="date" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} required />
          </Field>
          <Field label={isBn ? "শেষের তারিখ" : "End Date"}>
            <Input type="date" value={form.endDate} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))} />
          </Field>
          <Field label={isBn ? "অবস্থা" : "Status"}>
            <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{isBn ? statusLabelBn(status) : status}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={isBn ? "শেখার লক্ষ্য" : "Learning Goals"} className="md:col-span-2">
            <Textarea className="min-h-[96px]" value={form.learningGoals} onChange={(e) => setForm((prev) => ({ ...prev, learningGoals: e.target.value }))} placeholder={isBn ? "শিক্ষাগত লক্ষ্য লিখুন" : "Describe learning goals"} />
          </Field>
          <Field label={isBn ? "অগ্রগতির নোট" : "Progress Notes"} className="md:col-span-2">
            <Textarea className="min-h-[96px]" value={form.progressNotes} onChange={(e) => setForm((prev) => ({ ...prev, progressNotes: e.target.value }))} placeholder={isBn ? "অগ্রগতির বিবরণ লিখুন" : "Write progress notes"} />
          </Field>
        </div>
      )}

      {isVocational && (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={isBn ? "কোর্স / প্রশিক্ষণের নাম" : "Course / Training Title"}>
            <Select value={form.recordTitle} onValueChange={(value) => setForm((prev) => ({ ...prev, recordTitle: value, programType: activeTab }))}>
              <SelectTrigger><SelectValue placeholder={isBn ? "প্রশিক্ষণ নির্বাচন করুন" : "Select Training"} /></SelectTrigger>
              <SelectContent>
                {trainings.map((t) => (
                  <SelectItem key={t.id} value={isBn ? t.nameBn : t.nameEn}>{isBn ? t.nameBn : t.nameEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={isBn ? "প্রশিক্ষণ প্রদানকারী" : "Training Provider"}>
            <Input value={form.institutionName} onChange={(e) => setForm((prev) => ({ ...prev, institutionName: e.target.value }))} placeholder={isBn ? "প্রদানকারীর নাম" : "Provider name"} />
          </Field>
          <Field label={isBn ? "ট্রেড / বিষয়" : "Trade / Subject"}>
            <Input value={form.tradeName} onChange={(e) => setForm((prev) => ({ ...prev, tradeName: e.target.value }))} placeholder={isBn ? "যেমন: বৈদ্যুতিক কাজ" : "e.g. Electrical Work"} />
          </Field>
          <Field label={isBn ? "সনদ / সার্টিফিকেশন" : "Certification"}>
            <Input value={form.certificationName} onChange={(e) => setForm((prev) => ({ ...prev, certificationName: e.target.value }))} placeholder={isBn ? "লক্ষ্য সনদ" : "Target certification"} />
          </Field>
          <Field label={isBn ? "শুরুর তারিখ *" : "Start Date *"}>
            <Input type="date" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))} required />
          </Field>
          <Field label={isBn ? "শেষের তারিখ" : "End Date"}>
            <Input type="date" value={form.endDate} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))} />
          </Field>
          <Field label={isBn ? "সপ্তাহে ঘণ্টা" : "Hours per Week"}>
            <Input type="number" min={0} value={form.weeklyHours} onChange={(e) => setForm((prev) => ({ ...prev, weeklyHours: e.target.value }))} placeholder="8" />
          </Field>
          <Field label={isBn ? "অবস্থা" : "Status"}>
            <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{isBn ? statusLabelBn(status) : status}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={isBn ? "অগ্রগতির নোট" : "Progress Notes"} className="md:col-span-2">
            <Textarea className="min-h-[96px]" value={form.progressNotes} onChange={(e) => setForm((prev) => ({ ...prev, progressNotes: e.target.value }))} placeholder={isBn ? "উপস্থিতি, অগ্রগতি, অর্জন লিখুন" : "Write attendance, progress, and achievements"} />
          </Field>
          <Field label={isBn ? "পরবর্তী সুপারিশ" : "Recommendations"} className="md:col-span-2">
            <Textarea className="min-h-[96px]" value={form.recommendations} onChange={(e) => setForm((prev) => ({ ...prev, recommendations: e.target.value }))} placeholder={isBn ? "পরবর্তী পদক্ষেপ লিখুন" : "Write next-step recommendations"} />
          </Field>
        </div>
      )}

      {isSkills && (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={isBn ? "মূল্যায়নের শিরোনাম" : "Assessment Title"}>
            <Input value={form.recordTitle} onChange={(e) => setForm((prev) => ({ ...prev, recordTitle: e.target.value, programType: activeTab }))} placeholder={isBn ? "যেমন: জীবনদক্ষতা মূল্যায়ন" : "e.g. Life Skills Assessment"} />
          </Field>
          <Field label={isBn ? "মূল্যায়নের তারিখ *" : "Assessment Date *"}>
            <Input type="date" value={form.assessmentDate} onChange={(e) => setForm((prev) => ({ ...prev, assessmentDate: e.target.value }))} required />
          </Field>
          <Field label={isBn ? "মূল্যায়নকারী" : "Assessor"}>
            <Input value={form.assessorName} onChange={(e) => setForm((prev) => ({ ...prev, assessorName: e.target.value }))} placeholder={isBn ? "মূল্যায়নকারীর নাম" : "Assessor name"} />
          </Field>
          <Field label={isBn ? "অবস্থা" : "Status"}>
            <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{isBn ? statusLabelBn(status) : status}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={isBn ? "সাক্ষরতার স্তর" : "Literacy Level"}>
            <Select value={form.literacyLevel} onValueChange={(value) => setForm((prev) => ({ ...prev, literacyLevel: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((level) => <SelectItem key={level} value={level}>{levelLabel(level)}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={isBn ? "সংখ্যাজ্ঞানের স্তর" : "Numeracy Level"}>
            <Select value={form.numeracyLevel} onValueChange={(value) => setForm((prev) => ({ ...prev, numeracyLevel: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((level) => <SelectItem key={level} value={level}>{levelLabel(level)}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={isBn ? "ডিজিটাল দক্ষতার স্তর" : "Digital Literacy Level"}>
            <Select value={form.digitalLiteracyLevel} onValueChange={(value) => setForm((prev) => ({ ...prev, digitalLiteracyLevel: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LEVEL_OPTIONS.map((level) => <SelectItem key={level} value={level}>{levelLabel(level)}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={isBn ? "সহায়তার প্রয়োজন" : "Support Needs"}>
            <Input value={form.supportNeeds} onChange={(e) => setForm((prev) => ({ ...prev, supportNeeds: e.target.value }))} placeholder={isBn ? "যেমন: অতিরিক্ত পাঠ সহায়তা" : "e.g. Additional learning support"} />
          </Field>
          <Field label={isBn ? "আগ্রহের ক্ষেত্র" : "Interest Areas"} className="md:col-span-2">
            <Textarea className="min-h-[80px]" value={form.interestAreas} onChange={(e) => setForm((prev) => ({ ...prev, interestAreas: e.target.value }))} placeholder={isBn ? "শিশুর আগ্রহের বিষয় লিখুন" : "Write the child's interest areas"} />
          </Field>
          <Field label={isBn ? "শক্তি" : "Strengths"} className="md:col-span-2">
            <Textarea className="min-h-[80px]" value={form.strengths} onChange={(e) => setForm((prev) => ({ ...prev, strengths: e.target.value }))} placeholder={isBn ? "শক্তির দিকগুলো লিখুন" : "Write key strengths"} />
          </Field>
          <Field label={isBn ? "অগ্রগতির নোট" : "Assessment Notes"} className="md:col-span-2">
            <Textarea className="min-h-[80px]" value={form.progressNotes} onChange={(e) => setForm((prev) => ({ ...prev, progressNotes: e.target.value }))} placeholder={isBn ? "মূল্যায়নের সারাংশ লিখুন" : "Write the assessment summary"} />
          </Field>
          <Field label={isBn ? "সুপারিশ" : "Recommendations"} className="md:col-span-2">
            <Textarea className="min-h-[96px]" value={form.recommendations} onChange={(e) => setForm((prev) => ({ ...prev, recommendations: e.target.value }))} placeholder={isBn ? "শিশুর উন্নয়নের জন্য সুপারিশ লিখুন" : "Write recommendations for the child's development"} />
          </Field>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isBn ? "সংরক্ষণ করুন" : "Save Record"}
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function statusLabelBn(status: string) {
  return {
    Planned: "পরিকল্পিত",
    Ongoing: "চলমান",
    Completed: "সম্পন্ন",
    Paused: "স্থগিত",
  }[status] ?? status;
}
