import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useListCourtCases, useCreateCourtCase, useListChildren, getListCourtCasesQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Scale, Pencil, Trash2 } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/DataTable";
import { useAuth, hasRole, usePermission } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getCourtOutcomeLabel } from "@/i18n/labels";

const OUTCOMES = [
  "বিচারাধীন",
  "বিচারে দোষী সাব্যস্ত",
  "আটকাদেশ",
  "অভিভাবক মামলায় বিচারাধীন",
  "অভিভাবক মামলায় আটকাদেশ",
  "উল্লেখ নাই",
];
const LEGAL_AID_OPTIONS = ["government_legal_aid", "ngo_support", "private_lawyer", "family_support", "none"];
const CASE_NO_TYPES = ["CR", "GR"] as const;
const CHILD_CASE_TYPES = [
  "হত্যা",
  "নারী ও শিশু নির্যাতন",
  "মাদক",
  "দ্রুত বিচার",
  "ছিনতাই",
  "চুরি মামলা",
  "অস্ত্র মামলা",
  "মারামারি",
  "সাধারন ডায়েরী",
  "ডাকাতী",
  "তথ্য ও প্রযুক্তি/পর্নোগ্রাফি",
  "বিস্ফোরক দ্রব্য বিশেষ ক্ষমতা আইন",
  "বিবিধ",
  "সন্ত্রাস বিরোধী আইন",
  "বৈদেশিক নাগরিক আইন",
];

const WORKFLOW_LABEL: Record<string, string> = {
  Draft: "খসড়া", submitted_to_df: "কেস ওয়ার্কারের নিকট প্রেরিত", reviewed_by_df: "কেস ওয়ার্কার কর্তৃক পর্যালোচিত",
  sent_back_to_cw_by_df: "কেস ওয়ার্কার কর্তৃক ফেরত", submitted_to_po: "প্রবেশন অফিসারের নিকট প্রেরিত",
  reviewed_by_po: "প্রবেশন অফিসার কর্তৃক পর্যালোচিত", sent_back_to_cw_by_po: "প্রবেশন অফিসার কর্তৃক ফেরত",
  submitted_to_supt: "সুপারিনটেনডেন্টের নিকট প্রেরিত", approved: "সুপারিনটেনডেন্ট অনুমোদিত", rejected: "প্রত্যাখ্যাত",
};
const WORKFLOW_LABEL_EN: Record<string, string> = {
  Draft: "Draft", submitted_to_df: "Forwarded to Case Worker", reviewed_by_df: "Reviewed by Case Worker",
  sent_back_to_cw_by_df: "Sent Back by Case Worker", submitted_to_po: "Forwarded to Probation Officer",
  reviewed_by_po: "Reviewed by Probation Officer", sent_back_to_cw_by_po: "Sent Back by Probation Officer",
  submitted_to_supt: "Forwarded to Superintendent", approved: "Approved by Superintendent", rejected: "Rejected",
};
const WORKFLOW_COLOR: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-800",
  submitted_to_df: "bg-blue-100 text-blue-800", reviewed_by_df: "bg-blue-100 text-blue-800",
  sent_back_to_cw_by_df: "bg-orange-100 text-orange-800", submitted_to_po: "bg-blue-100 text-blue-800",
  reviewed_by_po: "bg-blue-100 text-blue-800", sent_back_to_cw_by_po: "bg-orange-100 text-orange-800",
  submitted_to_supt: "bg-blue-100 text-blue-800", approved: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800",
};
const EMPTY_FORM = {
  childId: "",
  courtName: "",
  policeStationName: "",
  grNumber: "",
  caseNo: "",
  legalSection: "",
  legalAidType: "",
  hearingDate: "",
  lastHearingDate: "",
  lawyerName: "",
  childCaseType: "",
  previousCaseInvolvement: false,
  outcome: "বিচারাধীন",
  nextHearingDate: "",
  appearanceStatus: "",
  rescheduled: false,
  reasonForNonAppearance: "",
  rescheduleDate: "",
  currentCaseStatus: "",
  courtAttendanceDetails: "",
};

function parseCourtHearingMeta(raw?: string | null): {
  appearanceStatus: string;
  rescheduled: boolean;
  reasonForNonAppearance: string;
  rescheduleDate: string;
} {
  if (!raw) return { appearanceStatus: "", rescheduled: false, reasonForNonAppearance: "", rescheduleDate: "" };
  try {
    const parsed = JSON.parse(raw);
    return {
      appearanceStatus: typeof parsed?.appearanceStatus === "string" ? parsed.appearanceStatus : "",
      rescheduled: !!parsed?.rescheduled,
      reasonForNonAppearance: typeof parsed?.reasonForNonAppearance === "string" ? parsed.reasonForNonAppearance : "",
      rescheduleDate: typeof parsed?.rescheduleDate === "string" ? parsed.rescheduleDate : "",
    };
  } catch {
    return { appearanceStatus: "", rescheduled: false, reasonForNonAppearance: "", rescheduleDate: "" };
  }
}

function parseCaseNo(raw?: string | null, grNumber?: string | null): { type: (typeof CASE_NO_TYPES)[number]; number: string } {
  const value = String(raw ?? "").trim();
  if (value) {
    const match = value.match(/^\s*(CR|GR)\s*[-/:]?\s*(.*)$/i);
    if (match) {
      return {
        type: match[1].toUpperCase() as (typeof CASE_NO_TYPES)[number],
        number: (match[2] ?? "").trim(),
      };
    }
    return { type: "GR", number: value };
  }
  if (grNumber) return { type: "GR", number: String(grNumber).trim() };
  return { type: "GR", number: "" };
}

export default function CourtCasesList() {
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { user } = useAuth();
  const { toast } = useToast();
  const canView   = usePermission("court-cases", "view");
  const canCreate = usePermission("court-cases", "create");
  const canEdit   = usePermission("court-cases", "edit");
  const canDelete = usePermission("court-cases", "delete");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [caseNoType, setCaseNoType] = useState<(typeof CASE_NO_TYPES)[number]>("GR");
  const [caseNoNumber, setCaseNoNumber] = useState("");

  const { data: cases = [], isLoading } = useListCourtCases({}, { query: { queryKey: getListCourtCasesQueryKey({}) } });
  const { data: childrenResp } = useListChildren({}, { query: { queryKey: [] } });
  const children = childrenResp?.data ?? [];
  const createCase = useCreateCourtCase();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/court-cases/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || e.error || "Update failed"); }
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCourtCasesQueryKey({}) }); closeDialog(); toast({ title: isBn ? "আপডেট হয়েছে" : "Updated" }); },
    onError: (err: any) => { toast({ title: isBn ? "ব্যর্থ হয়েছে" : "Update failed", description: err.message, variant: "destructive" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/court-cases/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCourtCasesQueryKey({}) }); setDeleting(null); toast({ title: isBn ? "মুছে ফেলা হয়েছে" : "Deleted" }); },
  });

  const OUTCOME_LABEL: Record<string, string> = Object.fromEntries(OUTCOMES.map(o => [o, getCourtOutcomeLabel(o, isBn)]));
  const LEGAL_AID_LABEL: Record<string, string> = {
    government_legal_aid: isBn ? "সরকারি আইনগত সহায়তা" : "Government Legal Aid",
    ngo_support: isBn ? "এনজিও সহায়তা" : "NGO Support",
    private_lawyer: isBn ? "ব্যক্তিগত আইনজীবী" : "Private Lawyer",
    family_support: isBn ? "পারিবারিক সহায়তা" : "Family Support",
    none: isBn ? "কোনো সহায়তা পাচ্ছে না" : "No Legal Aid",
  };
  const CHILD_CASE_TYPE_LABEL: Record<string, string> = Object.fromEntries(
    CHILD_CASE_TYPES.map((item) => [item, item]),
  );

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setCaseNoType("GR");
    setCaseNoNumber("");
    setOpen(true);
  }
  function openEdit(r: any) {
    const hearingMeta = parseCourtHearingMeta(r.courtAttendanceDetails);
    const parsedCaseNo = parseCaseNo(r.caseNo, r.grNumber);
    setForm({
      childId: String(r.childId),
      courtName: r.courtName ?? "",
      policeStationName: r.policeStationName ?? "",
      grNumber: r.grNumber ?? "",
      caseNo: r.caseNo ?? "",
      legalSection: r.legalSection ?? "",
      legalAidType: r.legalAidType ?? "",
      lastHearingDate: r.lastHearingDate ?? "",
      lawyerName: r.lawyerName ?? "",
      childCaseType: r.childCaseType ?? "",
      previousCaseInvolvement: !!r.previousCaseInvolvement,
      outcome: r.outcome ?? "বিচারাধীন",
      nextHearingDate: r.nextHearingDate ?? "",
      hearingDate: r.hearingDate ?? "",
      appearanceStatus: hearingMeta.appearanceStatus || r.currentCaseStatus || "",
      rescheduled: hearingMeta.rescheduled,
      reasonForNonAppearance: hearingMeta.reasonForNonAppearance,
      rescheduleDate: hearingMeta.rescheduleDate || r.nextHearingDate || "",
      currentCaseStatus: r.currentCaseStatus ?? "",
      courtAttendanceDetails: r.courtAttendanceDetails ?? "",
    });
    setCaseNoType(parsedCaseNo.type);
    setCaseNoNumber(parsedCaseNo.number);
    setEditing(r);
    setOpen(true);
  }
  function closeDialog() {
    setOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setCaseNoType("GR");
    setCaseNoNumber("");
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const caseNoNumberTrimmed = caseNoNumber.trim();
    if (!caseNoNumberTrimmed) {
      toast({ title: isBn ? "মামলা নম্বর দিন" : "Case number is required", variant: "destructive" });
      return;
    }

    const data = {
      ...form,
      caseNo: `${caseNoType}/${caseNoNumberTrimmed}`,
      grNumber: caseNoType === "GR" ? caseNoNumberTrimmed : "",
      childId: parseInt(form.childId),
      hearingDate: form.hearingDate || null,
      lastHearingDate: form.lastHearingDate || null,
      nextHearingDate: form.nextHearingDate || null,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createCase.mutate({ data } as any, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCourtCasesQueryKey({}) });
          closeDialog();
          toast({ title: isBn ? "সংরক্ষিত হয়েছে" : "Saved" });
        },
      });
    }
  };

  type CRow = (typeof cases)[number];
  const columns: ColumnDef<CRow>[] = [
    { key: "courtCaseId", label: "Case ID", labelBn: "মামলা আইডি", filterType: "text", exportValue: r => r.courtCaseId ?? "", render: r => <span className="font-mono text-xs">{r.courtCaseId}</span> },
    { key: "childName", label: "Child", labelBn: "শিশু", filterType: "text", exportValue: r => (r as any).childName ?? `#${r.childId}`, render: r => <span className="font-medium">{(r as any).childName || `#${r.childId}`}</span> },
    { key: "courtName", label: "Court", labelBn: "আদালত", filterType: "text", exportValue: r => r.courtName ?? "", render: r => r.courtName || "—" },
    { key: "caseNo", label: "Case No", labelBn: "মামলা নম্বর", filterType: "text", exportValue: r => r.caseNo ?? "", render: r => r.caseNo || "—" },
    { key: "hearingDate", label: "Hearing Date", labelBn: "শুনানির তারিখ", exportValue: r => r.hearingDate ?? "" },
    { key: "nextHearingDate", label: "Next Hearing Date", labelBn: "পরবর্তী শুনানির তারিখ", exportValue: r => r.nextHearingDate ?? "" },
    { key: "outcome", label: "Outcome", labelBn: "ফলাফল", filterType: "select", filterOptions: OUTCOMES.map(o => ({ value: o, label: o, labelBn: OUTCOME_LABEL[o] ?? o })), exportValue: r => r.outcome ?? "", render: r => <span className="px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700">{OUTCOME_LABEL[r.outcome ?? ""] ?? r.outcome}</span> },
    {
      key: "workflowState", label: "Approval", labelBn: "অনুমোদন অবস্থা",
      exportValue: r => (r as any).workflowState ?? "",
      render: (r, isBn) => {
        const w = (r as any).workflowState || "Draft";
        const label = isBn ? (WORKFLOW_LABEL[w] || w) : (WORKFLOW_LABEL_EN[w] || w);
        const color = WORKFLOW_COLOR[w] || "bg-gray-100 text-gray-800";
        return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${color}`}>{label}</span>;
      }
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("courtCases.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{isBn ? "শুনানির তথ্য ও আইনি কার্যক্রম পর্যবেক্ষণ" : "Hearing information and legal proceeding monitoring"}</p>
        </div>
        {canCreate && (
          <div className="flex gap-2">
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" /> {isBn ? "নতুন মামলা" : "New Court Case"}
            </Button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns} data={cases} isLoading={isLoading} isBn={isBn}
        exportTitle="Court Cases" exportTitleBn="আদালতের মামলার তালিকা"
        emptyText="No court cases found." emptyTextBn="কোনো আদালতের মামলা নেই।"
        onRowClick={r => navigate(`/court-cases/${r.id}`)}
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
              <Button variant="ghost" size="sm" onClick={() => navigate(`/court-cases/${r.id}`)}>
                {isBn ? "দেখুন" : "View"}
              </Button>
            )}
          </div>
        )}
      />

      <Dialog open={open} onOpenChange={v => { if (!v) closeDialog(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? (isBn ? "আদালতের মামলা সম্পাদনা" : "Edit Court Case") : (isBn ? "নতুন আদালতের মামলা" : "New Court Case")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{isBn ? "শিশু *" : "Child *"}</Label>
              <Select value={form.childId} onValueChange={v => setForm(f => ({ ...f, childId: v }))}>
                <SelectTrigger><SelectValue placeholder={isBn ? "শিশু বাছুন" : "Select child"} /></SelectTrigger>
                <SelectContent>{children.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.fullName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t("courtCases.courtName")} *</Label><Input value={form.courtName} onChange={e => setForm(f => ({ ...f, courtName: e.target.value }))} required /></div>
              <div><Label>{t("courtCases.policeStationName")}</Label><Input value={form.policeStationName} onChange={e => setForm(f => ({ ...f, policeStationName: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isBn ? "মামলা নম্বর (CR/GR)" : "Case No (CR/GR)"}</Label>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <Select value={caseNoType} onValueChange={(v: (typeof CASE_NO_TYPES)[number]) => setCaseNoType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CASE_NO_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input
                    value={caseNoNumber}
                    onChange={e => setCaseNoNumber(e.target.value)}
                    placeholder={isBn ? "নম্বর লিখুন" : "Enter number"}
                  />
                </div>
              </div>
              <div />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t("courtCases.legalSection")}</Label><Input value={form.legalSection} onChange={e => setForm(f => ({ ...f, legalSection: e.target.value }))} /></div>
              <div>
                <Label>{t("courtCases.legalAidType")}</Label>
              <Select value={form.legalAidType} onValueChange={v => setForm(f => ({ ...f, legalAidType: v }))}>
                <SelectTrigger><SelectValue placeholder={isBn ? "সহায়তার ধরন বাছুন" : "Select legal aid"} /></SelectTrigger>
                <SelectContent>{LEGAL_AID_OPTIONS.map(o => <SelectItem key={o} value={o}>{LEGAL_AID_LABEL[o]}</SelectItem>)}</SelectContent>
              </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{isBn ? "শুনানির তারিখ" : "Hearing Date"}</Label><Input type="date" value={form.hearingDate} onChange={e => setForm(f => ({ ...f, hearingDate: e.target.value }))} /></div>
              <div><Label>{isBn ? "পরবর্তী শুনানির তারিখ" : "Next Hearing Date"}</Label><Input type="date" value={form.nextHearingDate} onChange={e => setForm(f => ({ ...f, nextHearingDate: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("courtCases.childCaseType")}</Label>
                <Select value={form.childCaseType} onValueChange={v => setForm(f => ({ ...f, childCaseType: v }))}>
                  <SelectTrigger><SelectValue placeholder={isBn ? "মামলার ধরন বাছুন" : "Select case type"} /></SelectTrigger>
                  <SelectContent>{CHILD_CASE_TYPES.map(o => <SelectItem key={o} value={o}>{CHILD_CASE_TYPE_LABEL[o] ?? o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>{t("courtCases.lawyerName")}</Label><Input value={form.lawyerName} onChange={e => setForm(f => ({ ...f, lawyerName: e.target.value }))} /></div>
            </div>
            <div>
              <Label>{t("courtCases.previousCaseInvolvement")}</Label>
              <div className="flex gap-3 mt-2">
                <Button type="button" variant={form.previousCaseInvolvement ? "default" : "outline"} onClick={() => setForm(f => ({ ...f, previousCaseInvolvement: true }))}>{isBn ? "হ্যাঁ" : "Yes"}</Button>
                <Button type="button" variant={!form.previousCaseInvolvement ? "default" : "outline"} onClick={() => setForm(f => ({ ...f, previousCaseInvolvement: false }))}>{isBn ? "না" : "No"}</Button>
              </div>
            </div>
            <div>
              <Label>{t("courtCases.outcome")}</Label>
              <Select value={form.outcome} onValueChange={v => setForm(f => ({ ...f, outcome: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OUTCOMES.map(o => <SelectItem key={o} value={o}>{OUTCOME_LABEL[o] ?? o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={createCase.isPending || updateMutation.isPending}>
                {editing ? (isBn ? "আপডেট করুন" : "Update") : (isBn ? "মামলা সংরক্ষণ করুন" : "Save Court Case")}
              </Button>
              <Button type="button" variant="outline" onClick={closeDialog}>{isBn ? "বাতিল" : "Cancel"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={v => { if (!v) setDeleting(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{isBn ? "মামলা মুছুন" : "Delete Court Case"}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{isBn ? `"${(deleting as any)?.courtCaseId}" মুছে ফেলতে চান?` : `Delete "${(deleting as any)?.courtCaseId}"?`}</p>
          <div className="flex gap-2 mt-4">
            <Button variant="destructive" onClick={() => deleteMutation.mutate((deleting as any).id)} disabled={deleteMutation.isPending}>{isBn ? "মুছুন" : "Delete"}</Button>
            <Button variant="outline" onClick={() => setDeleting(null)}>{isBn ? "বাতিল" : "Cancel"}</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
