import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetCourtCase, getGetCourtCaseQueryKey, getListCourtCasesQueryKey } from "@workspace/api-client-react";
import { Loader2, ArrowLeft, Scale, Trash2, Pencil, AlertTriangle, X, Save } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { DetailField, SectionCard } from "@/components/DetailField";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { getCourtOutcomeLabel } from "@/i18n/labels";
import { useToast } from "@/hooks/use-toast";
import { WorkflowTimeline } from "@/components/WorkflowTimeline";
import { WorkflowActions } from "@/components/WorkflowActions";
import { useAuth } from "@/contexts/AuthContext";

type HearingStatus = "Appeared" | "Absent" | "Pending" | "";

type HearingRow = {
  hearingDate: string;
  status: HearingStatus;
  reason: string;
  rescheduled: "Yes" | "No";
  nextHearingDate: string;
};

function getWorkflowLabel(state: string, isBn: boolean) {
  const w = state || "Draft";
  const labelBn: Record<string, string> = {
    Draft: "খসড়া", submitted_to_df: "DF এ পাঠানো হয়েছে", reviewed_by_df: "DF কর্তৃক পর্যালোচিত",
    sent_back_to_cw_by_df: "DF কর্তৃক ফেরত", submitted_to_po: "PO এ পাঠানো হয়েছে",
    reviewed_by_po: "PO কর্তৃক পর্যালোচিত", sent_back_to_cw_by_po: "PO কর্তৃক ফেরত",
    submitted_to_supt: "তত্ত্বাবধায়কের কাছে", approved: "অনুমোদিত", rejected: "প্রত্যাখ্যাত"
  };
  const labelEn: Record<string, string> = {
    Draft: "Draft", submitted_to_df: "Submitted to DF", reviewed_by_df: "Reviewed by DF",
    sent_back_to_cw_by_df: "Sent Back by DF", submitted_to_po: "Submitted to PO",
    reviewed_by_po: "Reviewed by PO", sent_back_to_cw_by_po: "Sent Back by PO",
    submitted_to_supt: "Submitted to Supt", approved: "Approved", rejected: "Rejected"
  };
  return isBn ? (labelBn[w] || w) : (labelEn[w] || w);
}

const EMPTY_HEARING: HearingRow = {
  hearingDate: "",
  status: "",
  reason: "",
  rescheduled: "No",
  nextHearingDate: "",
};

function normalizeDate(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.length >= 10 ? value.slice(0, 10) : value;
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const [y, m, d] = String(value).slice(0, 10).split("-");
  if (!y || !m || !d) return value;
  return `${d}.${m}.${y.slice(2)}`;
}

function parseHearingSchedule(courtCase: any): HearingRow[] {
  const raw = courtCase?.courtAttendanceDetails;
  if (!raw || typeof raw !== "string") return [];

  try {
    const parsed = JSON.parse(raw);
    const history = Array.isArray(parsed?.history) ? parsed.history : Array.isArray(parsed) ? parsed : null;
    if (!history) return [];

    return history
      .map((row: any) => ({
        hearingDate: normalizeDate(row?.hearingDate),
        status: (row?.status || "") as HearingStatus,
        reason: typeof row?.reason === "string" ? row.reason : "",
        rescheduled: row?.rescheduled === "Yes" || row?.rescheduled === true ? "Yes" : "No",
        nextHearingDate: normalizeDate(row?.nextHearingDate),
      }))
      .filter((row: HearingRow) => row.hearingDate || row.nextHearingDate || row.reason || row.status);
  } catch {
    return [];
  }
}

export default function CourtCaseDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isBn = i18n.language === "bn";
  const caseId = parseInt(id || "0", 10);

  const { data: courtCase, isLoading } = useGetCourtCase(caseId, {
    query: { queryKey: getGetCourtCaseQueryKey(caseId), enabled: !!caseId },
  });

  const [hearingForm, setHearingForm] = useState<HearingRow>(EMPTY_HEARING);
  const [hearingRows, setHearingRows] = useState<HearingRow[]>([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const { user } = useAuth();
  const role = (user as any)?.roleName;
  const isCW = role === "Case Worker" || role === "Super Admin" || role === "Admin";
  const workflowState = (courtCase as any)?.workflowState || "Draft";
  const isSentBack = workflowState === "sent_back_to_cw_by_df" || workflowState === "sent_back_to_cw_by_po";
  const sentBackNotes = (courtCase as any)?.sentBackNotes;

  useEffect(() => {
    if (!courtCase) return;
    const historyRows = parseHearingSchedule(courtCase);
    setHearingRows(historyRows);

    if (historyRows.length === 0) {
      // First row logic: pre-populate from case input
      setHearingForm(prev => ({
        ...prev,
        hearingDate: normalizeDate(courtCase.hearingDate),
        nextHearingDate: normalizeDate(courtCase.nextHearingDate),
      }));
    } else {
      const lastRow = historyRows[historyRows.length - 1];
      setHearingForm(prev => ({
        ...prev,
        hearingDate: lastRow.nextHearingDate,
      }));
    }
  }, [courtCase]);

  const saveHearingScheduleMutation = useMutation({
    mutationFn: async (rows: HearingRow[]) => {
      const latest = rows[rows.length - 1];
      const previous = rows[rows.length - 2];
      const payload = {
        courtAttendanceDetails: JSON.stringify({ history: rows }),
        hearingDate: latest?.hearingDate || null,
        currentCaseStatus: latest?.status === "Appeared" ? "Present" : (latest?.status || null),
        lastHearingDate: previous?.hearingDate || latest?.hearingDate || null,
        nextHearingDate: latest?.nextHearingDate || null,
      };

      const res = await fetch(`/api/court-cases/${caseId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetCourtCaseQueryKey(caseId) });
      queryClient.invalidateQueries({ queryKey: getListCourtCasesQueryKey({}) });
      toast({ title: isBn ? "শুনানির সময়সূচি সংরক্ষণ হয়েছে" : "Hearing schedule saved" });
    },
    onError: () => {
      toast({ title: isBn ? "সংরক্ষণ ব্যর্থ" : "Save failed", variant: "destructive" });
    },
  });

  const updateCaseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/court-cases/${caseId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetCourtCaseQueryKey(caseId) });
      queryClient.invalidateQueries({ queryKey: getListCourtCasesQueryKey({}) });
      setEditing(false);
      toast({ title: isBn ? "মামলা আপডেট হয়েছে" : "Court case updated" });
    },
    onError: (err: any) => {
      toast({ title: isBn ? "ব্যর্থ হয়েছে" : "Update failed", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!courtCase) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Scale className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{isBn ? "মামলা পাওয়া যায়নি।" : "Court case not found."}</p>
        <Button variant="outline" onClick={() => navigate("/court-cases")}>{isBn ? "মামলার তালিকায় ফিরুন" : "Back to Court Cases"}</Button>
      </div>
    );
  }

  const isUpcoming = courtCase.nextHearingDate && new Date(courtCase.nextHearingDate) >= new Date();
  const outcomeLabel = getCourtOutcomeLabel(courtCase.outcome, isBn);
  const legalAidLabelMap: Record<string, string> = {
    government_legal_aid: isBn ? "সরকারি আইনগত সহায়তা" : "Government Legal Aid",
    ngo_support: isBn ? "এনজিও সহায়তা" : "NGO Support",
    private_lawyer: isBn ? "ব্যক্তিগত আইনজীবী" : "Private Lawyer",
    family_support: isBn ? "পারিবারিক সহায়তা" : "Family Support",
    none: isBn ? "কোনো সহায়তা পাচ্ছে না" : "No Legal Aid",
  };
  const legalAidLabel = legalAidLabelMap[(courtCase as any).legalAidType ?? ""] ?? (courtCase as any).legalAidType;
  const childCaseTypeLabelMap: Record<string, string> = {
    "Juvenile Offence": isBn ? "কিশোর অপরাধ" : "Juvenile Offence",
    Neglect: isBn ? "অবহেলা" : "Neglect",
    Abuse: isBn ? "নির্যাতন" : "Abuse",
    Trafficking: isBn ? "পাচার" : "Trafficking",
    Abandoned: isBn ? "পরিত্যক্ত" : "Abandoned",
    Other: isBn ? "অন্যান্য" : "Other",
  };
  const childCaseTypeLabel = childCaseTypeLabelMap[(courtCase as any).childCaseType ?? ""] ?? (courtCase as any).childCaseType;

  const persistRows = (rows: HearingRow[]) => {
    saveHearingScheduleMutation.mutate(rows);
  };

  const addHearingRow = () => {
    if (!hearingForm.hearingDate) {
      toast({ title: isBn ? "শুনানির তারিখ দিন" : "Hearing date required", variant: "destructive" });
      return;
    }
    if (!hearingForm.nextHearingDate) {
      toast({ title: isBn ? "পরবর্তী শুনানির তারিখ দিন" : "Next hearing date required", variant: "destructive" });
      return;
    }
    if (!hearingForm.status) {
      toast({ title: isBn ? "স্ট্যাটাস নির্বাচন করুন" : "Status is required", variant: "destructive" });
      return;
    }

    // Date validation: nextHearingDate can't be before hearingDate
    if (hearingForm.nextHearingDate && hearingForm.hearingDate && new Date(hearingForm.nextHearingDate) < new Date(hearingForm.hearingDate)) {
      toast({
        title: isBn ? "পরবর্তী শুনানির তারিখ বর্তমান শুনানির তারিখের আগে হতে পারে না" : "Next hearing date cannot be before hearing date",
        variant: "destructive"
      });
      return;
    }

    const nextRows = [...hearingRows, hearingForm];
    setHearingRows(nextRows);
    setHearingForm({
      ...EMPTY_HEARING,
      hearingDate: hearingForm.nextHearingDate, // auto-fetch next hearing date
    });
    persistRows(nextRows);
  };

  const removeHearingRow = (index: number) => {
    const nextRows = hearingRows.filter((_, idx) => idx !== index);
    setHearingRows(nextRows);
    persistRows(nextRows);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/court-cases")} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground font-mono">{courtCase.courtCaseId}</h1>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground font-mono">{courtCase.caseNo}</span>
            {isUpcoming && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{isBn ? `পরবর্তী হাজিরা: ${courtCase.nextHearingDate}` : `Next Appearance: ${courtCase.nextHearingDate}`}</span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn ? "শিশু: " : "Child: "}<Link href={`/children/${courtCase.childId}`} className="text-primary hover:underline font-medium">{(courtCase as any).childName || `#${courtCase.childId}`}</Link>
            {" · "}{courtCase.courtName}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{isBn ? "অনুমোদন অবস্থা:" : "Approval Status:"}</span>
            <span className="font-medium px-2 py-0.5 rounded-full bg-slate-100">{getWorkflowLabel((courtCase as any).workflowState, isBn)}</span>
          </div>
          {isCW && (
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => {
              setEditForm({
                courtName: courtCase.courtName ?? "",
                policeStationName: (courtCase as any).policeStationName ?? "",
                caseNo: courtCase.caseNo ?? "",
                legalSection: (courtCase as any).legalSection ?? "",
                lawyerName: courtCase.lawyerName ?? "",
                legalAidType: (courtCase as any).legalAidType ?? "",
                hearingDate: courtCase.hearingDate ?? "",
                nextHearingDate: courtCase.nextHearingDate ?? "",
                outcome: courtCase.outcome ?? "",
              });
              setEditing(true);
            }}>
              <Pencil className="h-3.5 w-3.5" />{isBn ? "সম্পাদন করুন" : "Edit Case"}
            </Button>
          )}
        </div>
      </div>

      <WorkflowActions recordType="court_case" recordId={courtCase.id} currentStatus={(courtCase as any).workflowState || "Draft"} onSuccess={() => { queryClient.invalidateQueries({ queryKey: getGetCourtCaseQueryKey(caseId) }) }} />

      {/* Sent-back message banner for CW */}
      {isSentBack && sentBackNotes && (
        <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
          <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-800">
              {workflowState === "sent_back_to_cw_by_df"
                ? (isBn ? "DF কর্তৃক প্রত্যাবর্তিত — সংশোধন প্রয়োজন" : "Sent back by DF — Update Required")
                : (isBn ? "PO কর্তৃক প্রত্যাবর্তিত — সংশোধন প্রয়োজন" : "Sent back by PO — Update Required")}
            </p>
            <p className="text-sm text-orange-700 mt-1">{sentBackNotes}</p>
          </div>
        </div>
      )}

      {/* Inline edit form */}
      {editing && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-blue-900">{isBn ? "মামলা সম্পাদন করুন" : "Edit Court Case"}</h3>
            <Button size="icon" variant="ghost" onClick={() => setEditing(false)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div><Label>{isBn ? "আদালতের নাম" : "Court Name"} *</Label>
              <Input value={editForm.courtName} onChange={e => setEditForm((f: any) => ({ ...f, courtName: e.target.value }))} /></div>
            <div><Label>{isBn ? "থানা" : "Police Station"}</Label>
              <Input value={editForm.policeStationName} onChange={e => setEditForm((f: any) => ({ ...f, policeStationName: e.target.value }))} /></div>
            <div><Label>{isBn ? "মামলা নম্বর" : "Case No"} *</Label>
              <Input value={editForm.caseNo} onChange={e => setEditForm((f: any) => ({ ...f, caseNo: e.target.value }))} /></div>
            <div><Label>{isBn ? "আইন ধারা" : "Legal Section"}</Label>
              <Input value={editForm.legalSection} onChange={e => setEditForm((f: any) => ({ ...f, legalSection: e.target.value }))} /></div>
            <div><Label>{isBn ? "আইনজীবীর নাম" : "Lawyer Name"}</Label>
              <Input value={editForm.lawyerName} onChange={e => setEditForm((f: any) => ({ ...f, lawyerName: e.target.value }))} /></div>
            <div><Label>{isBn ? "শুনানির তারিখ" : "Hearing Date"}</Label>
              <Input type="date" value={editForm.hearingDate} onChange={e => setEditForm((f: any) => ({ ...f, hearingDate: e.target.value }))} /></div>
            <div><Label>{isBn ? "পরবর্তী শুনানির তারিখ" : "Next Hearing Date"}</Label>
              <Input type="date" value={editForm.nextHearingDate} onChange={e => setEditForm((f: any) => ({ ...f, nextHearingDate: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(false)}>{isBn ? "বাতিল" : "Cancel"}</Button>
            <Button
              onClick={() => updateCaseMutation.mutate({ ...editForm, childId: courtCase.childId })}
              disabled={updateCaseMutation.isPending}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" />
              {updateCaseMutation.isPending ? (isBn ? "সংরক্ষণ হচ্ছে..." : "Saving...") : (isBn ? "সংরক্ষণ করুন" : "Save Changes")}
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] lg:grid-cols-[1fr_2fr] gap-4">
        <SectionCard title={isBn ? "আদালতের তথ্য" : "Court Information"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            <DetailField label={isBn ? "মামলার আইডি" : "Court Case ID"} value={courtCase.courtCaseId} />
            <DetailField label={t("courtCases.courtName")} value={courtCase.courtName} />
            <DetailField label={t("courtCases.policeStationName")} value={(courtCase as any).policeStationName} />
            <DetailField label={t("courtCases.caseNo")} value={courtCase.caseNo} />
            <DetailField label={t("courtCases.legalSection")} value={(courtCase as any).legalSection} />
            <DetailField label={t("courtCases.lawyerName")} value={courtCase.lawyerName} />
            <DetailField label={t("courtCases.legalAidType")} value={legalAidLabel} />
            <DetailField label={t("courtCases.childCaseType")} value={childCaseTypeLabel} />
            <DetailField label={isBn ? "শুনানির তারিখ" : "Hearing Date"} value={courtCase.hearingDate} />
            <DetailField label={isBn ? "পরবর্তী শুনানির তারিখ" : "Next Hearing Date"} value={courtCase.nextHearingDate} />
            <DetailField label={t("courtCases.previousCaseInvolvement")} value={(courtCase as any).previousCaseInvolvement == null ? undefined : (courtCase as any).previousCaseInvolvement ? (isBn ? "হ্যাঁ" : "Yes") : (isBn ? "না" : "No")} />
          </div>
        </SectionCard>

        <SectionCard title={t("courtCases.hearingSchedule")}>
          <div className="space-y-4">
            <div className="rounded-md border overflow-auto max-h-72">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted z-10">
                  <tr className="text-left">
                    <th className="px-3 py-2 whitespace-nowrap">{isBn ? "শুনানির তারিখ" : "Hearing Date"}</th>
                    <th className="px-3 py-2 whitespace-nowrap">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                    <th className="px-3 py-2">{isBn ? "কারণ" : "Reason"}</th>
                    <th className="px-3 py-2 whitespace-nowrap">{isBn ? "রিশিডিউল?" : "Rescheduled?"}</th>
                    <th className="px-3 py-2 whitespace-nowrap">{isBn ? "পরবর্তী শুনানির তারিখ" : "Next Hearing Date"}</th>
                    <th className="px-3 py-2 w-[70px]">{isBn ? "মুছুন" : "Delete"}</th>
                  </tr>
                </thead>
                <tbody>
                  {hearingRows.length === 0 ? (
                    <tr>
                      <td className="px-3 py-4 text-muted-foreground text-center" colSpan={6}>
                        {isBn ? "এখনও কোনো শুনানির সারি নেই" : "No hearing rows yet"}
                      </td>
                    </tr>
                  ) : (
                    hearingRows.map((row, index) => (
                      <tr key={`${row.hearingDate}-${index}`} className="border-t">
                        <td className="px-3 py-2">{formatDate(row.hearingDate)}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            row.status === "Appeared" ? "bg-green-100 text-green-700" :
                            row.status === "Absent" ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {row.status === "Appeared" ? (isBn ? "উপস্থিত" : "Appeared") :
                             row.status === "Absent" ? (isBn ? "অনুপস্থিত" : "Absent") :
                             (isBn ? "মুলতবি" : "Pending")}
                          </span>
                        </td>
                        <td className="px-3 py-2">{row.reason || "—"}</td>
                        <td className="px-3 py-2">{row.rescheduled === "Yes" ? (isBn ? "হ্যাঁ" : "Yes") : (isBn ? "না" : "No")}</td>
                        <td className="px-3 py-2">{formatDate(row.nextHearingDate)}</td>
                        <td className="px-3 py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => removeHearingRow(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="rounded-md border p-3 bg-muted/20">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <Label>{isBn ? "শুনানির তারিখ" : "Hearing Date"}</Label>
                  <Input
                    type="date"
                    value={hearingForm.hearingDate}
                    className="cursor-pointer"
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    onChange={(e) => setHearingForm((prev) => ({ ...prev, hearingDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>{isBn ? "স্ট্যাটাস" : "Status"}</Label>
                  <Select
                    value={hearingForm.status}
                    onValueChange={(value: HearingStatus) => setHearingForm((prev) => ({ ...prev, status: value, reason: value === "Appeared" ? "" : prev.reason }))}
                  >
                    <SelectTrigger><SelectValue placeholder={isBn ? "বাছুন" : "Select"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Appeared">{isBn ? "উপস্থিত" : "Appeared"}</SelectItem>
                      <SelectItem value="Absent">{isBn ? "অনুপস্থিত" : "Absent"}</SelectItem>
                      <SelectItem value="Pending">{isBn ? "মুলতবি" : "Pending"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isBn ? "কারণ" : "Reason"}</Label>
                  <Input
                    value={hearingForm.reason}
                    onChange={(e) => setHearingForm((prev) => ({ ...prev, reason: e.target.value }))}
                    disabled={hearingForm.status === "Appeared"}
                    placeholder={hearingForm.status === "Appeared" ? "—" : (isBn ? "কারণ লিখুন" : "Enter reason")}
                  />
                </div>
                <div>
                  <Label>{isBn ? "রিশিডিউল?" : "Rescheduled?"}</Label>
                  <Select
                    value={hearingForm.rescheduled}
                    onValueChange={(value: "Yes" | "No") => setHearingForm((prev) => ({ ...prev, rescheduled: value }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">{isBn ? "হ্যাঁ" : "Yes"}</SelectItem>
                      <SelectItem value="No">{isBn ? "না" : "No"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isBn ? "পরবর্তী শুনানির তারিখ" : "Next Hearing Date"}</Label>
                  <Input
                    type="date"
                    value={hearingForm.nextHearingDate}
                    className="cursor-pointer"
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    onChange={(e) => setHearingForm((prev) => ({ ...prev, nextHearingDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <Button type="button" onClick={addHearingRow}>{isBn ? "সারি যোগ করুন" : "Add Hearing Row"}</Button>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title={t("courtCases.caseOutcome")}>
        <p className="text-sm text-foreground leading-relaxed">
          {outcomeLabel || <span className="text-muted-foreground italic">{isBn ? "এখনো কোনো ফলাফল নেই" : "No outcome recorded yet"}</span>}
        </p>
      </SectionCard>

      <SectionCard title={t("timestamps.title")}>
        <div className="grid grid-cols-2 gap-4">
          <DetailField label={t("timestamps.createdAt")} value={courtCase.createdAt ? new Date(courtCase.createdAt).toLocaleString() : undefined} />
          <DetailField label={t("timestamps.lastUpdated")} value={courtCase.updatedAt ? new Date(courtCase.updatedAt).toLocaleString() : undefined} />
        </div>
      </SectionCard>

      <div className="max-w-2xl mt-8">
        <WorkflowTimeline recordType="court_case" recordId={courtCase.id} />
      </div>
    </div>
  );
}
