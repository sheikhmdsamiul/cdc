import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetChild, getGetChildQueryKey,
  useUpdateChild,
  useListCases, getListCasesQueryKey,
  useListHealthAssessments, getListHealthAssessmentsQueryKey,
  useListCounselingSessions, getListCounselingSessionsQueryKey,
  useListRiskAssessments, getListRiskAssessmentsQueryKey,
  useListAdmissions, getListAdmissionsQueryKey,
  useListEducationPlans, getListEducationPlansQueryKey,
} from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Users, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DetailField, SectionCard } from "@/components/DetailField";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  calculateAgeFromDob,
  calculateDobFromAge,
  derivePredictedAge,
  derivePredictedDob,
  deriveVerifiedAge,
  deriveVerifiedDob,
  todayIsoDate,
} from "@/lib/age-dob";
import { MAX_UPLOAD_BYTES, readFileAsDataUrl } from "@/lib/file-data-url";
import { cn } from "@/lib/utils";

const riskColors: Record<string, string> = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};

const statusColors: Record<string, string> = {
  "Under Care": "bg-teal-100 text-teal-700",
  "Admitted": "bg-blue-100 text-blue-700",
  "Released": "bg-gray-100 text-gray-600",
  "Transferred": "bg-purple-100 text-purple-700",
};

const JAIL_LIST = [
  { id: "jail-dhaka-central", name: "কেন্দ্রীয় কারাগার, ঢাকা" },
  { id: "jail-ctg", name: "কেন্দ্রীয় কারাগার, চট্টগ্রাম" },
  { id: "jail-rajshahi", name: "কেন্দ্রীয় কারাগার, রাজশাহী" },
  { id: "jail-khulna", name: "কেন্দ্রীয় কারাগার, খুলনা" },
  { id: "jail-sylhet", name: "কেন্দ্রীয় কারাগার, সিলেট" },
  { id: "jail-barisal", name: "কেন্দ্রীয় কারাগার, বরিশাল" },
  { id: "jail-mymensingh", name: "কেন্দ্রীয় কারাগার, ময়মনসিংহ" },
  { id: "jail-rangpur", name: "কেন্দ্রীয় কারাগার, রংপুর" },
];

function toBnDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)] ?? digit);
}

function formatCenterStay(admissionDate?: string, isBn?: boolean) {
  if (!admissionDate) return undefined;
  const start = new Date(admissionDate);
  const end = new Date();

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += previousMonth;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) return undefined;

  if (isBn) {
    const parts = [];
    if (years > 0) parts.push(`${toBnDigits(years)} বছর`);
    if (months > 0) parts.push(`${toBnDigits(months)} মাস`);
    if (days > 0 || parts.length === 0) parts.push(`${toBnDigits(days)} দিন`);
    return parts.join(" ");
  }

  const parts = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (months > 0) parts.push(`${months} month${months === 1 ? "" : "s"}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} day${days === 1 ? "" : "s"}`);
  return parts.join(" ");
}

function formatYesNo(value?: boolean, isBn?: boolean) {
  if (value == null) return undefined;
  return value ? (isBn ? "হ্যাঁ" : "Yes") : (isBn ? "না" : "No");
}

export default function ChildDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const qc = useQueryClient();
  const childId = parseInt(id || "0", 10);

  const [predictedDobInput, setPredictedDobInput] = useState("");
  const [predictedAgeInput, setPredictedAgeInput] = useState("");
  const [verifiedDobInput, setVerifiedDobInput] = useState("");
  const [verifiedAgeInput, setVerifiedAgeInput] = useState("");
  const [birthRegistrationNoInput, setBirthRegistrationNoInput] = useState("");
  const [birthCertificateFileNameInput, setBirthCertificateFileNameInput] = useState("");
  const [birthCertificateFileDataUrlInput, setBirthCertificateFileDataUrlInput] = useState("");
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [savingBirthInfo, setSavingBirthInfo] = useState(false);
  const [selectedJail, setSelectedJail] = useState("");
  const [transferring, setTransferring] = useState(false);

  const { data: child, isLoading } = useGetChild(childId, {
    query: { queryKey: getGetChildQueryKey(childId), enabled: !!childId },
  });
  const updateChild = useUpdateChild();

  const { data: casesResp } = useListCases({ childId } as any, {
    query: { queryKey: getListCasesQueryKey({ childId } as any), enabled: !!childId },
  });
  const { data: healthAssessments = [] } = useListHealthAssessments({ childId } as any, {
    query: { queryKey: getListHealthAssessmentsQueryKey({ childId } as any), enabled: !!childId },
  });
  const { data: counselingSessions = [] } = useListCounselingSessions({ childId } as any, {
    query: { queryKey: getListCounselingSessionsQueryKey({ childId } as any), enabled: !!childId },
  });
  const { data: riskAssessments = [] } = useListRiskAssessments({ childId } as any, {
    query: { queryKey: getListRiskAssessmentsQueryKey({ childId } as any), enabled: !!childId },
  });
  const { data: admissions = [] } = useListAdmissions({ childId } as any, {
    query: { queryKey: getListAdmissionsQueryKey({ childId } as any), enabled: !!childId },
  });
  const { data: educationPlans = [] } = useListEducationPlans({ childId } as any, {
    query: { queryKey: getListEducationPlansQueryKey({ childId } as any), enabled: !!childId },
  });
  const { data: familySocioeconomicRecords = [] } = useQuery({
    queryKey: ["family-socioeconomic-records", childId],
    enabled: !!childId,
    queryFn: async () => {
      const response = await fetch(`/api/family-socioeconomic-records?childId=${childId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load family socioeconomic records");
      return response.json();
    },
  });

  const cases = Array.isArray(casesResp) ? casesResp : ((casesResp as any)?.data ?? []);
  const c = child as any;
  const genderLabelMap = isBn
    ? { Boy: "ছেলে", Girl: "মেয়ে", Others: "অন্যান্য", Male: "ছেলে", Female: "মেয়ে", Other: "অন্যান্য" }
    : { Boy: "Boy", Girl: "Girl", Others: "Others", Male: "Boy", Female: "Girl", Other: "Others" };
  const predictedDob = child ? derivePredictedDob(c) : null;
  const predictedAge = child ? derivePredictedAge(c) : null;
  const verifiedDob = child ? deriveVerifiedDob(c) : null;
  const verifiedAge = child ? deriveVerifiedAge(c) : null;

  useEffect(() => {
    if (!child) return;
    setPredictedDobInput(predictedDob ?? "");
    setPredictedAgeInput(predictedAge != null ? String(predictedAge) : "");
    setVerifiedDobInput(verifiedDob ?? "");
    setVerifiedAgeInput(verifiedAge != null ? String(verifiedAge) : "");
    setBirthRegistrationNoInput(c.birthRegistrationNo ?? "");
    setBirthCertificateFileNameInput(c.birthCertificateFileName ?? "");
    setBirthCertificateFileDataUrlInput(c.birthCertificateFileDataUrl ?? "");
  }, [child, c?.birthCertificateFileDataUrl, c?.birthCertificateFileName, c?.birthRegistrationNo, predictedDob, predictedAge, verifiedDob, verifiedAge]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!child) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Users className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{isBn ? "শিশুর তথ্য পাওয়া যায়নি।" : "Child record not found."}</p>
        <Button variant="outline" onClick={() => navigate("/children")}>{isBn ? "শিশুদের তালিকায় ফিরুন" : "Back to Children"}</Button>
      </div>
    );
  }

  const latestRisk = [...riskAssessments].sort((a, b) => b.id - a.id)[0];
  const educationAdmissionForms = educationPlans.filter((plan: any) => plan.programType === "Admission Form");
  const currentAge: number | null = c.currentAge ?? null;
  const isAdult = currentAge !== null && currentAge >= 18;
  const centerStay = formatCenterStay(c.admissionDate, isBn);

  function handlePredictedDobChange(value: string) {
    setPredictedDobInput(value);
    const nextAge = calculateAgeFromDob(value);
    setPredictedAgeInput(nextAge != null ? String(nextAge) : "");
  }

  function handlePredictedAgeChange(value: string) {
    setPredictedAgeInput(value);
    const numericAge = Number.parseInt(value, 10);
    if (!value || Number.isNaN(numericAge) || numericAge < 1) {
      setPredictedDobInput("");
      return;
    }

    const nextDob = calculateDobFromAge(numericAge);
    setPredictedDobInput(nextDob ?? "");
  }

  function handleVerifiedDobChange(value: string) {
    setVerifiedDobInput(value);
    const nextAge = calculateAgeFromDob(value);
    setVerifiedAgeInput(nextAge != null ? String(nextAge) : "");
  }

  function handleVerifiedAgeChange(value: string) {
    setVerifiedAgeInput(value);
    const numericAge = Number.parseInt(value, 10);
    if (!value || Number.isNaN(numericAge) || numericAge < 1) {
      setVerifiedDobInput("");
      return;
    }

    const nextDob = calculateDobFromAge(numericAge);
    setVerifiedDobInput(nextDob ?? "");
  }

  async function handleBirthCertificateChange(file: File | null) {
    if (!file) {
      setBirthCertificateFileNameInput("");
      setBirthCertificateFileDataUrlInput("");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setBirthCertificateFileNameInput(file.name);
      setBirthCertificateFileDataUrlInput(dataUrl);
    } catch {
      toast({
        title: isBn ? "ত্রুটি" : "Error",
        description: isBn
          ? `ফাইল আপলোড করা যায়নি। সর্বোচ্চ আকার ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))} MB।`
          : `Failed to upload file. Maximum size is ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`,
        variant: "destructive",
      });
    }
  }

  async function saveBirthInfo() {
    const normalizedPredictedDob = predictedDobInput || null;
    const normalizedVerifiedDob = verifiedDobInput || null;
    const nextAgeAtAdmission = normalizedPredictedDob && c.admissionDate
      ? calculateAgeFromDob(normalizedPredictedDob, c.admissionDate)
      : null;
    const nextVerifiedAge = normalizedVerifiedDob
      ? calculateAgeFromDob(normalizedVerifiedDob)
      : null;

    if (!normalizedPredictedDob && predictedAgeInput) {
      toast({
        title: isBn ? "ত্রুটি" : "Error",
        description: isBn ? "আনুমানিক বয়স বা জন্ম তারিখ ঠিকভাবে দিন।" : "Enter a valid predicted age or date of birth.",
        variant: "destructive",
      });
      return;
    }

    if (!normalizedVerifiedDob && verifiedAgeInput) {
      toast({
        title: isBn ? "ত্রুটি" : "Error",
        description: isBn ? "যাচাইকৃত বয়স বা জন্ম তারিখ ঠিকভাবে দিন।" : "Enter a valid verified age or date of birth.",
        variant: "destructive",
      });
      return;
    }

    setSavingBirthInfo(true);
    try {
      await updateChild.mutateAsync({
        id: childId,
        data: {
          dateOfBirth: normalizedPredictedDob,
          ageAtAdmission: nextAgeAtAdmission,
          verifiedDob: normalizedVerifiedDob,
          verifiedAge: nextVerifiedAge,
          verifiedAgeDate: normalizedVerifiedDob ? todayIsoDate() : null,
          birthRegistrationNo: birthRegistrationNoInput || null,
          birthCertificateFileName: birthCertificateFileNameInput || null,
          birthCertificateFileDataUrl: birthCertificateFileDataUrlInput || null,
        } as any,
      });
      qc.invalidateQueries({ queryKey: getGetChildQueryKey(childId) });
      toast({
        title: isBn ? "সফল" : "Success",
        description: isBn ? "জন্ম তথ্য সংরক্ষিত হয়েছে।" : "Birth information saved.",
      });
    } catch (error: any) {
      toast({
        title: isBn ? "ত্রুটি" : "Error",
        description: error?.message || (isBn ? "সংরক্ষণ করতে ব্যর্থ হয়েছে।" : "Failed to save birth information."),
        variant: "destructive",
      });
    } finally {
      setSavingBirthInfo(false);
    }
  }

  async function doTransfer() {
    if (!selectedJail) return;
    setTransferring(true);
    try {
      await updateChild.mutateAsync({ id: childId, data: { currentStatus: "Transferred" } as any });
      qc.invalidateQueries({ queryKey: getGetChildQueryKey(childId) });
      const jailName = JAIL_LIST.find(j => j.id === selectedJail)?.name || selectedJail;
      toast({ title: "স্থানান্তর সম্পন্ন", description: `${c.fullName}-কে ${jailName}-এ স্থানান্তর করা হয়েছে।` });
    } catch {
      toast({ title: "ত্রুটি", description: "স্থানান্তর করতে ব্যর্থ হয়েছে।", variant: "destructive" });
    } finally {
      setTransferring(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* 18+ Adult Banner */}
      {isAdult && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">{isBn ? "বয়স ১৮ বছর বা তার বেশি — কারাগারে স্থানান্তর প্রয়োজন" : "Age 18+ — Transfer to Prison Required"}</p>
              <p className="text-xs text-red-600">{isBn ? <>এই শিশুর বর্তমান বয়স <strong>{currentAge} বছর</strong>। আইন অনুযায়ী তাকে কারাগারে স্থানান্তর করতে হবে।</> : <>This individual is currently <strong>{currentAge} years old</strong>. By law, they must be transferred to prison.</>}</p>
            </div>
          </div>
          {c.currentStatus !== "Transferred" && (
            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex-1 min-w-48">
                <label className="text-xs font-medium text-red-700 block mb-1">{isBn ? "গন্তব্য কারাগার বেছে নিন" : "Select Destination Prison"}</label>
                <select
                  value={selectedJail}
                  onChange={(e) => setSelectedJail(e.target.value)}
                  className="w-full rounded-md border border-red-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="">{isBn ? "— কারাগার বেছে নিন —" : "— Select Prison —"}</option>
                  {JAIL_LIST.map((j) => (
                    <option key={j.id} value={j.id}>{j.name}</option>
                  ))}
                </select>
              </div>
              <Button
                size="sm"
                variant="destructive"
                disabled={!selectedJail || transferring}
                onClick={doTransfer}
              >
                {transferring && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                {isBn ? "কারাগারে স্থানান্তর করুন" : "Transfer to Prison"}
              </Button>
            </div>
          )}
          {c.currentStatus === "Transferred" && (
            <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              {isBn ? "স্থানান্তর সম্পন্ন হয়েছে।" : "Transfer completed."}
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/children")} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{child.fullName}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[(child as any).currentStatus] || "bg-gray-100 text-gray-600"}`}>
              {isBn ? ({"Draft":"খসড়া", "Admitted":"ভর্তি", "Under Care":"যত্নাধীন", "Released":"মুক্তিপ্রাপ্ত", "Transferred":"স্থানান্তরিত"}[(child as any).currentStatus as string] || (child as any).currentStatus) : (child as any).currentStatus}
            </span>
            {latestRisk && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColors[latestRisk.overallRiskLevel] || ""}`}>
                {latestRisk.overallRiskLevel} {isBn ? "ঝুঁকি" : "Risk"}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1 font-mono">{(child as any).childId}</p>
        </div>
        {latestRisk?.immediateActionRequired && (
          <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1.5 rounded-md text-sm font-medium">
            <AlertTriangle className="h-4 w-4" />
            {isBn ? "তাৎক্ষণিক পদক্ষেপ প্রয়োজন" : "Immediate Action Required"}
          </div>
        )}
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">{isBn ? "প্রোফাইল" : "Profile"}</TabsTrigger>
          <TabsTrigger value="cases">{isBn ? "মামলা" : "Cases"} ({Array.isArray(cases) ? cases.length : 0})</TabsTrigger>
          <TabsTrigger value="health">{isBn ? "স্বাস্থ্য" : "Health"} ({healthAssessments.length})</TabsTrigger>
          <TabsTrigger value="counseling">{isBn ? "কাউন্সেলিং" : "Counseling"} ({counselingSessions.length})</TabsTrigger>
          <TabsTrigger value="risk">{isBn ? "ঝুঁকি" : "Risk"} ({riskAssessments.length})</TabsTrigger>
          <TabsTrigger value="admissions">{isBn ? "ভর্তি" : "Admissions"} ({admissions.length})</TabsTrigger>
          <TabsTrigger value="education">{isBn ? "শিক্ষা ও দক্ষতা" : "Education & Skills"} ({educationAdmissionForms.length})</TabsTrigger>
          <TabsTrigger value="family-socioeconomic">{isBn ? "পারিবারিক ও আর্থ-সামাজিক তথ্যাদি" : "Family & Socioeconomic"} ({familySocioeconomicRecords.length})</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-4 space-y-4">
          <SectionCard title={isBn ? "ব্যক্তিগত তথ্য" : "Personal Information"}>
            <div className="grid gap-4 md:grid-cols-[1fr_240px]">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <DetailField label={isBn ? "রেজিস্ট্রেশন নম্বর" : "Registration Number"} value={(child as any).childId} />
                <DetailField label={isBn ? "পূর্ণ নাম" : "Full Name"} value={child.fullName} />
                <DetailField label={isBn ? "মাতার নাম" : "Mother's Name"} value={(child as any).motherName} />
                <DetailField label={isBn ? "পিতার নাম" : "Father's Name"} value={(child as any).fatherName} />
                <DetailField
                  label={isBn ? "লিঙ্গ" : "Gender"}
                  value={genderLabelMap[(child as any).gender as keyof typeof genderLabelMap] ?? (child as any).gender}
                />
                <DetailField label={isBn ? "ধর্ম" : "Religion"} value={(child as any).religion} />
                <DetailField label={isBn ? "জাতীয়তা" : "Nationality"} value={(child as any).nationality} />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => c.profileImageDataUrl && setImagePreviewOpen(true)}
                  disabled={!c.profileImageDataUrl}
                  className={cn(
                    "group relative w-full max-w-[220px] overflow-hidden rounded-xl border bg-slate-100 text-left",
                    c.profileImageDataUrl ? "cursor-pointer" : "cursor-default",
                  )}
                >
                  {c.profileImageDataUrl ? (
                    <>
                      <img
                        src={c.profileImageDataUrl}
                        alt={isBn ? "শিশুর প্রোফাইল ছবি" : "Child profile photo"}
                        className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-md transition group-hover:bg-slate-950/10 group-hover:backdrop-blur-sm" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-3 text-white">
                        <p className="text-xs font-semibold">
                          {isBn ? "ছবি দেখতে ক্লিক করুন" : "Click to view photo"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-56 items-center justify-center text-slate-500">
                      <div className="text-center">
                        <Users className="mx-auto h-8 w-8" />
                        <p className="mt-2 text-xs">
                          {isBn ? "কোনো ছবি আপলোড করা হয়নি" : "No photo uploaded"}
                        </p>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                    {isBn ? "শিশুর বর্তমান বয়স" : "Current Age Information"}
                  </p>
                </div>

                <DetailField
                  label={isBn ? "তারিখ" : "Date"}
                  value={predictedDob ?? (isBn ? "অজানা" : "Unknown")}
                />
                <DetailField
                  label={isBn ? "বয়স" : "Age"}
                  value={predictedAge != null ? (isBn ? `${predictedAge} বছর` : `${predictedAge} yrs`) : (isBn ? "অজানা" : "Unknown")}
                />
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50/60 p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                    {isBn ? "সিডব্লিউ/জন্ম সনদ অনুযায়ী বয়স" : "CW/Birth Certificate Age"}
                  </p>
                </div>

                <DetailField
                  label={isBn ? "তারিখ" : "Date"}
                  value={verifiedDob ?? (isBn ? "অজানা" : "Unknown")}
                />
                <DetailField
                  label={isBn ? "বয়স" : "Age"}
                  value={verifiedAge != null ? (isBn ? `${verifiedAge} বছর` : `${verifiedAge} yrs`) : (isBn ? "অজানা" : "Unknown")}
                />
              </div>

              <div className="rounded-lg border border-violet-200 bg-violet-50/60 p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide">
                    {isBn ? "জন্ম নিবন্ধন তথ্য" : "Birth Registration Information"}
                  </p>
                </div>

                <DetailField
                  label={isBn ? "জন্ম নিবন্ধন নম্বর" : "Birth Registration No."}
                  value={c.birthRegistrationNo ?? (isBn ? "অজানা" : "Unknown")}
                />

                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {isBn ? "জন্ম সনদ" : "Birth Certificate"}
                  </p>
                  {c.birthCertificateFileDataUrl ? (
                    <a
                      className="text-sm font-medium text-violet-700 underline underline-offset-2"
                      href={c.birthCertificateFileDataUrl}
                      download={c.birthCertificateFileName ?? "birth-certificate"}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {c.birthCertificateFileName ?? (isBn ? "আপলোডকৃত ফাইল দেখুন" : "View uploaded file")}
                    </a>
                  ) : (
                    <p className="text-sm">{isBn ? "আপলোড করা হয়নি" : "Not uploaded"}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {isBn ? "জন্ম তথ্য হালনাগাদ করুন" : "Update Birth Information"}
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-3">
                  <p className="text-sm font-medium">{isBn ? "আনুমানিক" : "Predicted"}</p>
                  <Input
                    type="date"
                    value={predictedDobInput}
                    onChange={(e) => handlePredictedDobChange(e.target.value)}
                  />
                  <Input
                    type="number"
                    min={1}
                    max={25}
                    value={predictedAgeInput}
                    onChange={(e) => handlePredictedAgeChange(e.target.value)}
                    placeholder={isBn ? "আনুমানিক বয়স" : "Predicted age"}
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium">{isBn ? "যাচাইকৃত" : "Verified"}</p>
                  <Input
                    type="date"
                    value={verifiedDobInput}
                    onChange={(e) => handleVerifiedDobChange(e.target.value)}
                  />
                  <Input
                    type="number"
                    min={1}
                    max={25}
                    value={verifiedAgeInput}
                    onChange={(e) => handleVerifiedAgeChange(e.target.value)}
                    placeholder={isBn ? "যাচাইকৃত বয়স" : "Verified age"}
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium">{isBn ? "জন্ম নিবন্ধন" : "Registration"}</p>
                  <Input
                    value={birthRegistrationNoInput}
                    onChange={(e) => setBirthRegistrationNoInput(e.target.value)}
                    placeholder={isBn ? "জন্ম নিবন্ধন নম্বর" : "Birth registration no."}
                  />
                  <Input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleBirthCertificateChange(e.target.files?.[0] ?? null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {birthCertificateFileNameInput
                      ? (isBn ? `নির্বাচিত ফাইল: ${birthCertificateFileNameInput}` : `Selected file: ${birthCertificateFileNameInput}`)
                      : (isBn ? "PDF বা ছবি আপলোড করা যাবে।" : "You can upload a PDF or image file.")}
                  </p>
                  {birthCertificateFileDataUrlInput && (
                    <a
                      className="inline-block text-sm text-violet-700 underline underline-offset-2"
                      href={birthCertificateFileDataUrlInput}
                      download={birthCertificateFileNameInput || "birth-certificate"}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {isBn ? "বর্তমান ফাইল দেখুন" : "View current file"}
                    </a>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <Button size="sm" onClick={saveBirthInfo} disabled={savingBirthInfo}>
                  {savingBirthInfo && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  {isBn ? "সংরক্ষণ করুন" : "Save"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {isBn
                  ? "প্রতিটি অংশে জন্ম তারিখ বা বয়স যেকোনো একটি দিলেই অন্যটি স্বয়ংক্রিয়ভাবে হিসাব হবে।"
                  : "In each section, entering either the age or the date of birth will automatically calculate the other value."}
              </p>
            </div>
          </SectionCard>

          <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{isBn ? "শিশুর প্রোফাইল ছবি" : "Child Profile Photo"}</DialogTitle>
              </DialogHeader>
              {c.profileImageDataUrl && (
                <img
                  src={c.profileImageDataUrl}
                  alt={isBn ? "শিশুর প্রোফাইল ছবি" : "Child profile photo"}
                  className="max-h-[75vh] w-full rounded-lg object-contain"
                />
              )}
            </DialogContent>
          </Dialog>

          <SectionCard title={isBn ? "ঠিকানা" : "Address"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{isBn ? "বর্তমান ঠিকানা" : "Present Address"}</p>
                <DetailField label={isBn ? "গ্রাম" : "Village"} value={(child as any).presentVillage} />
                <DetailField label={isBn ? "থানা" : "Thana"} value={(child as any).presentThana || (child as any).presentUpazila} />
                <DetailField label={isBn ? "জেলা" : "District"} value={(child as any).presentDistrict} />
                <DetailField label={isBn ? "পূর্ণ ঠিকানা" : "Full Address"} value={(child as any).presentAddress} />
              </div>
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{isBn ? "স্থায়ী ঠিকানা" : "Permanent Address"}</p>
                <DetailField label={isBn ? "গ্রাম" : "Village"} value={(child as any).permanentVillage} />
                <DetailField label={isBn ? "থানা" : "Thana"} value={(child as any).permanentThana || (child as any).permanentUpazila} />
                <DetailField label={isBn ? "জেলা" : "District"} value={(child as any).permanentDistrict} />
                <DetailField label={isBn ? "স্থায়ী ঠিকানা" : "Permanent Address"} value={(child as any).permanentAddress} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title={isBn ? "মৌলিক তথ্য" : "Basic Information"}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DetailField label={isBn ? "কেন্দ্রের নাম" : "Center Name"} value={isBn ? ((child as any).centerNameBn || (child as any).centerName) : (child as any).centerName} />
              <DetailField label={isBn ? "আগমনের তারিখ" : "Arrival Date"} value={(child as any).admissionDate} />
              <DetailField label={isBn ? "জেলা" : "District"} value={(child as any).arrivalDistrict} />
              <DetailField label={isBn ? "কেন্দ্রে অবস্থানের সময়" : "Length of Stay in Center"} value={centerStay} />
              <DetailField label={isBn ? "শিশু আগমনের ধরণ" : "Child Arrival Type"} value={(child as any).legalContext} />
              <DetailField label={isBn ? "শিশুর বিচারিক অবস্থা" : "Judicial Status"} value={(child as any).judicialStatus} />
              <DetailField label={isBn ? "শিশুর শিক্ষাগত যোগ্যতা" : "Educational Qualification"} value={(child as any).educationLevel} />
              <DetailField label={isBn ? "শিশুর সক্ষমতা/দক্ষতা" : "Skills / Capabilities"} value={(child as any).skills} />
              <DetailField label={isBn ? "শিশুর ভবিষ্যৎ লক্ষ্য" : "Future Goal"} value={(child as any).futureGoal} />
              <DetailField label={isBn ? "শিশুর ঝুঁকি" : "Child Risk"} value={(child as any).childRisk ?? latestRisk?.overallRiskLevel} />
              <DetailField label={isBn ? "মৌলিক চাহিদা (খাদ্য, পোশাক, চিকিৎসা এবং ব্যবহার্য সামগ্রী) পূরণ" : "Basic needs fulfilled"} value={formatYesNo((child as any).basicNeedsFulfilled, isBn)} />
              <DetailField label={isBn ? "মৌলিক চাহিদা নোট" : "Basic needs note"} value={(child as any).basicNeedsNote} />
              <DetailField label={isBn ? "নিরাপত্তা নিশ্চিতকরণ" : "Safety ensured"} value={formatYesNo((child as any).safetyEnsured, isBn)} />
              <DetailField label={isBn ? "নিরাপত্তা নোট" : "Safety note"} value={(child as any).safetyEnsuredNote} />
              <DetailField label={isBn ? "প্রাথমিক স্বাস্থ্য পরীক্ষা" : "Initial health check"} value={formatYesNo((child as any).initialHealthCheckCompleted, isBn)} />
              <DetailField label={isBn ? "প্রাথমিক স্বাস্থ্য পরীক্ষা নোট" : "Initial health check note"} value={(child as any).initialHealthCheckNote} />
            </div>
          </SectionCard>

        </TabsContent>

        {/* Cases Tab */}
        <TabsContent value="cases" className="mt-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? "মামলা আইডি" : "Case ID"}</TableHead>
                  <TableHead>{isBn ? "তারিখ" : "Date"}</TableHead>
                  <TableHead>{isBn ? "কেস ওয়ার্কার" : "Case Worker"}</TableHead>
                  <TableHead>{isBn ? "ঝুঁকি" : "Risk"}</TableHead>
                  <TableHead>{isBn ? "অবস্থা" : "Status"}</TableHead>
                  <TableHead>{isBn ? "সারসংক্ষেপ" : "Summary"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!Array.isArray(cases) || cases.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{isBn ? "এই শিশুর কোনো মামলা নেই" : "No cases for this child"}</TableCell></TableRow>
                ) : cases.map((c: any) => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-muted/40" onClick={() => navigate(`/cases/${c.id}`)}>
                    <TableCell className="font-mono text-xs">{c.caseId}</TableCell>
                    <TableCell>{c.caseOpeningDate}</TableCell>
                    <TableCell>{c.assignedCaseWorker || "-"}</TableCell>
                    <TableCell>{c.riskLevel && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${riskColors[c.riskLevel] || ""}`}>{c.riskLevel}</span>}</TableCell>
                    <TableCell>{c.caseStatus}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground text-xs">{c.caseSummary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="mt-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? "আইডি" : "ID"}</TableHead>
                  <TableHead>{isBn ? "তারিখ" : "Date"}</TableHead>
                  <TableHead>{isBn ? "ডাক্তার" : "Doctor"}</TableHead>
                  <TableHead>{isBn ? "শারীরিক অবস্থা" : "Physical Condition"}</TableHead>
                  <TableHead>BMI</TableHead>
                  <TableHead>{isBn ? "রেফারেল" : "Referral"}</TableHead>
                  <TableHead>{isBn ? "আঘাত" : "Injury"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {healthAssessments.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{isBn ? "কোনো স্বাস্থ্য মূল্যায়ন নেই" : "No health assessments"}</TableCell></TableRow>
                ) : healthAssessments.map((a: any) => (
                  <TableRow key={a.id} className="cursor-pointer hover:bg-muted/40" onClick={() => navigate(`/health/${a.id}`)}>
                    <TableCell className="font-mono text-xs">{a.assessmentId}</TableCell>
                    <TableCell>{a.assessmentDate}</TableCell>
                    <TableCell>{a.doctorName || "-"}</TableCell>
                    <TableCell>{a.physicalCondition}</TableCell>
                    <TableCell>{a.bmi?.toFixed(1) ?? "-"}</TableCell>
                    <TableCell>{a.hospitalReferralNeeded ? <span className="text-red-600 text-xs font-medium">{isBn ? "হ্যাঁ" : "Yes"}</span> : (isBn ? "না" : "No")}</TableCell>
                    <TableCell>{a.visibleInjury ? <span className="text-amber-600 text-xs font-medium">{isBn ? "হ্যাঁ" : "Yes"}</span> : (isBn ? "না" : "No")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Counseling Tab */}
        <TabsContent value="counseling" className="mt-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? "সেশন আইডি" : "Session ID"}</TableHead>
                  <TableHead>{isBn ? "তারিখ" : "Date"}</TableHead>
                  <TableHead>{isBn ? "কাউন্সেলর" : "Counselor"}</TableHead>
                  <TableHead>{isBn ? "ধরন" : "Type"}</TableHead>
                  <TableHead>{isBn ? "ফলাফল" : "Outcome"}</TableHead>
                  <TableHead>{isBn ? "পরবর্তী সেশন" : "Next Session"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {counselingSessions.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{isBn ? "কোনো কাউন্সেলিং সেশন নেই" : "No counseling sessions"}</TableCell></TableRow>
                ) : counselingSessions.map((s: any) => (
                  <TableRow key={s.id} className="cursor-pointer hover:bg-muted/40" onClick={() => navigate(`/counseling/${s.id}`)}>
                    <TableCell className="font-mono text-xs">{s.sessionId}</TableCell>
                    <TableCell>{s.sessionDate}</TableCell>
                    <TableCell>{s.counselor || "-"}</TableCell>
                    <TableCell>{s.sessionType}</TableCell>
                    <TableCell>{s.outcome}</TableCell>
                    <TableCell>{s.nextSessionDate || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Risk Tab */}
        <TabsContent value="risk" className="mt-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? "ঝুঁকি আইডি" : "Risk ID"}</TableHead>
                  <TableHead>{isBn ? "তারিখ" : "Date"}</TableHead>
                  <TableHead>{isBn ? "মূল্যায়নকারী" : "Assessor"}</TableHead>
                  <TableHead>{isBn ? "নির্যাতন" : "Abuse"}</TableHead>
                  <TableHead>{isBn ? "পুনরাপরাধ" : "Re-offend"}</TableHead>
                  <TableHead>{isBn ? "সামগ্রিক" : "Overall"}</TableHead>
                  <TableHead>{isBn ? "তাৎক্ষণিক পদক্ষেপ" : "Immediate Action"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskAssessments.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{isBn ? "কোনো ঝুঁকি মূল্যায়ন নেই" : "No risk assessments"}</TableCell></TableRow>
                ) : riskAssessments.map((r: any) => (
                  <TableRow key={r.id} className="cursor-pointer hover:bg-muted/40" onClick={() => navigate(`/risk-assessments/${r.id}`)}>
                    <TableCell className="font-mono text-xs">{r.riskId}</TableCell>
                    <TableCell>{r.assessmentDate}</TableCell>
                    <TableCell>{r.assessedBy || "-"}</TableCell>
                    <TableCell><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${riskColors[r.abuseRisk] || ""}`}>{r.abuseRisk}</span></TableCell>
                    <TableCell><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${riskColors[r.reoffendingRisk] || ""}`}>{r.reoffendingRisk}</span></TableCell>
                    <TableCell><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${riskColors[r.overallRiskLevel] || ""}`}>{r.overallRiskLevel}</span></TableCell>
                    <TableCell>{r.immediateActionRequired ? <span className="text-red-600 font-medium text-xs">{isBn ? "হ্যাঁ" : "Yes"}</span> : (isBn ? "না" : "No")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Admissions Tab */}
        <TabsContent value="admissions" className="mt-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? "ভর্তি আইডি" : "Admission ID"}</TableHead>
                  <TableHead>{isBn ? "তারিখ" : "Date"}</TableHead>
                  <TableHead>{isBn ? "উৎস" : "Source"}</TableHead>
                  <TableHead>{isBn ? "কেন্দ্র" : "Center"}</TableHead>
                  <TableHead>{isBn ? "কর্মকর্তা" : "Officer"}</TableHead>
                  <TableHead>{isBn ? "অবস্থা" : "Status"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admissions.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{isBn ? "কোনো ভর্তি রেকর্ড নেই" : "No admission records"}</TableCell></TableRow>
                ) : admissions.map((a: any) => (
                  <TableRow key={a.id} className="cursor-pointer hover:bg-muted/40" onClick={() => navigate(`/admissions/${a.id}`)}>
                    <TableCell className="font-mono text-xs">{a.admissionId}</TableCell>
                    <TableCell>{a.admissionDate}</TableCell>
                    <TableCell>{a.admissionSource}</TableCell>
                    <TableCell>{a.receivingCenter || "-"}</TableCell>
                    <TableCell>{a.receivingOfficer || "-"}</TableCell>
                    <TableCell>{a.approvalStatus}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="education" className="mt-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? "ভর্তি ফরম আইডি" : "Admission Form ID"}</TableHead>
                  <TableHead>{isBn ? "ভর্তিরযোগ্য শাখা/শ্রেণি" : "Eligible Class / Training"}</TableHead>
                  <TableHead>{isBn ? "কেসওয়ার্কার" : "Case Worker"}</TableHead>
                  <TableHead>{isBn ? "অবস্থা" : "Status"}</TableHead>
                  <TableHead>{isBn ? "তারিখ" : "Date"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {educationAdmissionForms.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{isBn ? "কোনো শিক্ষা ও দক্ষতা রেকর্ড নেই" : "No education and skills records"}</TableCell></TableRow>
                ) : educationAdmissionForms.map((plan: any) => (
                  <TableRow key={plan.id} className="cursor-pointer hover:bg-muted/40" onClick={() => navigate(`/education-skills/${plan.id}`)}>
                    <TableCell className="font-mono text-xs">{plan.planId}</TableCell>
                    <TableCell>{plan.admissionEligibleFor || "-"}</TableCell>
                    <TableCell>{plan.recommenderCaseWorkerName || "-"}</TableCell>
                    <TableCell>{plan.status || "-"}</TableCell>
                    <TableCell>{plan.assessmentDate || plan.startDate || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="family-socioeconomic" className="mt-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isBn ? "রেকর্ড আইডি" : "Record ID"}</TableHead>
                  <TableHead>{isBn ? "পিতা ও মাতার পেশা" : "Parents' Occupation"}</TableHead>
                  <TableHead>{isBn ? "মাসিক আয়" : "Monthly Income"}</TableHead>
                  <TableHead>{isBn ? "অভিভাবকের ধরণ" : "Guardian Type"}</TableHead>
                  <TableHead>{isBn ? "এতিম" : "Orphan"}</TableHead>
                  <TableHead>{isBn ? "বন্ধু/পেয়ার সার্কল" : "Peer Circle"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {familySocioeconomicRecords.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{isBn ? "কোনো পারিবারিক ও আর্থ-সামাজিক তথ্যাদি নেই" : "No family and socioeconomic records"}</TableCell></TableRow>
                ) : familySocioeconomicRecords.map((record: any) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-xs">{record.recordId}</TableCell>
                    <TableCell>{record.parentsOccupation || "-"}</TableCell>
                    <TableCell>{record.parentsMonthlyIncome ?? "-"}</TableCell>
                    <TableCell>{record.guardianType || "-"}</TableCell>
                    <TableCell>{formatYesNo(record.isOrphan, isBn) || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground text-xs">{record.peerCircleInfo || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
