import { useParams, useLocation } from "wouter";
import { useGetCase, getGetCaseQueryKey, customFetch } from "@workspace/api-client-react";
import { Loader2, ArrowLeft, FileText, CheckCircle2, XCircle, Clock, Send, Edit2, Save, X, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { useAuth, hasRole, usePermission } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { WorkflowTimeline } from "@/components/WorkflowTimeline";
import { WorkflowActions } from "@/components/WorkflowActions";

/* ────── helpers ────── */
type TabId = "intake" | "risk" | "detail" | "plan" | "agreement" | "timeline";

function getTabs(isBn: boolean): { id: TabId; label: string; sub: string }[] {
  return [
    { id: "intake", label: isBn ? "ইনটেক ফরম" : "Intake Form", sub: "Form 1" },
    { id: "risk", label: isBn ? "ঝুঁকি যাচাই" : "Risk Assessment", sub: "Form 2" },
    { id: "detail", label: isBn ? "বিশদ যাচাই" : "Detailed Assessment", sub: "Form 3" },
    { id: "plan", label: isBn ? "হস্তক্ষেপ পরিকল্পনা" : "Intervention Plan", sub: "Form 4" },
    { id: "agreement", label: isBn ? "বাস্তবায়ন চুক্তি" : "Implementation Agreement", sub: "Form 5" },
    { id: "timeline", label: isBn ? "সময়রেখা" : "Timeline", sub: "Workflow" },
  ];
}

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

const STATUS_COLORS: Record<string, string> = {
  Open: "bg-blue-100 text-blue-700",
  Active: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-600",
  Transferred: "bg-amber-100 text-amber-700",
};

function FL({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}

function DV({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value || "—"}</p>
    </div>
  );
}

function SCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
      <h3 className="text-sm font-semibold text-primary uppercase tracking-wide border-b pb-2">{title}</h3>
      {children}
    </div>
  );
}

function parseSafe(v: string | null | undefined) {
  try { return v ? JSON.parse(v) : []; } catch { return []; }
}

function getLivingMap(isBn: boolean): Record<string, string> {
  if (isBn) return {
    both_parents: "মাতাপিতা উভয়ের সাথে", mother_only: "শুধু মাতার সাথে", father_only: "শুধু পিতার সাথে",
    elder_sibling: "বড় ভাই/বোনের সাথে", other_family: "অন্য আত্মীয়ের সাথে", non_family: "আত্মীয় নয় এমন ব্যক্তির সাথে",
    alone_street: "একাকী পথে", parents_street: "মাতাপিতার সাথে পথে", institution: "প্রতিষ্ঠানে",
  };
  return {
    both_parents: "With Both Parents", mother_only: "With Mother Only", father_only: "With Father Only",
    elder_sibling: "With Elder Sibling", other_family: "With Other Relatives", non_family: "With Non-Relatives",
    alone_street: "Alone on Streets", parents_street: "With Parents on Streets", institution: "In Institution",
  };
}

function getProblemsMap(isBn: boolean): Record<string, string> {
  if (isBn) return {
    orphan: "পিতামাতাহীন", no_guardian: "অভিভাবকহীন", homeless: "গৃহহীন কঠোর পরিশ্রমকারী",
    begging: "ভিক্ষাবৃত্তিতে", prison_dependent: "কারাভোগরত মাতাপিতা নির্ভরশীল", sexual_abuse: "যৌন নির্যাতনের শিকার",
    criminal_network: "অপরাধীর সাথে থাকা", anti_social_inst: "গণনাগমনকারী প্রতিষ্ঠান", substance_abuse: "মাদক/আচরণগত সমস্যা",
    crime_prone: "অপরাধে প্রবেশের ঝুঁকি", slum: "বস্তিবাসী", street_child: "পথশিশু",
    hijra: "হিজড়া", nomadic: "বেদে ও হরিজন", hiv_aids: "এইচআইভি/এইডস",
    law_contact: "আইনের সম্পর্শে", law_conflict: "আইনের সাথে সংঘাতে",
  };
  return {
    orphan: "Orphan", no_guardian: "No Guardian", homeless: "Homeless / Hard Labour",
    begging: "Engaged in Begging", prison_dependent: "Dependent on Imprisoned Parents", sexual_abuse: "Sexual Abuse Victim",
    criminal_network: "Living with Criminals", anti_social_inst: "Anti-social Institution", substance_abuse: "Substance / Behavioural Issue",
    crime_prone: "At Risk of Crime", slum: "Slum Dweller", street_child: "Street Child",
    hijra: "Transgender (Hijra)", nomadic: "Nomadic / Bede / Harijan", hiv_aids: "HIV / AIDS",
    law_contact: "In Contact with Law", law_conflict: "In Conflict with Law",
  };
}

const LIVING_WITH_OPTIONS = [
  { value: "both_parents", label: "মাতাপিতা উভয়ের সাথে থাকে" },
  { value: "mother_only", label: "শুধু মাতার সাথে থাকে" },
  { value: "father_only", label: "শুধু পিতার সাথে থাকে" },
  { value: "elder_sibling", label: "বড় ভাই/বোনের সাথে থাকে" },
  { value: "other_family", label: "অন্য আত্মীয় পরিবারের সাথে থাকে" },
  { value: "non_family", label: "আত্মীয় নয় এমন কোনো ব্যক্তির সাথে থাকে" },
  { value: "alone_street", label: "একাকী পথে থাকে" },
  { value: "parents_street", label: "মাতাপিতার সাথে পথে থাকে" },
  { value: "institution", label: "কোনো একটি প্রতিষ্ঠানে থাকে" },
];

const CHILD_PROBLEMS = [
  { value: "orphan", label: "১৪.১ মাতাপিতার যেকোনো একজন বা উভয়ে মৃত্যুবরণ করিয়াছে" },
  { value: "no_guardian", label: "১৪.২ আইনানুগ বা বৈধ অভিভাবকহীন শিশু" },
  { value: "homeless", label: "১৪.৩ নির্দিষ্ট কোনো গৃহ বা আবাসস্থলহীন এবং জীবনধারণের জন্য কঠোর পরিশ্রমকারী শিশু" },
  { value: "begging", label: "১৪.৪ ভিক্ষাবৃত্তি বা শিশুর মঙ্গলের পরিপন্থী কোনো কাজে লিপ্ত শিশু" },
  { value: "prison_dependent", label: "১৪.৫ কারাভোগরত মাতাপিতার উপর নির্ভরশীল বা মাতার সাথে কারাগারে অবস্থানরত শিশু" },
  { value: "sexual_abuse", label: "১৪.৬ যৌন নির্যাতন বা হয়রানির শিকার শিশু" },
  { value: "criminal_network", label: "১৪.৭ সমাজবিরোধী কার্যে নিয়োজিত ব্যক্তি বা অপরাধীর সাথে থাকা শিশু" },
  { value: "anti_social_inst", label: "১৪.৮ বাসস্থান বা কর্মস্থলে অবস্থানকারী বা গণনাগমনকারী প্রতিষ্ঠান শিশু" },
  { value: "substance_abuse", label: "১৪.৯ মাদক বা অন্য কোনো কারণে অস্বাভাবিক আচরণগত সমস্যাযুক্ত শিশু" },
  { value: "crime_prone", label: "১৪.১০ অসৎ সঙ্গে পতিত বা নৈতিক অধঃপতনের ঝুঁকিতে বা অপরাধ জগতে প্রবেশের ঝুঁকিসম্পন্ন শিশু" },
  { value: "slum", label: "১৪.১১ বস্তিতে বসবাসকারী শিশু" },
  { value: "street_child", label: "১৪.১২ রাস্তাঘাটে বসবাসকারী গৃহহীন শিশু" },
  { value: "hijra", label: "১৪.১৩ হিজড়া শিশু" },
  { value: "nomadic", label: "১৪.১৪ বেদে ও হরিজন শিশু" },
  { value: "hiv_aids", label: "১৪.১৫ এইচআইভি/এইডস-এ আক্রান্ত বা ক্ষতিগ্রস্ত শিশু" },
  { value: "law_contact", label: "১৪.১৬ আইনের সম্পর্শে আসা শিশু" },
  { value: "law_conflict", label: "১৪.১৭ আইনের সাথে সংঘাতে জড়িত শিশু" },
];

function CheckGroup({ options, values, onChange }: { options: { value: string; label: string }[]; values: string[]; onChange: (v: string[]) => void }) {
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  return (
    <div className="space-y-2">
      {options.map(opt => {
        const checked = values.includes(opt.value);
        return (
          <label key={opt.value} className="flex items-start gap-2.5 cursor-pointer group">
            <div className={`mt-0.5 h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center ${checked ? "bg-primary border-primary" : "border-border"}`}>
              {checked && <CheckCircle2 className="h-2.5 w-2.5 text-primary-foreground" />}
            </div>
            <span className="text-sm leading-snug">{opt.label}</span>
            <input type="checkbox" className="sr-only" checked={checked} onChange={() => {
              if (checked) onChange(values.filter(x => x !== opt.value));
              else onChange([...values, opt.value]);
            }} />
          </label>
        );
      })}
    </div>
  );
}


/* ────── risk assessment domains ────── */
function getRiskDomains(isBn: boolean): { key: string; label: string }[] {
  if (isBn) return [
    { key: "rights_identity", label: "১. অধিকার ও পরিচিতি" },
    { key: "family_environment", label: "২. পারিবারিক পরিবেশ" },
    { key: "safety", label: "৩. নিরাপত্তা" },
    { key: "healthcare_psychosocial", label: "৪. স্বাস্থ্যসেবা ও মনোসামাজিক" },
    { key: "emotional_warmth", label: "৫. আবেগীয় উষ্ণতা" },
    { key: "guidance_boundaries", label: "৬. নির্দেশনা, সীমা ও উৎসাহ" },
    { key: "education_development", label: "৭. শিক্ষা, কর্মসংস্থান ও শিশু বিকাশ" },
    { key: "abuse", label: "৮. অপব্যবহার" },
    { key: "protection", label: "৯. সুরক্ষা" },
    { key: "expression_social", label: "১০. মতপ্রকাশ ও সামাজিক সম্পর্ক" },
    { key: "law", label: "১১. আইন" },
    { key: "diverse_identity", label: "১২. বৈচিত্র্যময় পরিচয়" },
  ];
  return [
    { key: "rights_identity", label: "1. Rights & Identity" },
    { key: "family_environment", label: "2. Family Environment" },
    { key: "safety", label: "3. Safety" },
    { key: "healthcare_psychosocial", label: "4. Healthcare & Psychosocial" },
    { key: "emotional_warmth", label: "5. Emotional Warmth" },
    { key: "guidance_boundaries", label: "6. Guidance, Boundaries & Stimulation" },
    { key: "education_development", label: "7. Education, Employment & Child Development" },
    { key: "abuse", label: "8. Abuse" },
    { key: "protection", label: "9. Protection" },
    { key: "expression_social", label: "10. Expression & Social Relations" },
    { key: "law", label: "11. Law" },
    { key: "diverse_identity", label: "12. Diverse Identity" },
  ];
}

function getRiskScoreLabels(isBn: boolean): Record<number, string> {
  if (isBn) return {
    0: "০ — কোনো উদ্বেগ নেই",
    1: "১ — সামান্য উদ্বেগ",
    2: "২ — কিছুটা উদ্বেগ",
    3: "৩ — মাঝারি উদ্বেগ",
    4: "৪ — উল্লেখযোগ্য উদ্বেগ",
    5: "৫ — গুরুতর উদ্বেগ",
  };
  return {
    0: "0 — No Concern",
    1: "1 — Slight Concern",
    2: "2 — Some Concern",
    3: "3 — Moderate Concern",
    4: "4 — Significant Concern",
    5: "5 — Severe Concern",
  };
}

/* ────── Workflow replaced by components ────── */

/* ────── Form 1 (Intake) view/edit ────── */
function IntakeTab({ caseFile, onRefresh }: { caseFile: any; onRefresh: () => void }) {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  
  const { data: caseTypesData, isLoading: caseTypesLoading } = useQuery({
    queryKey: ["case-types"],
    queryFn: () => fetch("/api/case-types").then(r => r.json()),
  });
  const caseTypes = caseTypesData?.caseTypes?.filter((ct: any) => ct.isActive) ?? [];

  useEffect(() => {
    if (editing) setForm({
      registrationNumber: caseFile.registrationNumber ?? "",
      caseType: caseFile.caseType ?? "",
      nameEnglish: caseFile.nameEnglish ?? "",
      motherName: caseFile.motherName ?? "",
      fatherName: caseFile.fatherName ?? "",
      guardianName: caseFile.guardianName ?? "",
      guardianRelationship: caseFile.guardianRelationship ?? "",
      birthRegNo: caseFile.birthRegNo ?? "",
      disabilityId: caseFile.disabilityId ?? "",
      nationality: caseFile.nationality ?? "",
      ethnicity: caseFile.ethnicity ?? "",
      birthplace: caseFile.birthplace ?? "",
      religion: caseFile.religion ?? "",
      occupation: caseFile.occupation ?? "",
      income: caseFile.income ?? "",
      currentAddressDivision: caseFile.currentAddressDivision ?? "",
      currentAddressDistrict: caseFile.currentAddressDistrict ?? "",
      currentAddressUpazila: caseFile.currentAddressUpazila ?? "",
      currentAddressUnion: caseFile.currentAddressUnion ?? "",
      currentAddressVillage: caseFile.currentAddressVillage ?? "",
      permanentAddressDivision: caseFile.permanentAddressDivision ?? "",
      permanentAddressDistrict: caseFile.permanentAddressDistrict ?? "",
      permanentAddressUpazila: caseFile.permanentAddressUpazila ?? "",
      permanentAddressUnion: caseFile.permanentAddressUnion ?? "",
      permanentAddressVillage: caseFile.permanentAddressVillage ?? "",
      guardianPhone: caseFile.guardianPhone ?? "",
      email: caseFile.email ?? "",
      livingWith: parseSafe(caseFile.livingWith),
      childProblems: parseSafe(caseFile.childProblems),
      otherProblems: caseFile.otherProblems ?? "",
      referralReason: caseFile.referralReason ?? "",
      referralContactName: caseFile.referralContactName ?? "",
      referralRelationship: caseFile.referralRelationship ?? "",
      urgentServiceTypes: caseFile.urgentServiceTypes ?? "",
      referralDestination: caseFile.referralDestination ?? "",
      receiverName: caseFile.receiverName ?? "",
      receiverIdNo: caseFile.receiverIdNo ?? "",
      intakeOfficerName: caseFile.intakeOfficerName ?? "",
      intakeOfficerDesignation: caseFile.intakeOfficerDesignation ?? "",
      assessorName: caseFile.assessorName ?? "",
      supervisorName: caseFile.supervisorName ?? "",
      assignedCaseWorker: caseFile.assignedCaseWorker ?? "",
      caseSummary: caseFile.caseSummary ?? "",
      caseStatus: caseFile.caseStatus ?? "Active",
    });
  }, [editing]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const inp = (k: string) => ({ value: form[k] ?? "", onChange: (e: any) => set(k, e.target.value) });

  const updateCaseMutation = useMutation({
    mutationFn: async (data: any) => {
      return customFetch(`/api/cases/${caseFile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: isBn ? "সফল" : "Success", description: isBn ? "তথ্য সংরক্ষিত হয়েছে।" : "Data saved successfully." });
      setEditing(false);
      onRefresh();
    },
    onError: (err: any) => {
      toast({ title: isBn ? "ত্রুটি" : "Error", description: err.message || (isBn ? "সংরক্ষণ ব্যর্থ হয়েছে।" : "Failed to save."), variant: "destructive" });
    }
  });

  function save() {
    const payload = {
      ...form,
      livingWith: JSON.stringify(form.livingWith),
      childProblems: JSON.stringify(form.childProblems),
    };
    updateCaseMutation.mutate(payload);
  }

  const living = parseSafe(caseFile.livingWith);
  const problems = parseSafe(caseFile.childProblems);
  const LIVING_MAP = getLivingMap(isBn);
  const PROBLEMS_MAP = getProblemsMap(isBn);

  if (!editing) return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1.5"><Edit2 className="h-3.5 w-3.5" />{isBn ? "সম্পাদনা করুন" : "Edit"}</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SCard title={isBn ? "শিশুর পরিচয়" : "Child Identity"}>
          <div className="grid grid-cols-2 gap-3">
            <DV label={isBn ? "নিবন্ধন নম্বর" : "Reg. No."} value={caseFile.registrationNumber} />
            <DV label={isBn ? "মামলার ধরন" : "Case Type"} value={
              caseFile.caseType 
                ? (isBn ? caseTypes.find((ct:any) => ct.nameEn === caseFile.caseType || ct.nameBn === caseFile.caseType)?.nameBn || caseFile.caseType : caseFile.caseType)
                : "—"
            } />
            <DV label={isBn ? "কেস শুরুর তারিখ" : "Case Opening Date"} value={caseFile.caseOpeningDate} />
            <DV label={isBn ? "ইংরেজি নাম" : "Name (English)"} value={caseFile.nameEnglish} />
            <DV label={isBn ? "জাতীয়তা" : "Nationality"} value={caseFile.nationality} />
            <DV label={isBn ? "মাতার নাম" : "Mother's Name"} value={caseFile.motherName} />
            <DV label={isBn ? "পিতার নাম" : "Father's Name"} value={caseFile.fatherName} />
            <DV label={isBn ? "অভিভাবকের নাম" : "Guardian's Name"} value={caseFile.guardianName} />
            <DV label={isBn ? "অভিভাবকের সম্পর্ক" : "Guardian Relationship"} value={caseFile.guardianRelationship} />
            <DV label={isBn ? "জন্ম নিবন্ধন নম্বর" : "Birth Reg. No."} value={caseFile.birthRegNo} />
            <DV label={isBn ? "প্রতিবন্ধিতা নম্বর" : "Disability ID"} value={caseFile.disabilityId} />
            <DV label={isBn ? "জাতিসত্তা" : "Ethnicity"} value={caseFile.ethnicity} />
            <DV label={isBn ? "জন্মস্থান" : "Birthplace"} value={caseFile.birthplace} />
            <DV label={isBn ? "ধর্ম" : "Religion"} value={caseFile.religion} />
            <DV label={isBn ? "পেশা" : "Occupation"} value={caseFile.occupation} />
            <DV label={isBn ? "আয়/সম্পদ" : "Income/Assets"} value={caseFile.income} />
          </div>
        </SCard>
        <SCard title={isBn ? "ঠিকানা ও যোগাযোগ" : "Address & Contact"}>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">{isBn ? "বর্তমান ঠিকানা" : "Present Address"}</p>
            <p className="text-sm">{[caseFile.currentAddressVillage, caseFile.currentAddressUnion, caseFile.currentAddressUpazila, caseFile.currentAddressDistrict, caseFile.currentAddressDivision].filter(Boolean).join(", ") || "—"}</p>
            <p className="text-xs font-semibold text-muted-foreground">{isBn ? "স্থায়ী ঠিকানা" : "Permanent Address"}</p>
            <p className="text-sm">{[caseFile.permanentAddressVillage, caseFile.permanentAddressUnion, caseFile.permanentAddressUpazila, caseFile.permanentAddressDistrict, caseFile.permanentAddressDivision].filter(Boolean).join(", ") || "—"}</p>
            <DV label={isBn ? "মোবাইল নম্বর" : "Mobile No."} value={caseFile.guardianPhone} />
            <DV label={isBn ? "ই-মেইল" : "Email"} value={caseFile.email} />
          </div>
        </SCard>
      </div>
      <SCard title={isBn ? "বর্তমান অবস্থা ও সমস্যা" : "Current Situation & Problems"}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">{isBn ? "বাসস্থান অবস্থা" : "Living Situation"}</p>
            {living.length > 0 ? <div className="flex flex-wrap gap-1.5">{living.map((v: string) => <span key={v} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{LIVING_MAP[v] || v}</span>)}</div> : <p className="text-sm text-muted-foreground">—</p>}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">{isBn ? "শিশুর সমস্যা" : "Child's Problems"}</p>
            {problems.length > 0 ? <div className="flex flex-wrap gap-1.5">{problems.map((v: string) => <span key={v} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full">{PROBLEMS_MAP[v] || v}</span>)}</div> : <p className="text-sm text-muted-foreground">—</p>}
          </div>
        </div>
        {caseFile.otherProblems && <DV label={isBn ? "অন্যান্য সমস্যা" : "Other Problems"} value={caseFile.otherProblems} />}
      </SCard>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SCard title={isBn ? "রেফার ও জরুরি সেবা" : "Referral & Urgent Services"}>
          <DV label={isBn ? "রেফার/প্রেরণের কারণ" : "Referral Reason"} value={caseFile.referralReason} />
          <DV label={isBn ? "রেফারকারীর তথ্য" : "Referral Contact"} value={caseFile.referralContactName} />
          <DV label={isBn ? "রেফারকারীর সম্পর্ক" : "Referral Relationship"} value={caseFile.referralRelationship} />
          <DV label={isBn ? "গন্তব্য" : "Destination"} value={caseFile.referralDestination} />
          <DV label={isBn ? "গ্রহণকারীর নাম" : "Receiver's Name"} value={caseFile.receiverName} />
          {caseFile.urgentServiceTypes && <DV label={isBn ? "জরুরি সেবা" : "Urgent Services"} value={caseFile.urgentServiceTypes} />}
        </SCard>
        <SCard title={isBn ? "দায়িত্বপ্রাপ্ত কর্মকর্তা" : "Assigned Officers"}>
          <DV label={isBn ? "ফরম পূরণকারী" : "Intake Officer"} value={caseFile.intakeOfficerName} />
          <DV label={isBn ? "পদবি" : "Designation"} value={caseFile.intakeOfficerDesignation} />
          <DV label={isBn ? "মূল্যায়নকারী সমাজকর্মী" : "Assessor Social Worker"} value={caseFile.assessorName} />
          <DV label={isBn ? "তত্ত্বাবধানকারী" : "Supervisor"} value={caseFile.supervisorName} />
          <DV label={isBn ? "নিয়োজিত কেস ওয়ার্কার" : "Assigned Case Worker"} value={caseFile.assignedCaseWorker} />
        </SCard>
      </div>
      {caseFile.caseSummary && <SCard title={isBn ? "কেস সারসংক্ষেপ" : "Case Summary"}><p className="text-sm whitespace-pre-line">{caseFile.caseSummary}</p></SCard>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="gap-1.5"><X className="h-3.5 w-3.5" />{isBn ? "বাতিল" : "Cancel"}</Button>
        <Button size="sm" onClick={save} disabled={updateCaseMutation.isPending} className="gap-1.5">
          {updateCaseMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}{isBn ? "সংরক্ষণ" : "Save"}
        </Button>
      </div>
      <SCard title={isBn ? "শিশুর পরিচয়" : "Child Identity"}>
        <div className="grid grid-cols-2 gap-3">
          <FL label={isBn ? "নিবন্ধন নম্বর" : "Reg. No."}><Input {...inp("registrationNumber")} /></FL>
          <FL label={isBn ? "মামলার ধরন" : "Case Type"}>
            {caseTypesLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2 px-3 border rounded-md bg-muted/20">
                <Loader2 className="h-4 w-4 animate-spin" /> {isBn ? "লোড হচ্ছে..." : "Loading..."}
              </div>
            ) : (
              <Select value={form.caseType || ""} onValueChange={v => set("caseType", v)}>
                <SelectTrigger><SelectValue placeholder={isBn ? "বেছে নিন" : "Select"} /></SelectTrigger>
                <SelectContent>
                  {caseTypes.map((ct: any) => (
                    <SelectItem key={ct.id} value={ct.nameEn}>
                      {isBn ? ct.nameBn : ct.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FL>
          <FL label={isBn ? "ইংরেজি নাম" : "Name (English)"}><Input {...inp("nameEnglish")} /></FL>
          <FL label={isBn ? "মাতার নাম" : "Mother's Name"}><Input {...inp("motherName")} /></FL>
          <FL label={isBn ? "পিতার নাম" : "Father's Name"}><Input {...inp("fatherName")} /></FL>
          <FL label={isBn ? "অভিভাবকের নাম" : "Guardian's Name"}><Input {...inp("guardianName")} /></FL>
          <FL label={isBn ? "অভিভাবকের সম্পর্ক" : "Guardian Relationship"}><Input {...inp("guardianRelationship")} /></FL>
          <FL label={isBn ? "জন্ম নিবন্ধন নম্বর" : "Birth Reg. No."}><Input {...inp("birthRegNo")} /></FL>
          <FL label={isBn ? "প্রতিবন্ধিতা নম্বর" : "Disability ID"}><Input {...inp("disabilityId")} /></FL>
          <FL label={isBn ? "জাতীয়তা" : "Nationality"}><Input {...inp("nationality")} /></FL>
          <FL label={isBn ? "জাতিসত্তা" : "Ethnicity"}><Input {...inp("ethnicity")} /></FL>
          <FL label={isBn ? "জন্মস্থান" : "Birthplace"}><Input {...inp("birthplace")} /></FL>
          <FL label={isBn ? "ধর্ম" : "Religion"}><Input {...inp("religion")} /></FL>
          <FL label={isBn ? "পেশা" : "Occupation"}><Input {...inp("occupation")} /></FL>
          <FL label={isBn ? "আয়/সম্পদ" : "Income/Assets"}><Input {...inp("income")} /></FL>
        </div>
      </SCard>
      <SCard title={isBn ? "ঠিকানা — বর্তমান" : "Present Address"}>
        <div className="grid grid-cols-2 gap-3">
          <FL label={isBn ? "বিভাগ" : "Division"}><Input {...inp("currentAddressDivision")} /></FL>
          <FL label={isBn ? "জেলা" : "District"}><Input {...inp("currentAddressDistrict")} /></FL>
          <FL label={isBn ? "উপজেলা/থানা" : "Upazila/Thana"}><Input {...inp("currentAddressUpazila")} /></FL>
          <FL label={isBn ? "ইউনিয়ন/ওয়ার্ড" : "Union/Ward"}><Input {...inp("currentAddressUnion")} /></FL>
          <FL label={isBn ? "বাড়ি/সড়ক/গ্রাম" : "House/Road/Village"}><Input {...inp("currentAddressVillage")} /></FL>
          <FL label={isBn ? "মোবাইল নম্বর" : "Mobile No."}><Input {...inp("guardianPhone")} /></FL>
          <FL label={isBn ? "ই-মেইল" : "Email"}><Input {...inp("email")} /></FL>
        </div>
      </SCard>
      <SCard title={isBn ? "ঠিকানা — স্থায়ী" : "Permanent Address"}>
        <div className="grid grid-cols-2 gap-3">
          <FL label={isBn ? "বিভাগ" : "Division"}><Input {...inp("permanentAddressDivision")} /></FL>
          <FL label={isBn ? "জেলা" : "District"}><Input {...inp("permanentAddressDistrict")} /></FL>
          <FL label={isBn ? "উপজেলা/থানা" : "Upazila/Thana"}><Input {...inp("permanentAddressUpazila")} /></FL>
          <FL label={isBn ? "ইউনিয়ন/ওয়ার্ড" : "Union/Ward"}><Input {...inp("permanentAddressUnion")} /></FL>
          <FL label={isBn ? "বাড়ি/সড়ক/গ্রাম" : "House/Road/Village"}><Input {...inp("permanentAddressVillage")} /></FL>
        </div>
      </SCard>
      <SCard title={isBn ? "১৩. বাসস্থান অবস্থা" : "13. Living Situation"}>
        <CheckGroup options={LIVING_WITH_OPTIONS} values={form.livingWith ?? []} onChange={v => set("livingWith", v)} />
      </SCard>
      <SCard title={isBn ? "১৪. শিশুর সমস্যা" : "14. Child's Problems"}>
        <CheckGroup options={CHILD_PROBLEMS} values={form.childProblems ?? []} onChange={v => set("childProblems", v)} />
      </SCard>
      <SCard title={isBn ? "রেফার ও জরুরি সেবা" : "Referral & Urgent Services"}>
        <FL label={isBn ? "রেফার/প্রেরণের কারণ" : "Referral Reason"}><Textarea className="min-h-[60px]" {...inp("referralReason")} /></FL>
        <FL label={isBn ? "রেফারকারীর তথ্য" : "Referral Contact"}><Textarea className="min-h-[50px]" {...inp("referralContactName")} /></FL>
        <FL label={isBn ? "রেফারকারীর সম্পর্ক" : "Referral Relationship"}><Input {...inp("referralRelationship")} /></FL>
        <FL label={isBn ? "গন্তব্য" : "Destination"}><Input {...inp("referralDestination")} /></FL>
        <div className="grid grid-cols-2 gap-3">
          <FL label={isBn ? "গ্রহণকারীর নাম" : "Receiver's Name"}><Input {...inp("receiverName")} /></FL>
          <FL label={isBn ? "গ্রহণকারীর এনআইডি" : "Receiver's NID"}><Input {...inp("receiverIdNo")} /></FL>
        </div>
        <FL label={isBn ? "জরুরি সেবার ধরন" : "Urgent Service Types"}><Input {...inp("urgentServiceTypes")} /></FL>
      </SCard>
      <SCard title={isBn ? "দায়িত্বপ্রাপ্ত কর্মকর্তা" : "Assigned Officers"}>
        <div className="grid grid-cols-2 gap-3">
          <FL label={isBn ? "ফরম পূরণকারী" : "Intake Officer"}><Input {...inp("intakeOfficerName")} /></FL>
          <FL label={isBn ? "পদবি" : "Designation"}><Input {...inp("intakeOfficerDesignation")} /></FL>
          <FL label={isBn ? "মূল্যায়নকারী সমাজকর্মী" : "Assessor Social Worker"}><Input {...inp("assessorName")} /></FL>
          <FL label={isBn ? "তত্ত্বাবধানকারী" : "Supervisor"}><Input {...inp("supervisorName")} /></FL>
          <FL label={isBn ? "নিয়োজিত কেস ওয়ার্কার" : "Assigned Case Worker"}><Input {...inp("assignedCaseWorker")} /></FL>
          <FL label={isBn ? "কেস অবস্থা" : "Case Status"}>
            <Select value={form.caseStatus || ""} onValueChange={v => set("caseStatus", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Open","Active","Closed","Transferred"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </FL>
        </div>
      </SCard>
      <SCard title={isBn ? "অন্যান্য সমস্যা ও কেস সারসংক্ষেপ" : "Other Problems & Case Summary"}>
        <FL label={isBn ? "অন্যান্য সমস্যা" : "Other Problems"}><Textarea className="min-h-[60px]" {...inp("otherProblems")} /></FL>
        <FL label={isBn ? "কেস সারসংক্ষেপ" : "Case Summary"}><Textarea className="min-h-[80px]" {...inp("caseSummary")} /></FL>
      </SCard>
    </div>
  );
}

/* ────── Form 2: Risk Assessment ────── */
function ScorePicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {[0,1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`w-8 h-8 rounded-lg text-sm font-bold border transition-colors ${value === n ? (n <= 1 ? "bg-green-600 text-white border-green-600" : n <= 3 ? "bg-amber-500 text-white border-amber-500" : "bg-red-600 text-white border-red-600") : "border-border hover:bg-muted"}`}>
          {n}
        </button>
      ))}
    </div>
  );
}

function RiskTab({ caseId }: { caseId: number }) {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const [editing, setEditing] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [extras, setExtras] = useState<Record<string, any>>({ assessmentDate: new Date().toISOString().split("T")[0], assessorName: "", overallRiskLevel: "", recommendations: "", nextReviewDate: "" });

  const { data: existing, refetch } = useQuery({
    queryKey: ["case-risk-assessments", caseId],
    queryFn: async () => { const r = await fetch(`/api/case-risk-assessments?caseId=${caseId}`); return r.json(); },
  });
  const rec = existing?.[0];

  useEffect(() => {
    if (rec && editing) {
      setScores(parseSafe(rec.domainScores) instanceof Array ? {} : (parseSafe(rec.domainScores) || {}));
      setExtras({ assessmentDate: rec.assessmentDate ?? "", assessorName: rec.assessorName ?? "", overallRiskLevel: rec.overallRiskLevel ?? "", recommendations: rec.recommendations ?? "", nextReviewDate: rec.nextReviewDate ?? "" });
    }
  }, [rec, editing]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = { caseId, domainScores: JSON.stringify(scores), ...extras };
      if (rec) return fetch(`/api/case-risk-assessments/${rec.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return fetch("/api/case-risk-assessments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    },
    onSuccess: () => { toast({ title: isBn ? "সফল" : "Success", description: isBn ? "ঝুঁকি যাচাই সংরক্ষিত হয়েছে।" : "Risk assessment saved." }); setEditing(false); refetch(); },
    onError: () => toast({ title: isBn ? "ত্রুটি" : "Error", description: isBn ? "সংরক্ষণ ব্যর্থ হয়েছে।" : "Failed to save.", variant: "destructive" }),
  });

  function startEdit() {
    if (!rec) {
      setScores({}); 
      setExtras({ assessmentDate: new Date().toISOString().split("T")[0], assessorName: "", overallRiskLevel: "", recommendations: "", nextReviewDate: "" });
    }
    setEditing(true);
  }

  const domainScores = rec ? (parseSafe(rec.domainScores) as Record<string, number>) : {};

  if (!editing) return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={startEdit} className="gap-1.5">
          {rec ? <><Edit2 className="h-3.5 w-3.5" />{isBn ? "সম্পাদনা" : "Edit"}</> : <><Plus className="h-3.5 w-3.5" />{isBn ? "ঝুঁকি যাচাই শুরু করুন" : "Start Risk Assessment"}</>}
        </Button>
      </div>
      {!rec && <div className="text-center py-12 text-muted-foreground">{isBn ? "এখনো ঝুঁকি যাচাই ফরম (Form 2) পূরণ করা হয়নি।" : "Risk Assessment Form (Form 2) has not been filled yet."}</div>}
      {rec && <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <DV label={isBn ? "মূল্যায়নের তারিখ" : "Assessment Date"} value={rec.assessmentDate} />
          <DV label={isBn ? "মূল্যায়নকারী" : "Assessor"} value={rec.assessorName} />
          <DV label={isBn ? "সামগ্রিক ঝুঁকির স্তর" : "Overall Risk Level"} value={rec.overallRiskLevel} />
        </div>
        <SCard title={isBn ? "ডোমেইন স্কোর" : "Domain Scores"}>
          <div className="space-y-3">
            {getRiskDomains(isBn).map(d => {
              const score = domainScores[d.key] ?? null;
              const RISK_SCORE_LABELS = getRiskScoreLabels(isBn);
              return (
                <div key={d.key} className="flex items-center justify-between">
                  <span className="text-sm">{d.label}</span>
                  {score !== null ? (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${score <= 1 ? "bg-green-100 text-green-700" : score <= 3 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{score} — {RISK_SCORE_LABELS[score]?.split("—")[1]?.trim()}</span>
                  ) : <span className="text-xs text-muted-foreground">{isBn ? "মূল্যায়িত হয়নি" : "Not assessed"}</span>}
                </div>
              );
            })}
          </div>
        </SCard>
        {rec.recommendations && <SCard title={isBn ? "সুপারিশ" : "Recommendations"}><p className="text-sm whitespace-pre-line">{rec.recommendations}</p></SCard>}
      </div>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="gap-1.5"><X className="h-3.5 w-3.5" />{isBn ? "বাতিল" : "Cancel"}</Button>
        <Button size="sm" onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="gap-1.5">
          {saveMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}{isBn ? "সংরক্ষণ" : "Save"}
        </Button>
      </div>
      <SCard title={isBn ? "মূল্যায়নের তথ্য" : "Assessment Details"}>
        <div className="grid grid-cols-3 gap-3">
          <FL label={isBn ? "মূল্যায়নের তারিখ" : "Assessment Date"}><Input type="date" value={extras.assessmentDate} onChange={e => setExtras(x => ({...x, assessmentDate: e.target.value}))} /></FL>
          <FL label={isBn ? "মূল্যায়নকারী" : "Assessor"}><Input value={extras.assessorName} onChange={e => setExtras(x => ({...x, assessorName: e.target.value}))} /></FL>
          <FL label={isBn ? "সামগ্রিক ঝুঁকির স্তর" : "Overall Risk Level"}>
            <Select value={extras.overallRiskLevel} onValueChange={v => setExtras(x => ({...x, overallRiskLevel: v}))}>
              <SelectTrigger><SelectValue placeholder={isBn ? "স্তর নির্বাচন করুন" : "Select Level"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">{isBn ? "কম (Low)" : "Low"}</SelectItem>
                <SelectItem value="Medium">{isBn ? "মাঝারি (Medium)" : "Medium"}</SelectItem>
                <SelectItem value="High">{isBn ? "বেশি (High)" : "High"}</SelectItem>
                <SelectItem value="Critical">{isBn ? "জরুরি (Critical)" : "Critical"}</SelectItem>
              </SelectContent>
            </Select>
          </FL>
        </div>
      </SCard>
      <SCard title={isBn ? "১২টি ডোমেইনের ঝুঁকি স্কোর (০=কোনো উদ্বেগ নেই, ৫=গুরুতর উদ্বেগ)" : "12-Domain Risk Scores (0=No Concern, 5=Severe Concern)"}>
        <div className="space-y-4">
          {getRiskDomains(isBn).map(d => {
            const RISK_SCORE_LABELS = getRiskScoreLabels(isBn);
            return (
            <div key={d.key}>
              <p className="text-sm font-medium mb-2">{d.label}</p>
              <ScorePicker value={scores[d.key] ?? 0} onChange={v => setScores(s => ({...s, [d.key]: v}))} />
              <p className="text-xs text-muted-foreground mt-1">{RISK_SCORE_LABELS[scores[d.key] ?? 0]}</p>
            </div>
            );
          })}
        </div>
      </SCard>
      <SCard title={isBn ? "সুপারিশ ও পর্যালোচনা" : "Recommendations & Review"}>
        <FL label={isBn ? "সুপারিশ" : "Recommendations"}><Textarea className="min-h-[80px]" value={extras.recommendations} onChange={e => setExtras(x => ({...x, recommendations: e.target.value}))} /></FL>
        <FL label={isBn ? "পরবর্তী পর্যালোচনার তারিখ" : "Next Review Date"}><Input type="date" value={extras.nextReviewDate} onChange={e => setExtras(x => ({...x, nextReviewDate: e.target.value}))} /></FL>
      </SCard>
    </div>
  );
}

/* ────── Form 3: Detail Assessment ────── */
function getChildDetailDomains(isBn: boolean): { key: string; label: string }[] {
  if (isBn) return [
    { key: "general_health", label: "১. সামগ্রিক স্বাস্থ্য" },
    { key: "physical_development", label: "২. শারীরিক বিকাশ" },
    { key: "communication", label: "৩. কথা বলা, ভাষাগত দক্ষতা ও যোগাযোগ" },
    { key: "emotional_social", label: "৪. আবেগীয় ও সামাজিক বিকাশ" },
    { key: "behavioral", label: "৫. আচরণগত বিকাশ" },
    { key: "identity", label: "৬. আত্মপরিচয়" },
    { key: "family_social_relations", label: "৭. পারিবারিক ও সামাজিক সম্পর্ক" },
    { key: "self_care", label: "৮. নিজের যত্ন নেওয়ার দক্ষতা ও আত্মনির্ভরশীলতা" },
    { key: "learning", label: "৯. শিখন" },
    { key: "education_participation", label: "১০. শিক্ষায় অংশগ্রহণ" },
    { key: "learning_achievement", label: "১১. শিখনের অর্জন ও অগ্রগতি" },
  ];
  return [
    { key: "general_health", label: "1. General Health" },
    { key: "physical_development", label: "2. Physical Development" },
    { key: "communication", label: "3. Speech, Language & Communication" },
    { key: "emotional_social", label: "4. Emotional & Social Development" },
    { key: "behavioral", label: "5. Behavioural Development" },
    { key: "identity", label: "6. Identity" },
    { key: "family_social_relations", label: "7. Family & Social Relations" },
    { key: "self_care", label: "8. Self-care & Independence" },
    { key: "learning", label: "9. Learning" },
    { key: "education_participation", label: "10. Educational Participation" },
    { key: "learning_achievement", label: "11. Learning Achievement & Progress" },
  ];
}

function RatingPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const LABELS = ["১ — পর্যাপ্ত সহায়তা প্রয়োজন", "২ — কিছু সহায়তা প্রয়োজন", "৩ — ঠিকঠাক আছে", "৪ — ভালো", "৫ — অত্যন্ত ভালো"];
  return (
    <div className="flex gap-1.5">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`w-8 h-8 rounded-lg text-sm font-bold border transition-colors ${value === n ? (n <= 2 ? "bg-red-500 text-white border-red-500" : n === 3 ? "bg-amber-500 text-white border-amber-500" : "bg-green-600 text-white border-green-600") : "border-border hover:bg-muted"}`}>
          {n}
        </button>
      ))}
    </div>
  );
}

function DetailTab({ caseId }: { caseId: number }) {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const [editing, setEditing] = useState(false);
  const [childDomains, setChildDomains] = useState<Record<string, { rating: number; notes: string }>>({});
  const [extras, setExtras] = useState({ assessmentDate: new Date().toISOString().split("T")[0], assessorName: "", basicCareRating: 3, basicCareNotes: "", emotionalWarmthRating: 3, emotionalWarmthNotes: "", guidanceRating: 3, guidanceNotes: "", familyHistoryNotes: "", extendedFamilyNotes: "", housingNotes: "", communityNotes: "", overallSummary: "" });

  const { data: existing, refetch } = useQuery({
    queryKey: ["case-detail-assessments", caseId],
    queryFn: async () => { const r = await fetch(`/api/case-detail-assessments?caseId=${caseId}`); return r.json(); },
  });
  const rec = existing?.[0];

  useEffect(() => {
    if (rec && editing) {
      const cd = parseSafe(rec.childDomains);
      setChildDomains(typeof cd === "object" && !Array.isArray(cd) ? cd : {});
      setExtras({
        assessmentDate: rec.assessmentDate ?? "", assessorName: rec.assessorName ?? "",
        basicCareRating: rec.basicCareRating ?? 3, basicCareNotes: rec.basicCareNotes ?? "",
        emotionalWarmthRating: rec.emotionalWarmthRating ?? 3, emotionalWarmthNotes: rec.emotionalWarmthNotes ?? "",
        guidanceRating: rec.guidanceRating ?? 3, guidanceNotes: rec.guidanceNotes ?? "",
        familyHistoryNotes: rec.familyHistoryNotes ?? "", extendedFamilyNotes: rec.extendedFamilyNotes ?? "",
        housingNotes: rec.housingNotes ?? "", communityNotes: rec.communityNotes ?? "",
        overallSummary: rec.overallSummary ?? "",
      });
    }
  }, [rec, editing]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = { caseId, childDomains: JSON.stringify(childDomains), ...extras };
      if (rec) return fetch(`/api/case-detail-assessments/${rec.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return fetch("/api/case-detail-assessments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    },
    onSuccess: () => { toast({ title: isBn ? "সফল" : "Success", description: isBn ? "বিশদ যাচাই সংরক্ষিত হয়েছে।" : "Detailed assessment saved." }); setEditing(false); refetch(); },
    onError: () => toast({ title: isBn ? "ত্রুটি" : "Error", description: isBn ? "সংরক্ষণ ব্যর্থ হয়েছে।" : "Failed to save.", variant: "destructive" }),
  });

  function startEdit() {
    if (!rec) { setChildDomains({}); }
    setEditing(true);
  }

  const RATING_LABELS = isBn
    ? ["", "পর্যাপ্ত সহায়তা প্রয়োজন", "কিছু সহায়তা প্রয়োজন", "ঠিকঠাক আছে", "ভালো", "অত্যন্ত ভালো"]
    : ["", "Needs Significant Support", "Needs Some Support", "Adequate", "Good", "Excellent"];

  if (!editing) return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={startEdit} className="gap-1.5">
          {rec ? <><Edit2 className="h-3.5 w-3.5" />{isBn ? "সম্পাদনা" : "Edit"}</> : <><Plus className="h-3.5 w-3.5" />{isBn ? "বিশদ যাচাই শুরু করুন" : "Start Detailed Assessment"}</>}
        </Button>
      </div>
      {!rec && <div className="text-center py-12 text-muted-foreground">{isBn ? "এখনো বিশদ যাচাই ফরম (Form 3) পূরণ করা হয়নি।" : "Detailed Assessment Form (Form 3) has not been filled yet."}</div>}
      {rec && <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <DV label={isBn ? "মূল্যায়নের তারিখ" : "Assessment Date"} value={rec.assessmentDate} />
          <DV label={isBn ? "মূল্যায়নকারী" : "Assessor"} value={rec.assessorName} />
        </div>
        <SCard title={isBn ? "খণ্ড-ক: শিশুর চাহিদা ও শক্তি (১১টি ডোমেইন)" : "Section A: Child's Needs & Strengths (11 Domains)"}>
          {getChildDetailDomains(isBn).map(d => {
            const cd = parseSafe(rec.childDomains);
            const rating = cd[d.key]?.rating;
            return (
              <div key={d.key} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm">{d.label}</span>
                {rating ? <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rating <= 2 ? "bg-red-100 text-red-700" : rating === 3 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{rating} — {RATING_LABELS[rating]}</span> : <span className="text-xs text-muted-foreground">—</span>}
              </div>
            );
          })}
        </SCard>
        {rec.overallSummary && <SCard title={isBn ? "সামগ্রিক সারসংক্ষেপ" : "Overall Summary"}><p className="text-sm whitespace-pre-line">{rec.overallSummary}</p></SCard>}
      </div>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="gap-1.5"><X className="h-3.5 w-3.5" />{isBn ? "বাতিল" : "Cancel"}</Button>
        <Button size="sm" onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="gap-1.5">
          {saveMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}{isBn ? "সংরক্ষণ" : "Save"}
        </Button>
      </div>
      <SCard title={isBn ? "মূল্যায়নের তথ্য" : "Assessment Details"}>
        <div className="grid grid-cols-2 gap-3">
          <FL label={isBn ? "মূল্যায়নের তারিখ" : "Assessment Date"}><Input type="date" value={extras.assessmentDate} onChange={e => setExtras(x => ({...x, assessmentDate: e.target.value}))} /></FL>
          <FL label={isBn ? "মূল্যায়নকারী" : "Assessor"}><Input value={extras.assessorName} onChange={e => setExtras(x => ({...x, assessorName: e.target.value}))} /></FL>
        </div>
      </SCard>
      <SCard title={isBn ? "খণ্ড-ক: শিশুর চাহিদা ও শক্তি (১=সহায়তা প্রয়োজন, ৫=অত্যন্ত ভালো)" : "Section A: Child's Needs & Strengths (1=Needs Support, 5=Excellent)"}>
        <div className="space-y-5">
          {getChildDetailDomains(isBn).map(d => (
            <div key={d.key}>
              <p className="text-sm font-medium mb-2">{d.label}</p>
              <RatingPicker value={childDomains[d.key]?.rating ?? 3} onChange={v => setChildDomains(s => ({...s, [d.key]: {...s[d.key], rating: v}}))} />
              <Textarea className="mt-2 min-h-[50px] text-xs" placeholder={isBn ? "মন্তব্য (ঐচ্ছিক)" : "Notes (optional)"} value={childDomains[d.key]?.notes ?? ""} onChange={e => setChildDomains(s => ({...s, [d.key]: {...s[d.key], notes: e.target.value}}))} />
            </div>
          ))}
        </div>
      </SCard>
      <SCard title={isBn ? "খণ্ড-খ: মাতাপিতার/অভিভাবকের সক্ষমতা" : "Section B: Parent/Guardian Capacity"}>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">{isBn ? "২.১ মৌলিক যত্ন, নিরাপত্তা ও সুরক্ষা" : "2.1 Basic Care, Safety & Protection"}</p>
            <RatingPicker value={extras.basicCareRating} onChange={v => setExtras(x => ({...x, basicCareRating: v}))} />
            <Textarea className="mt-2 min-h-[50px] text-xs" placeholder={isBn ? "মন্তব্য" : "Notes"} value={extras.basicCareNotes} onChange={e => setExtras(x => ({...x, basicCareNotes: e.target.value}))} />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">{isBn ? "২.২ আবেগীয় উষ্ণতা ও স্থিতিশীলতা" : "2.2 Emotional Warmth & Stability"}</p>
            <RatingPicker value={extras.emotionalWarmthRating} onChange={v => setExtras(x => ({...x, emotionalWarmthRating: v}))} />
            <Textarea className="mt-2 min-h-[50px] text-xs" placeholder={isBn ? "মন্তব্য" : "Notes"} value={extras.emotionalWarmthNotes} onChange={e => setExtras(x => ({...x, emotionalWarmthNotes: e.target.value}))} />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">{isBn ? "২.৩ নির্দেশনা, সীমা ও উৎসাহ" : "2.3 Guidance, Boundaries & Stimulation"}</p>
            <RatingPicker value={extras.guidanceRating} onChange={v => setExtras(x => ({...x, guidanceRating: v}))} />
            <Textarea className="mt-2 min-h-[50px] text-xs" placeholder={isBn ? "মন্তব্য" : "Notes"} value={extras.guidanceNotes} onChange={e => setExtras(x => ({...x, guidanceNotes: e.target.value}))} />
          </div>
        </div>
      </SCard>
      <SCard title={isBn ? "খণ্ড-গ: পরিবেশ ও পরিবেশগত উপাদান" : "Section C: Environment & Environmental Factors"}>
        <FL label={isBn ? "৩.১ পারিবারিক ইতিহাস ও কার্যকলাপ" : "3.1 Family History & Functioning"}><Textarea className="min-h-[60px]" value={extras.familyHistoryNotes} onChange={e => setExtras(x => ({...x, familyHistoryNotes: e.target.value}))} /></FL>
        <FL label={isBn ? "৩.২ বর্ধিত পরিবার" : "3.2 Extended Family"}><Textarea className="min-h-[50px]" value={extras.extendedFamilyNotes} onChange={e => setExtras(x => ({...x, extendedFamilyNotes: e.target.value}))} /></FL>
        <FL label={isBn ? "৩.৩ বাসস্থান ও আর্থিক বিবেচনা" : "3.3 Housing & Financial Considerations"}><Textarea className="min-h-[50px]" value={extras.housingNotes} onChange={e => setExtras(x => ({...x, housingNotes: e.target.value}))} /></FL>
        <FL label={isBn ? "৩.৪ সমাজ ও কমিউনিটির উপাদান" : "3.4 Social & Community Factors"}><Textarea className="min-h-[50px]" value={extras.communityNotes} onChange={e => setExtras(x => ({...x, communityNotes: e.target.value}))} /></FL>
      </SCard>
      <SCard title={isBn ? "সামগ্রিক সারসংক্ষেপ ও সুপারিশ" : "Overall Summary & Recommendations"}>
        <Textarea className="min-h-[80px]" value={extras.overallSummary} onChange={e => setExtras(x => ({...x, overallSummary: e.target.value}))} />
      </SCard>
    </div>
  );
}

/* ────── Form 4: Intervention Plan ────── */
function PlanTab({ caseId }: { caseId: number }) {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ planDate: new Date().toISOString().split("T")[0], planEndDate: "", caseWorkerName: "", supervisorName: "", problemStatement: "", longTermGoal: "", objectives: "", activities: "", responsiblePerson: "", resources: "", progressIndicators: "", reviewDate: "", childCommitments: "", familyCommitments: "", organizationCommitments: "" });

  const { data: existing, refetch } = useQuery({
    queryKey: ["case-intervention-plans", caseId],
    queryFn: async () => { const r = await fetch(`/api/case-intervention-plans?caseId=${caseId}`); return r.json(); },
  });
  const rec = existing?.[0];

  useEffect(() => {
    if (rec && editing) setForm({ planDate: rec.planDate ?? "", planEndDate: rec.planEndDate ?? "", caseWorkerName: rec.caseWorkerName ?? "", supervisorName: rec.supervisorName ?? "", problemStatement: rec.problemStatement ?? "", longTermGoal: rec.longTermGoal ?? "", objectives: rec.objectives ?? "", activities: rec.activities ?? "", responsiblePerson: rec.responsiblePerson ?? "", resources: rec.resources ?? "", progressIndicators: rec.progressIndicators ?? "", reviewDate: rec.reviewDate ?? "", childCommitments: rec.childCommitments ?? "", familyCommitments: rec.familyCommitments ?? "", organizationCommitments: rec.organizationCommitments ?? "" });
  }, [rec, editing]);

  const set = (k: string, v: string) => setForm(f => ({...f, [k]: v}));
  const inp = (k: keyof typeof form) => ({ value: form[k], onChange: (e: any) => set(k, e.target.value) });

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = { caseId, ...form };
      if (rec) return fetch(`/api/case-intervention-plans/${rec.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return fetch("/api/case-intervention-plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    },
    onSuccess: () => { toast({ title: isBn ? "সফল" : "Success", description: isBn ? "হস্তক্ষেপ পরিকল্পনা সংরক্ষিত হয়েছে।" : "Intervention plan saved." }); setEditing(false); refetch(); },
    onError: () => toast({ title: isBn ? "ত্রুটি" : "Error", description: isBn ? "সংরক্ষণ ব্যর্থ হয়েছে।" : "Failed to save.", variant: "destructive" }),
  });

  if (!editing) return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => { if(!rec){} setEditing(true); }} className="gap-1.5">
          {rec ? <><Edit2 className="h-3.5 w-3.5" />{isBn ? "সম্পাদনা" : "Edit"}</> : <><Plus className="h-3.5 w-3.5" />{isBn ? "হস্তক্ষেপ পরিকল্পনা তৈরি করুন" : "Create Intervention Plan"}</>}
        </Button>
      </div>
      {!rec && <div className="text-center py-12 text-muted-foreground">{isBn ? "এখনো হস্তক্ষেপ পরিকল্পনা (Form 4) তৈরি করা হয়নি।" : "Intervention Plan (Form 4) has not been created yet."}</div>}
      {rec && <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <DV label={isBn ? "পরিকল্পনার তারিখ" : "Plan Date"} value={rec.planDate} />
          <DV label={isBn ? "সমাপ্তির তারিখ" : "End Date"} value={rec.planEndDate} />
          <DV label={isBn ? "পর্যালোচনার তারিখ" : "Review Date"} value={rec.reviewDate} />
          <DV label={isBn ? "কেস ওয়ার্কার" : "Case Worker"} value={rec.caseWorkerName} />
          <DV label={isBn ? "তত্ত্বাবধানকারী" : "Supervisor"} value={rec.supervisorName} />
        </div>
        <SCard title={isBn ? "সমস্যা বিবৃতি ও লক্ষ্য" : "Problem Statement & Goals"}>
          <DV label={isBn ? "সমস্যা বিবৃতি" : "Problem Statement"} value={rec.problemStatement} />
          <DV label={isBn ? "দীর্ঘমেয়াদী লক্ষ্য" : "Long-term Goal"} value={rec.longTermGoal} />
          <DV label={isBn ? "উদ্দেশ্যসমূহ" : "Objectives"} value={rec.objectives} />
        </SCard>
        <SCard title={isBn ? "কার্যক্রম ও দায়িত্ব" : "Activities & Responsibilities"}>
          <DV label={isBn ? "কার্যক্রম ও সময়সীমা" : "Activities & Timeline"} value={rec.activities} />
          <DV label={isBn ? "দায়িত্বপ্রাপ্ত ব্যক্তি" : "Responsible Person"} value={rec.responsiblePerson} />
          <DV label={isBn ? "প্রয়োজনীয় সম্পদ" : "Required Resources"} value={rec.resources} />
          <DV label={isBn ? "অগ্রগতির সূচক" : "Progress Indicators"} value={rec.progressIndicators} />
        </SCard>
        <SCard title={isBn ? "প্রতিশ্রুতি" : "Commitments"}>
          <DV label={isBn ? "শিশুর প্রতিশ্রুতি" : "Child's Commitments"} value={rec.childCommitments} />
          <DV label={isBn ? "পরিবারের প্রতিশ্রুতি" : "Family's Commitments"} value={rec.familyCommitments} />
          <DV label={isBn ? "প্রতিষ্ঠানের প্রতিশ্রুতি" : "Organisation's Commitments"} value={rec.organizationCommitments} />
        </SCard>
      </div>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="gap-1.5"><X className="h-3.5 w-3.5" />{isBn ? "বাতিল" : "Cancel"}</Button>
        <Button size="sm" onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="gap-1.5">
          {saveMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}{isBn ? "সংরক্ষণ" : "Save"}
        </Button>
      </div>
      <SCard title={isBn ? "পরিকল্পনার তথ্য" : "Plan Details"}>
        <div className="grid grid-cols-3 gap-3">
          <FL label={isBn ? "পরিকল্পনার তারিখ" : "Plan Date"}><Input type="date" {...inp("planDate")} /></FL>
          <FL label={isBn ? "সমাপ্তির তারিখ" : "End Date"}><Input type="date" {...inp("planEndDate")} /></FL>
          <FL label={isBn ? "পর্যালোচনার তারিখ" : "Review Date"}><Input type="date" {...inp("reviewDate")} /></FL>
          <FL label={isBn ? "কেস ওয়ার্কার" : "Case Worker"}><Input {...inp("caseWorkerName")} /></FL>
          <FL label={isBn ? "তত্ত্বাবধানকারী" : "Supervisor"}><Input {...inp("supervisorName")} /></FL>
        </div>
      </SCard>
      <SCard title={isBn ? "সমস্যা বিবৃতি ও লক্ষ্য" : "Problem Statement & Goals"}>
        <FL label={isBn ? "সমস্যা বিবৃতি" : "Problem Statement"}><Textarea className="min-h-[70px]" {...inp("problemStatement")} /></FL>
        <FL label={isBn ? "দীর্ঘমেয়াদী লক্ষ্য" : "Long-term Goal"}><Textarea className="min-h-[60px]" {...inp("longTermGoal")} /></FL>
        <FL label={isBn ? "উদ্দেশ্যসমূহ (নির্দিষ্ট ও পরিমাপযোগ্য)" : "Objectives (Specific & Measurable)"}><Textarea className="min-h-[80px]" {...inp("objectives")} /></FL>
      </SCard>
      <SCard title={isBn ? "কার্যক্রম ও দায়িত্ব" : "Activities & Responsibilities"}>
        <FL label={isBn ? "কার্যক্রম ও সময়সীমা" : "Activities & Timeline"}><Textarea className="min-h-[80px]" {...inp("activities")} /></FL>
        <FL label={isBn ? "দায়িত্বপ্রাপ্ত ব্যক্তি" : "Responsible Person"}><Input {...inp("responsiblePerson")} /></FL>
        <FL label={isBn ? "প্রয়োজনীয় সম্পদ" : "Required Resources"}><Textarea className="min-h-[50px]" {...inp("resources")} /></FL>
        <FL label={isBn ? "অগ্রগতির সূচক" : "Progress Indicators"}><Textarea className="min-h-[50px]" {...inp("progressIndicators")} /></FL>
      </SCard>
      <SCard title={isBn ? "প্রতিশ্রুতি" : "Commitments"}>
        <FL label={isBn ? "শিশুর প্রতিশ্রুতি" : "Child's Commitments"}><Textarea className="min-h-[60px]" {...inp("childCommitments")} /></FL>
        <FL label={isBn ? "পরিবারের প্রতিশ্রুতি" : "Family's Commitments"}><Textarea className="min-h-[60px]" {...inp("familyCommitments")} /></FL>
        <FL label={isBn ? "প্রতিষ্ঠানের প্রতিশ্রুতি" : "Organisation's Commitments"}><Textarea className="min-h-[60px]" {...inp("organizationCommitments")} /></FL>
      </SCard>
    </div>
  );
}

/* ────── Form 5: Implementation Agreement ────── */
function AgreementTab({ caseId }: { caseId: number }) {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ agreementDate: new Date().toISOString().split("T")[0], agreementText: "", childName: "", childSignature: "", guardianName: "", guardianSignature: "", witnessName: "", witnessSignature: "", officerName: "", officerSignature: "", agreementStatus: "Draft", notes: "" });

  const { data: existing, refetch } = useQuery({
    queryKey: ["case-agreements", caseId],
    queryFn: async () => { const r = await fetch(`/api/case-agreements?caseId=${caseId}`); return r.json(); },
  });
  const rec = existing?.[0];

  useEffect(() => {
    if (rec && editing) setForm({ agreementDate: rec.agreementDate ?? "", agreementText: rec.agreementText ?? "", childName: rec.childName ?? "", childSignature: rec.childSignature ?? "", guardianName: rec.guardianName ?? "", guardianSignature: rec.guardianSignature ?? "", witnessName: rec.witnessName ?? "", witnessSignature: rec.witnessSignature ?? "", officerName: rec.officerName ?? "", officerSignature: rec.officerSignature ?? "", agreementStatus: rec.agreementStatus ?? "Draft", notes: rec.notes ?? "" });
  }, [rec, editing]);

  const set = (k: string, v: string) => setForm(f => ({...f, [k]: v}));
  const inp = (k: keyof typeof form) => ({ value: form[k], onChange: (e: any) => set(k, e.target.value) });

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = { caseId, ...form };
      if (rec) return fetch(`/api/case-agreements/${rec.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return fetch("/api/case-agreements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    },
    onSuccess: () => { toast({ title: isBn ? "সফল" : "Success", description: isBn ? "বাস্তবায়ন চুক্তি সংরক্ষিত হয়েছে।" : "Implementation agreement saved." }); setEditing(false); refetch(); },
    onError: () => toast({ title: isBn ? "ত্রুটি" : "Error", description: isBn ? "সংরক্ষণ ব্যর্থ হয়েছে।" : "Failed to save.", variant: "destructive" }),
  });

  if (!editing) return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1.5">
          {rec ? <><Edit2 className="h-3.5 w-3.5" />{isBn ? "সম্পাদনা" : "Edit"}</> : <><Plus className="h-3.5 w-3.5" />{isBn ? "বাস্তবায়ন চুক্তি তৈরি করুন" : "Create Implementation Agreement"}</>}
        </Button>
      </div>
      {!rec && <div className="text-center py-12 text-muted-foreground">{isBn ? "এখনো বাস্তবায়ন চুক্তি (Form 5) তৈরি করা হয়নি।" : "Implementation Agreement (Form 5) has not been created yet."}</div>}
      {rec && <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <DV label={isBn ? "চুক্তির তারিখ" : "Agreement Date"} value={rec.agreementDate} />
          <DV label={isBn ? "চুক্তির অবস্থা" : "Agreement Status"} value={rec.agreementStatus} />
        </div>
        {rec.agreementText && <SCard title={isBn ? "চুক্তির বিষয়বস্তু" : "Agreement Content"}><p className="text-sm whitespace-pre-line">{rec.agreementText}</p></SCard>}
        <SCard title={isBn ? "স্বাক্ষরকারীগণ" : "Signatories"}>
          <div className="grid grid-cols-2 gap-3">
            <DV label={isBn ? "শিশুর নাম" : "Child's Name"} value={rec.childName} />
            <DV label={isBn ? "অভিভাবকের নাম" : "Guardian's Name"} value={rec.guardianName} />
            <DV label={isBn ? "সাক্ষীর নাম" : "Witness Name"} value={rec.witnessName} />
            <DV label={isBn ? "দায়িত্বপ্রাপ্ত কর্মকর্তার নাম" : "Responsible Officer Name"} value={rec.officerName} />
          </div>
        </SCard>
        {rec.notes && <DV label={isBn ? "মন্তব্য" : "Notes"} value={rec.notes} />}
      </div>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="gap-1.5"><X className="h-3.5 w-3.5" />{isBn ? "বাতিল" : "Cancel"}</Button>
        <Button size="sm" onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="gap-1.5">
          {saveMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}{isBn ? "সংরক্ষণ" : "Save"}
        </Button>
      </div>
      <SCard title={isBn ? "চুক্তির তথ্য" : "Agreement Details"}>
        <div className="grid grid-cols-2 gap-3">
          <FL label={isBn ? "চুক্তির তারিখ" : "Agreement Date"}><Input type="date" {...inp("agreementDate")} /></FL>
          <FL label={isBn ? "চুক্তির অবস্থা" : "Agreement Status"}>
            <Select value={form.agreementStatus} onValueChange={v => set("agreementStatus", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">{isBn ? "খসড়া (Draft)" : "Draft"}</SelectItem>
                <SelectItem value="Active">{isBn ? "সক্রিয় (Active)" : "Active"}</SelectItem>
                <SelectItem value="Completed">{isBn ? "সম্পন্ন (Completed)" : "Completed"}</SelectItem>
                <SelectItem value="Breached">{isBn ? "লঙ্ঘিত (Breached)" : "Breached"}</SelectItem>
              </SelectContent>
            </Select>
          </FL>
        </div>
      </SCard>
      <SCard title={isBn ? "চুক্তির বিষয়বস্তু" : "Agreement Content"}>
        <FL label={isBn ? "চুক্তি পাঠ্য (মূল বিষয়বস্তু লিখুন)" : "Agreement Text (write main content)"}>
          <Textarea className="min-h-[120px]" {...inp("agreementText")} placeholder={isBn ? "চুক্তির শর্তাবলী এবং প্রতিশ্রুতিসমূহ লিখুন..." : "Write the terms and commitments of the agreement..."} />
        </FL>
      </SCard>
      <SCard title={isBn ? "স্বাক্ষরকারীগণ" : "Signatories"}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-primary">{isBn ? "শিশু" : "Child"}</p>
            <FL label={isBn ? "নাম" : "Name"}><Input {...inp("childName")} /></FL>
            <FL label={isBn ? "স্বাক্ষর/টিপসই" : "Signature/Thumbprint"}><Input {...inp("childSignature")} placeholder={isBn ? "নাম বা চিহ্ন" : "Name or mark"} /></FL>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-primary">{isBn ? "অভিভাবক" : "Guardian"}</p>
            <FL label={isBn ? "নাম" : "Name"}><Input {...inp("guardianName")} /></FL>
            <FL label={isBn ? "স্বাক্ষর/টিপসই" : "Signature/Thumbprint"}><Input {...inp("guardianSignature")} placeholder={isBn ? "নাম বা চিহ্ন" : "Name or mark"} /></FL>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-primary">{isBn ? "সাক্ষী" : "Witness"}</p>
            <FL label={isBn ? "নাম" : "Name"}><Input {...inp("witnessName")} /></FL>
            <FL label={isBn ? "স্বাক্ষর" : "Signature"}><Input {...inp("witnessSignature")} /></FL>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-primary">{isBn ? "দায়িত্বপ্রাপ্ত কর্মকর্তা" : "Responsible Officer"}</p>
            <FL label={isBn ? "নাম" : "Name"}><Input {...inp("officerName")} /></FL>
            <FL label={isBn ? "স্বাক্ষর" : "Signature"}><Input {...inp("officerSignature")} /></FL>
          </div>
        </div>
      </SCard>
      <SCard title={isBn ? "মন্তব্য" : "Notes"}><Textarea className="min-h-[60px]" {...inp("notes")} /></SCard>
    </div>
  );
}

/* ────── Main page ────── */
export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const [activeTab, setActiveTab] = useState<TabId>("intake");

  const { data: caseFile, isLoading, error } = useGetCase(parseInt(id!), {
    query: { queryKey: getGetCaseQueryKey(parseInt(id!)) },
  });

  function refresh() { qc.invalidateQueries({ queryKey: getGetCaseQueryKey(parseInt(id!)) }); }

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (error || !caseFile) return <div className="text-center py-16 text-muted-foreground">{isBn ? "কেস ফাইল পাওয়া যায়নি।" : "Case file not found."}</div>;

  const cf = caseFile as any;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/cases">
            <Button variant="ghost" size="sm" className="gap-1.5"><ArrowLeft className="h-4 w-4" />{isBn ? "সকল কেস" : "All Cases"}</Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold leading-tight">{isBn ? `কেস ফাইল — ${cf.childName ?? "শিশু"}` : `Case File — ${cf.childName ?? "Child"}`}</h1>
            <p className="text-sm text-muted-foreground">{isBn ? "কেস আইডি:" : "Case ID:"} {cf.caseId || cf.id} {cf.registrationNumber && `| ${isBn ? "নিবন্ধন:" : "Reg:"} ${cf.registrationNumber}`}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3 text-sm">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[cf.caseStatus] || "bg-muted"}`}>{cf.caseStatus}</span>
            <span className="text-muted-foreground">{isBn ? "অনুমোদন অবস্থা:" : "Approval Status:"}</span>
            <span className="font-medium px-2 py-0.5 rounded-full bg-slate-100">{getWorkflowLabel(cf.workflowState, isBn)}</span>
          </div>
        </div>
      </div>
      
      <WorkflowActions recordType="case" recordId={cf.id} currentStatus={cf.workflowState || "Draft"} onSuccess={refresh} />

      {/* Sent-back message banner for CW */}
      {(cf.workflowState === "sent_back_to_cw_by_df" || cf.workflowState === "sent_back_to_cw_by_po") && cf.sentBackNotes && (
        <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
          <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-800">
              {cf.workflowState === "sent_back_to_cw_by_df"
                ? (isBn ? "DF কর্তৃক প্রত্যাবর্তিত — সংশোধন প্রয়োজন" : "Sent back by DF — Update Required")
                : (isBn ? "PO কর্তৃক প্রত্যাবর্তিত — সংশোধন প্রয়োজন" : "Sent back by PO — Update Required")}
            </p>
            <p className="text-sm text-orange-700 mt-1">{cf.sentBackNotes}</p>
            <p className="text-xs text-orange-500 mt-2">{isBn ? "নিচের ফরম ট্যাবে বিরতিত তথ্য সম্পাদনা করুন।" : "Edit the required information in the form tabs below, then resubmit to DF."}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b overflow-x-auto">
        {getTabs(isBn).map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex flex-col items-start px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === t.id ? "border-primary text-primary font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <span>{t.label}</span>
            <span className="text-xs opacity-60">{t.sub}</span>
          </button>
        ))}
      </div>

      <div>
        {activeTab === "intake" && <IntakeTab caseFile={cf} onRefresh={refresh} />}
        {activeTab === "risk" && <RiskTab caseId={cf.id} />}
        {activeTab === "detail" && <DetailTab caseId={cf.id} />}
        {activeTab === "plan" && <PlanTab caseId={cf.id} />}
        {activeTab === "agreement" && <AgreementTab caseId={cf.id} />}
        {activeTab === "timeline" && <div className="max-w-2xl"><WorkflowTimeline recordType="case" recordId={cf.id} /></div>}
      </div>
    </div>
  );
}
