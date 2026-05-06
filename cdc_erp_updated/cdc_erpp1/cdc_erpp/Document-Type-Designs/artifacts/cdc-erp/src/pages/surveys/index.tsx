import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type ColumnDef } from "@/components/DataTable";
import { useAuth, hasRole, usePermission } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const WELLBEING_COLORS: Record<string, string> = {
  Good: "bg-green-100 text-green-700",
  Fair: "bg-yellow-100 text-yellow-700",
  Poor: "bg-orange-100 text-orange-700",
  "Very poor": "bg-red-100 text-red-700",
};

const AGE_GROUPS = ["9-10", "11-12", "13-14", "15-16", "17-18"];
const AGE_GROUP_BN: Record<string, string> = { "9-10": "৯-১০", "11-12": "১১-১২", "13-14": "১৩-১৪", "15-16": "১৫-১৬", "17-18": "১৭-১৮" };

type Survey = {
  id: number;
  surveyId: string;
  childName?: string;
  childId?: number;
  centerName?: string;
  enumeratorName?: string;
  surveyDate?: string;
  ageGroup?: string;
  gender?: string;
  educationLevel?: string;
  emotionalWellbeing?: string;
};

const EMPTY_EDIT = { enumeratorName: "", surveyDate: "", ageGroup: "none", gender: "none", educationLevel: "" };

export default function SurveysList() {
  const { t, i18n } = useTranslation();
  const [, navigate] = useLocation();
  const isBn = i18n.language === "bn";
  const { user } = useAuth();
  const { toast } = useToast();
  const canView   = usePermission("measurement-surveys", "view");
  const canCreate = usePermission("measurement-surveys", "create");
  const canEdit   = usePermission("measurement-surveys", "edit");
  const canDelete = usePermission("measurement-surveys", "delete");

  const [deleting, setDeleting] = useState<Survey | null>(null);
  const [editing, setEditing] = useState<Survey | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["measurement-surveys"],
    queryFn: () => fetch("/api/measurement-surveys", { credentials: "include" }).then(r => r.json()),
  });

  const surveys: Survey[] = Array.isArray(data) ? data : [];

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      fetch(`/api/measurement-surveys/${id}`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["measurement-surveys"] }); setEditing(null); toast({ title: isBn ? "আপডেট হয়েছে" : "Updated" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/measurement-surveys/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["measurement-surveys"] }); setDeleting(null); toast({ title: isBn ? "মুছে ফেলা হয়েছে" : "Deleted" }); },
  });

  function openEdit(r: Survey) {
    setEditForm({
      enumeratorName: r.enumeratorName ?? "",
      surveyDate: r.surveyDate ?? "",
      ageGroup: r.ageGroup ?? "none",
      gender: r.gender ?? "none",
      educationLevel: r.educationLevel ?? "",
    });
    setEditing(r);
  }

  const WELLBEING_LABEL: Record<string, string> = isBn
    ? { Good: "ভালো", Fair: "মোটামুটি", Poor: "খারাপ", "Very poor": "খুব খারাপ" }
    : { Good: "Good", Fair: "Fair", Poor: "Poor", "Very poor": "Very poor" };

  const columns: ColumnDef<Survey>[] = [
    { key: "surveyId", label: "Survey ID", labelBn: "জরিপ আইডি", filterType: "text", exportValue: r => r.surveyId ?? "", render: r => <span className="font-mono text-xs font-medium">{r.surveyId}</span> },
    { key: "childName", label: "Child", labelBn: "শিশু", filterType: "text", exportValue: r => r.childName ?? "", render: r => <span className="font-medium">{r.childName || "—"}</span> },
    { key: "centerName", label: "Center", labelBn: "কেন্দ্র", filterType: "text", exportValue: r => (isBn ? ((r as any).centerNameBn || r.centerName) : r.centerName) ?? "", render: r => <span className="text-muted-foreground">{(isBn ? ((r as any).centerNameBn || r.centerName) : r.centerName) || "—"}</span> },
    { key: "enumeratorName", label: "Enumerator", labelBn: "গণনাকারী", filterType: "text", exportValue: r => r.enumeratorName ?? "", render: r => <span className="text-muted-foreground">{r.enumeratorName || "—"}</span> },
    { key: "surveyDate", label: "Survey Date", labelBn: "জরিপের তারিখ", exportValue: r => r.surveyDate ?? "", render: r => r.surveyDate || "—" },
    { key: "ageGroup", label: "Age Group", labelBn: "বয়সের গোষ্ঠী", filterType: "text", exportValue: r => r.ageGroup ?? "", render: r => r.ageGroup || "—" },
    { key: "emotionalWellbeing", label: "Wellbeing", labelBn: "সুস্থতা", filterType: "select", filterOptions: ["Good", "Fair", "Poor", "Very poor"].map(v => ({ value: v, label: v, labelBn: WELLBEING_LABEL[v] ?? v })), exportValue: r => r.emotionalWellbeing ?? "", render: r => r.emotionalWellbeing ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${WELLBEING_COLORS[r.emotionalWellbeing] || "bg-gray-100 text-gray-600"}`}>{WELLBEING_LABEL[r.emotionalWellbeing] ?? r.emotionalWellbeing}</span> : <span className="text-muted-foreground">—</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("surveys.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("surveys.subtitle")}</p>
        </div>
        {canCreate && (
          <Link href="/surveys/new">
            <Button className="gap-2 bg-[#166534] hover:bg-[#0d4427]"><Plus className="h-4 w-4" />{t("surveys.newSurvey")}</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: isBn ? "মোট জরিপ" : "Total Surveys", value: surveys.length, color: "text-primary" },
          { label: isBn ? "এই মাসে" : "This Month", value: surveys.filter(s => s.surveyDate?.startsWith(new Date().toISOString().slice(0, 7))).length, color: "text-blue-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns} data={surveys} isLoading={isLoading} isBn={isBn}
        exportTitle="Measurement Surveys" exportTitleBn="পরিমাপ জরিপের তালিকা"
        emptyText="No surveys found." emptyTextBn="কোনো জরিপ পাওয়া যায়নি।"
        onRowClick={r => navigate(`/surveys/${r.id}`)}
        actions={r => (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            {canEdit && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(r)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {canDelete && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleting(r)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {!canEdit && !canDelete && (
              <Link href={`/surveys/${r.id}`}><Button variant="ghost" size="sm">{t("common.view")}</Button></Link>
            )}
          </div>
        )}
        searchPlaceholder="Search by ID, child, enumerator..."
        searchPlaceholderBn="আইডি, শিশু বা গণনাকারী দিয়ে অনুসন্ধান..."
      />

      <Dialog open={!!editing} onOpenChange={v => { if (!v) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isBn ? "জরিপ সম্পাদনা" : "Edit Survey"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!editing) return;
              const payload: any = { ...editForm };
              if (payload.ageGroup === "none") delete payload.ageGroup;
              if (payload.gender === "none") delete payload.gender;
              updateMutation.mutate({ id: editing.id, data: payload });
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isBn ? "গণনাকারীর নাম" : "Enumerator Name"}</Label>
                <Input value={editForm.enumeratorName} onChange={e => setEditForm(f => ({ ...f, enumeratorName: e.target.value }))} />
              </div>
              <div>
                <Label>{isBn ? "জরিপের তারিখ" : "Survey Date"}</Label>
                <Input type="date" value={editForm.surveyDate} onChange={e => setEditForm(f => ({ ...f, surveyDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isBn ? "বয়সের গোষ্ঠী" : "Age Group"}</Label>
                <Select value={editForm.ageGroup} onValueChange={v => setEditForm(f => ({ ...f, ageGroup: v }))}>
                  <SelectTrigger><SelectValue placeholder={isBn ? "বেছে নিন" : "Select"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{isBn ? "— নির্বাচন করুন —" : "— Select —"}</SelectItem>
                    {AGE_GROUPS.map(g => <SelectItem key={g} value={g}>{isBn ? AGE_GROUP_BN[g] : g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{isBn ? "লিঙ্গ" : "Gender"}</Label>
                <Select value={editForm.gender} onValueChange={v => setEditForm(f => ({ ...f, gender: v }))}>
                  <SelectTrigger><SelectValue placeholder={isBn ? "বেছে নিন" : "Select"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{isBn ? "— নির্বাচন করুন —" : "— Select —"}</SelectItem>
                    <SelectItem value="Male">{isBn ? "পুরুষ" : "Male"}</SelectItem>
                    <SelectItem value="Female">{isBn ? "মহিলা" : "Female"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{isBn ? "শিক্ষার স্তর" : "Education Level"}</Label>
              <Input value={editForm.educationLevel} onChange={e => setEditForm(f => ({ ...f, educationLevel: e.target.value }))} placeholder={isBn ? "যেমন: শ্রেণি ৫" : "e.g. Grade 5"} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>{isBn ? "আপডেট করুন" : "Update"}</Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>{isBn ? "বাতিল" : "Cancel"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={v => { if (!v) setDeleting(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{isBn ? "জরিপ মুছুন" : "Delete Survey"}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{isBn ? `"${deleting?.surveyId}" মুছে ফেলতে চান?` : `Delete "${deleting?.surveyId}"?`}</p>
          <div className="flex gap-2 mt-4">
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleting!.id)} disabled={deleteMutation.isPending}>{isBn ? "মুছুন" : "Delete"}</Button>
            <Button variant="outline" onClick={() => setDeleting(null)}>{isBn ? "বাতিল" : "Cancel"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
