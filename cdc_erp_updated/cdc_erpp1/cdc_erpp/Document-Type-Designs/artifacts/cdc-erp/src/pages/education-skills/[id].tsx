import { useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import {
  getGetEducationPlanQueryKey,
  getListEducationPlansQueryKey,
  useCreateEducationPlan,
  useDeleteEducationPlan,
  useGetChild,
  useGetEducationPlan,
  useListEducationPlans,
  useUpdateEducationPlan,
} from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, BookOpen, Hammer, Pencil, Plus, Sparkles, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, type ColumnDef } from "@/components/DataTable";
import { SectionCard, DetailField } from "@/components/DetailField";
import { useAuth, hasRole, usePermission } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type ProgramType = "Admission Form" | "Education" | "Vocational" | "Skills Assessment";

const STATUS_OPTIONS = ["Planned", "Ongoing", "Completed", "Paused"];
const LEVEL_OPTIONS = ["Basic", "Emerging", "Intermediate", "Advanced"];

const EMPTY_FORM = {
  childId: "",
  programType: "Education" as ProgramType,
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

function statusLabel(status?: string, isBn?: boolean) {
  if (!status) return "—";
  if (!isBn) return status;
  return {
    Planned: "পরিকল্পিত",
    Ongoing: "চলমান",
    Completed: "সম্পন্ন",
    Paused: "স্থগিত",
  }[status] ?? status;
}

function levelLabel(level?: string, isBn?: boolean) {
  if (!level) return "—";
  if (!isBn) return level;
  return {
    Basic: "প্রাথমিক",
    Emerging: "উদীয়মান",
    Intermediate: "মধ্যম",
    Advanced: "উন্নত",
  }[level] ?? level;
}

export default function EducationSkillsDetailPage() {
  const { id } = useParams();
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

  const canManage = canCreate || canEdit || canDelete;
  const canOpenRow = canView;
  const recordId = parseInt(id || "0", 10);

  const [activeTab, setActiveTab] = useState<ProgramType>("Education");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewing, setViewing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, startDate: today(), assessmentDate: today() });

  const { data: admissionForm, isLoading } = useGetEducationPlan(recordId, {
    query: { queryKey: getGetEducationPlanQueryKey(recordId), enabled: !!recordId },
  });

  const childId = admissionForm?.childId;
  const { data: child } = useGetChild(childId || 0, {
    query: { enabled: !!childId, queryKey: ["child-for-education-detail", childId] },
  });

  const { data: childPlans = [] } = useListEducationPlans({ childId } as any, {
    query: { enabled: !!childId, queryKey: getListEducationPlansQueryKey({ childId } as any) },
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: () => fetch("/api/classes").then((res) => res.json()),
  });

  const { data: trainings = [] } = useQuery({
    queryKey: ["trainings"],
    queryFn: () => fetch("/api/trainings").then((res) => res.json()),
  });

  const unlockedPlans = useMemo(
    () => childPlans.filter((plan) => (plan.programType as string) !== "Admission Form"),
    [childPlans],
  );
  const filteredPlans = useMemo(
    () => unlockedPlans.filter((plan) => plan.programType === activeTab),
    [unlockedPlans, activeTab],
  );

  const createPlan = useCreateEducationPlan({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEducationPlansQueryKey({ childId } as any) });
        setOpen(false);
        resetForm(activeTab);
        toast({ title: isBn ? "সংরক্ষিত হয়েছে" : "Saved" });
      },
    },
  });

  const updatePlan = useUpdateEducationPlan({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEducationPlansQueryKey({ childId } as any) });
        setEditing(null);
        toast({ title: isBn ? "আপডেট হয়েছে" : "Updated" });
      },
    },
  });

  const deletePlan = useDeleteEducationPlan({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEducationPlansQueryKey({ childId } as any) });
        setDeleting(null);
        toast({ title: isBn ? "মুছে ফেলা হয়েছে" : "Deleted" });
      },
    },
  });

  function resetForm(programType: ProgramType) {
    setForm({
      ...EMPTY_FORM,
      childId: childId ? String(childId) : "",
      programType,
      startDate: today(),
      assessmentDate: today(),
    });
  }

  function openNewDialog() {
    setEditing(null);
    resetForm(activeTab);
    setOpen(true);
  }

  function fillFormFromRow(row: any) {
    setForm({
      childId: String(row.childId),
      programType: row.programType,
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
  }

  function openEditDialog(row: any) {
    setActiveTab(row.programType);
    fillFormFromRow(row);
    setEditing(row);
    setOpen(true);
  }

  function openViewDialog(row: any) {
    setActiveTab(row.programType);
    fillFormFromRow(row);
    setViewing(row);
  }

  function buildPayload() {
    const isSkills = form.programType === "Skills Assessment";
    return {
      childId: parseInt(form.childId, 10),
      programType: form.programType,
      recordTitle: form.recordTitle || undefined,
      status: form.status || undefined,
      institutionName: form.institutionName || undefined,
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
    if (!canManage) return;
    const payload = buildPayload();
    if (editing) {
      updatePlan.mutate({ id: editing.id, data: payload as any });
      return;
    }
    createPlan.mutate({ data: payload as any });
  }

  const columns: ColumnDef<(typeof filteredPlans)[number]>[] = useMemo(() => {
    if (activeTab === "Education") {
      return [
        { key: "planId", label: "ID", labelBn: "আইডি", exportValue: (r) => r.planId, render: (r) => <span className="font-mono text-xs">{r.planId}</span> },
        { key: "institutionName", label: "Institution", labelBn: "প্রতিষ্ঠান", exportValue: (r) => r.institutionName ?? "", render: (r) => r.institutionName || "—" },
        { key: "educationLevel", label: "Class", labelBn: "শ্রেণি", exportValue: (r) => r.educationLevel ?? "", render: (r) => r.educationLevel || "—" },
        { key: "status", label: "Status", labelBn: "অবস্থা", exportValue: (r) => r.status ?? "", render: (r) => <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">{statusLabel(r.status, isBn)}</span> },
      ];
    }
    if (activeTab === "Vocational") {
      return [
        { key: "planId", label: "ID", labelBn: "আইডি", exportValue: (r) => r.planId, render: (r) => <span className="font-mono text-xs">{r.planId}</span> },
        { key: "recordTitle", label: "Training Name", labelBn: "প্রশিক্ষণের নাম", exportValue: (r) => r.recordTitle ?? "", render: (r) => r.recordTitle || "—" },
        { key: "tradeName", label: "Trade", labelBn: "ট্রেড", exportValue: (r) => r.tradeName ?? "", render: (r) => r.tradeName || "—" },
        { key: "weeklyHours", label: "Hours/Week", labelBn: "ঘণ্টা/সপ্তাহ", exportValue: (r) => r.weeklyHours ?? "", render: (r) => r.weeklyHours != null ? r.weeklyHours : "—" },
        { key: "status", label: "Status", labelBn: "অবস্থা", exportValue: (r) => r.status ?? "", render: (r) => <span className="px-2 py-1 rounded-full text-xs bg-amber-50 text-amber-700">{statusLabel(r.status, isBn)}</span> },
      ];
    }
    return [
      { key: "planId", label: "ID", labelBn: "আইডি", exportValue: (r) => r.planId, render: (r) => <span className="font-mono text-xs">{r.planId}</span> },
      { key: "recordTitle", label: "Assessment", labelBn: "মূল্যায়ন", exportValue: (r) => r.recordTitle ?? "", render: (r) => r.recordTitle || "—" },
      { key: "assessmentDate", label: "Date", labelBn: "তারিখ", exportValue: (r) => r.assessmentDate ?? "", render: (r) => r.assessmentDate || "—" },
      { key: "assessorName", label: "Assessor", labelBn: "মূল্যায়নকারী", exportValue: (r) => r.assessorName ?? "", render: (r) => r.assessorName || "—" },
      { key: "literacyLevel", label: "Literacy", labelBn: "সাক্ষরতা", exportValue: (r) => r.literacyLevel ?? "", render: (r) => levelLabel(r.literacyLevel, isBn) },
    ];
  }, [activeTab, filteredPlans, isBn]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!admissionForm || (admissionForm.programType as string) !== "Admission Form") {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate("/education-skills")}>{isBn ? "ফিরে যান" : "Go back"}</Button>
        <p className="text-muted-foreground">{isBn ? "ভর্তি ফরম পাওয়া যায়নি।" : "Admission form not found."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <Button variant="ghost" className="gap-2 px-0" onClick={() => navigate("/education-skills")}>
            <ArrowLeft className="h-4 w-4" />
            {isBn ? "শিক্ষা ও দক্ষতা তালিকায় ফিরে যান" : "Back to Education & Skills"}
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{isBn ? "শিক্ষা ও দক্ষতা" : "Education & Skills"}</h1>
          <p className="text-muted-foreground text-sm">
            {isBn ? "ভর্তি ফরম সম্পন্ন হওয়ার পর এই শিশুর জন্য শিক্ষা, বৃত্তিমূলক ও দক্ষতা মূল্যায়ন অংশ খোলা হয়েছে।" : "The education, vocational, and skills assessment sections are unlocked for this child after the admission form."}
          </p>
        </div>

        {canManage && (
          <Dialog open={open} onOpenChange={(value) => { if (!value) { setOpen(false); setEditing(null); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={openNewDialog}>
                <Plus className="h-4 w-4" />
                {isBn ? "নতুন রেকর্ড" : "New Record"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? (isBn ? "রেকর্ড সম্পাদনা" : "Edit Record") : (isBn ? "নতুন রেকর্ড" : "New Record")}</DialogTitle>
              </DialogHeader>
              <InnerForm
                form={form}
                setForm={setForm}
                activeTab={activeTab}
                isBn={isBn}
                classes={classes}
                trainings={trainings}
                onSubmit={handleSubmit}
                isSubmitting={createPlan.isPending || updatePlan.isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <SectionCard title={isBn ? "ভর্তি ফরম" : "Admission Form"}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <DetailField label={isBn ? "শিশুর নাম" : "Child Name"} value={admissionForm.childName || child?.fullName} />
          <DetailField label={isBn ? "বয়স" : "Age"} value={(child as any)?.currentAge ?? "-"} />
          <DetailField label={isBn ? "রেজিস্ট্রেশন নম্বর ও আগমনের তারিখ" : "Registration Number and Arrival Date"} value={child ? `${(child as any).childId ?? ""}${(child as any).admissionDate ? ` / ${(child as any).admissionDate}` : ""}` : "-"} />
          <DetailField label={isBn ? "পিতা/মাতার নাম" : "Father/Mother Name"} value={child ? [(child as any).fatherName, (child as any).motherName].filter(Boolean).join(" / ") : "-"} />
          <DetailField label={isBn ? "ঠিকানা" : "Address"} value={child ? [(child as any).presentAddress, (child as any).presentVillage, (child as any).presentThana, (child as any).presentDistrict].filter(Boolean).join(", ") : "-"} />
          <DetailField label={isBn ? "মামলার বিবরণ" : "Case Details"} value={(admissionForm as any).caseDetails} />
          <DetailField label={isBn ? "শ্রেণি ও প্রশিক্ষণের নাম" : "Class & Training Name"} value={(admissionForm as any).admissionEligibleFor} />
          <DetailField label={isBn ? "সুপারিশকারী কেসওয়ার্কারএর নাম" : "Recommending Case Worker"} value={(admissionForm as any).recommenderCaseWorkerName} />
        </div>
      </SectionCard>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProgramType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="Education" className="gap-2">
              <BookOpen className="h-4 w-4" />
              {isBn ? "শিক্ষা" : "Education"}
            </TabsTrigger>
            <TabsTrigger value="Vocational" className="gap-2">
              <Hammer className="h-4 w-4" />
              {isBn ? "বৃত্তিমূলক" : "Vocational"}
            </TabsTrigger>
            <TabsTrigger value="Skills Assessment" className="gap-2">
              <Sparkles className="h-4 w-4" />
              {isBn ? "দক্ষতা মূল্যায়ন" : "Skills Assessment"}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <DataTable
        columns={columns}
        data={filteredPlans}
        isLoading={false}
        isBn={isBn}
        onRowClick={canOpenRow ? (row) => openViewDialog(row) : undefined}
        exportTitle="Education and Skills"
        exportTitleBn="শিক্ষা ও দক্ষতা"
        emptyText="No records found for this child."
        emptyTextBn="এই শিশুর জন্য কোনো রেকর্ড নেই।"
        actions={canManage ? (row) => (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEditDialog(row)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleting(row)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : undefined}
      />

      {viewing && (
        <Dialog open={!!viewing} onOpenChange={(value) => { if (!value) setViewing(null); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isBn ? "রেকর্ড দেখুন" : "View Record"}</DialogTitle>
            </DialogHeader>
            <InnerForm
              form={form}
              setForm={setForm}
              activeTab={activeTab}
              isBn={isBn}
              classes={classes}
              trainings={trainings}
              onSubmit={handleSubmit}
              isSubmitting={false}
              readOnly
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
              {isBn ? `"${deleting.recordTitle || deleting.planId}" মুছে ফেলতে চান?` : `Delete "${deleting.recordTitle || deleting.planId}"?`}
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

function InnerForm({
  form,
  setForm,
  activeTab,
  isBn,
  classes,
  trainings,
  onSubmit,
  isSubmitting,
  readOnly = false,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  activeTab: ProgramType;
  isBn: boolean;
  classes: Array<{ id: number; nameEn: string; nameBn: string }>;
  trainings: Array<{ id: number; nameEn: string; nameBn: string }>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  readOnly?: boolean;
}) {
  const isEducation = activeTab === "Education";
  const isVocational = activeTab === "Vocational";
  const isSkills = activeTab === "Skills Assessment";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <fieldset className="space-y-5" disabled={readOnly}>
        {isEducation && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={isBn ? "প্রতিষ্ঠান / স্কুল" : "Institution / School"}>
              <Input value={form.institutionName} onChange={(e) => setForm((prev) => ({ ...prev, institutionName: e.target.value, programType: activeTab }))} />
            </Field>
            <Field label={isBn ? "শ্রেণি" : "Class"}>
              <Select value={form.educationLevel} onValueChange={(value) => setForm((prev) => ({ ...prev, educationLevel: value, programType: activeTab }))}>
                <SelectTrigger><SelectValue placeholder={isBn ? "শ্রেণি নির্বাচন করুন" : "Select Class"} /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={isBn ? c.nameBn : c.nameEn}>{isBn ? c.nameBn : c.nameEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={isBn ? "বোর্ড" : "Board"}>
              <Input value={form.boardOrCurriculum} onChange={(e) => setForm((prev) => ({ ...prev, boardOrCurriculum: e.target.value, programType: activeTab }))} />
            </Field>
            <Field label={isBn ? "শুরুর তারিখ *" : "Start Date *"}>
              <Input type="date" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value, programType: activeTab }))} required />
            </Field>
            <Field label={isBn ? "শেষের তারিখ" : "End Date"}>
              <Input type="date" value={form.endDate} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value, programType: activeTab }))} />
            </Field>
            <Field label={isBn ? "অবস্থা" : "Status"}>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value, programType: activeTab }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{isBn ? statusLabel(status, true) : status}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={isBn ? "শেখার লক্ষ্য" : "Learning Goals"} className="md:col-span-2">
              <Textarea className="min-h-[96px]" value={form.learningGoals} onChange={(e) => setForm((prev) => ({ ...prev, learningGoals: e.target.value, programType: activeTab }))} />
            </Field>
            <Field label={isBn ? "অগ্রগতির নোট" : "Progress Notes"} className="md:col-span-2">
              <Textarea className="min-h-[96px]" value={form.progressNotes} onChange={(e) => setForm((prev) => ({ ...prev, progressNotes: e.target.value, programType: activeTab }))} />
            </Field>
          </div>
        )}

        {isVocational && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={isBn ? "প্রশিক্ষণের নাম" : "Training Name"}>
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
              <Input value={form.institutionName} onChange={(e) => setForm((prev) => ({ ...prev, institutionName: e.target.value, programType: activeTab }))} />
            </Field>
            <Field label={isBn ? "ট্রেড / বিষয়" : "Trade / Subject"}>
              <Input value={form.tradeName} onChange={(e) => setForm((prev) => ({ ...prev, tradeName: e.target.value, programType: activeTab }))} />
            </Field>
            <Field label={isBn ? "সনদ / সার্টিফিকেশন" : "Certification"}>
              <Input value={form.certificationName} onChange={(e) => setForm((prev) => ({ ...prev, certificationName: e.target.value, programType: activeTab }))} />
            </Field>
            <Field label={isBn ? "শুরুর তারিখ *" : "Start Date *"}>
              <Input type="date" value={form.startDate} onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value, programType: activeTab }))} required />
            </Field>
            <Field label={isBn ? "শেষের তারিখ" : "End Date"}>
              <Input type="date" value={form.endDate} onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value, programType: activeTab }))} />
            </Field>
            <Field label={isBn ? "সপ্তাহে ঘণ্টা" : "Hours per Week"}>
              <Input type="number" min={0} value={form.weeklyHours} onChange={(e) => setForm((prev) => ({ ...prev, weeklyHours: e.target.value, programType: activeTab }))} />
            </Field>
            <Field label={isBn ? "অবস্থা" : "Status"}>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value, programType: activeTab }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{isBn ? statusLabel(status, true) : status}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={isBn ? "অগ্রগতির নোট" : "Progress Notes"} className="md:col-span-2">
              <Textarea className="min-h-[96px]" value={form.progressNotes} onChange={(e) => setForm((prev) => ({ ...prev, progressNotes: e.target.value, programType: activeTab }))} />
            </Field>
            <Field label={isBn ? "পরবর্তী সুপারিশ" : "Recommendations"} className="md:col-span-2">
              <Textarea className="min-h-[96px]" value={form.recommendations} onChange={(e) => setForm((prev) => ({ ...prev, recommendations: e.target.value, programType: activeTab }))} />
            </Field>
          </div>
        )}

        {isSkills && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={isBn ? "মূল্যায়নের শিরোনাম" : "Assessment Title"}>
              <Input value={form.recordTitle} onChange={(e) => setForm((prev) => ({ ...prev, recordTitle: e.target.value, programType: activeTab }))} />
            </Field>
            <Field label={isBn ? "মূল্যায়নের তারিখ *" : "Assessment Date *"}>
              <Input type="date" value={form.assessmentDate} onChange={(e) => setForm((prev) => ({ ...prev, assessmentDate: e.target.value, programType: activeTab }))} required />
            </Field>
            <Field label={isBn ? "মূল্যায়নকারী" : "Assessor"}>
              <Input value={form.assessorName} onChange={(e) => setForm((prev) => ({ ...prev, assessorName: e.target.value, programType: activeTab }))} />
            </Field>
            <Field label={isBn ? "অবস্থা" : "Status"}>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value, programType: activeTab }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{isBn ? statusLabel(status, true) : status}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={isBn ? "সাক্ষরতার স্তর" : "Literacy Level"}>
              <Select value={form.literacyLevel} onValueChange={(value) => setForm((prev) => ({ ...prev, literacyLevel: value, programType: activeTab }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LEVEL_OPTIONS.map((level) => <SelectItem key={level} value={level}>{levelLabel(level, isBn)}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={isBn ? "সংখ্যাজ্ঞানের স্তর" : "Numeracy Level"}>
              <Select value={form.numeracyLevel} onValueChange={(value) => setForm((prev) => ({ ...prev, numeracyLevel: value, programType: activeTab }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LEVEL_OPTIONS.map((level) => <SelectItem key={level} value={level}>{levelLabel(level, isBn)}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={isBn ? "ডিজিটাল দক্ষতার স্তর" : "Digital Literacy Level"}>
              <Select value={form.digitalLiteracyLevel} onValueChange={(value) => setForm((prev) => ({ ...prev, digitalLiteracyLevel: value, programType: activeTab }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{LEVEL_OPTIONS.map((level) => <SelectItem key={level} value={level}>{levelLabel(level, isBn)}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={isBn ? "সহায়তার প্রয়োজন" : "Support Needs"}>
              <Input value={form.supportNeeds} onChange={(e) => setForm((prev) => ({ ...prev, supportNeeds: e.target.value, programType: activeTab }))} />
            </Field>
            <Field label={isBn ? "আগ্রহের ক্ষেত্র" : "Interest Areas"} className="md:col-span-2">
              <Textarea className="min-h-[80px]" value={form.interestAreas} onChange={(e) => setForm((prev) => ({ ...prev, interestAreas: e.target.value, programType: activeTab }))} />
            </Field>
            <Field label={isBn ? "শক্তি" : "Strengths"} className="md:col-span-2">
              <Textarea className="min-h-[80px]" value={form.strengths} onChange={(e) => setForm((prev) => ({ ...prev, strengths: e.target.value, programType: activeTab }))} />
            </Field>
            <Field label={isBn ? "অগ্রগতির নোট" : "Assessment Notes"} className="md:col-span-2">
              <Textarea className="min-h-[80px]" value={form.progressNotes} onChange={(e) => setForm((prev) => ({ ...prev, progressNotes: e.target.value, programType: activeTab }))} />
            </Field>
            <Field label={isBn ? "সুপারিশ" : "Recommendations"} className="md:col-span-2">
              <Textarea className="min-h-[96px]" value={form.recommendations} onChange={(e) => setForm((prev) => ({ ...prev, recommendations: e.target.value, programType: activeTab }))} />
            </Field>
          </div>
        )}

      </fieldset>
      {!readOnly && (
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isBn ? "সংরক্ষণ করুন" : "Save Record"}
        </Button>
      )}
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
