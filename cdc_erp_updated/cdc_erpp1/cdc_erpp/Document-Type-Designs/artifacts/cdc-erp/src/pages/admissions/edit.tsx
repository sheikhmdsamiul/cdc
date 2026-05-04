import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useGetAdmission,
  getGetAdmissionQueryKey,
  useGetChild,
  getGetChildQueryKey,
  useUpdateAdmission,
  useUpdateChild,
  getListAdmissionsQueryKey,
  getListChildrenQueryKey,
} from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Loader2, CalendarDays, CheckCircle2, Image as ImageIcon, AlertCircle, Copy } from "lucide-react";
import { useAuth, hasRole } from "@/contexts/AuthContext";
import { getCenterLabel } from "@/i18n/labels";
import {
  calculateAgeFromDob,
  calculateDobFromAge,
  todayIsoDate,
} from "@/lib/age-dob";
import { MAX_UPLOAD_BYTES, readFileAsDataUrl } from "@/lib/file-data-url";
import { useDivisionData } from "@/hooks/use-division-data";

const formSchema = z.object({
  centerId: z.string().min(1),
  fullName: z.string().min(2),
  motherName: z.string().optional(),
  fatherName: z.string().optional(),
  gender: z.string().optional(),
  admissionSource: z.enum(["court order"]),
  receivingOfficer: z.string().optional(),
  admissionDate: z.string().min(1),
  dateOfBirth: z.string().optional(),
  ageAtAdmission: z.coerce.number().int().min(1).max(25).optional(),
  verifiedDob: z.string().optional(),
  verifiedAge: z.coerce.number().int().min(1).max(25).optional(),
  verifiedAgeDate: z.string().optional(),
  birthRegistrationNo: z.string().optional(),
  birthCertificateFileName: z.string().optional(),
  birthCertificateFileDataUrl: z.string().optional(),
  profileImageFileName: z.string().optional(),
  profileImageDataUrl: z.string().optional(),
  religion: z.string().optional(),
  nationality: z.string().optional(),
  presentDivision: z.string().optional(),
  presentDistrict: z.string().optional(),
  presentUpazila: z.string().optional(),
  presentVillage: z.string().optional(),
  presentAddress: z.string().optional(),
  permanentDivision: z.string().optional(),
  permanentDistrict: z.string().optional(),
  permanentUpazila: z.string().optional(),
  permanentVillage: z.string().optional(),
  permanentAddress: z.string().optional(),
  arrivalDistrict: z.string().optional(),
  legalContext: z.string().optional(),
  judicialStatus: z.string().optional(),
  educationLevel: z.string().optional(),
  skills: z.string().optional(),
  futureGoal: z.string().optional(),
  childRisk: z.string().optional(),
  parentsEducation: z.string().optional(),
  parentsOccupation: z.string().optional(),
  parentsMonthlyIncome: z.coerce.number().int().min(0).optional(),
  socioeconomicStatus: z.string().optional(),
  parentsContactNumber: z.string().optional(),
  childRelationshipWithParents: z.string().optional(),
  siblingsCountAndOrder: z.string().optional(),
  isMarried: z.boolean().default(false),
  childrenCount: z.coerce.number().int().min(0).optional(),
  familyType: z.string().optional(),
  parentsMaritalStatus: z.string().optional(),
  guardianType: z.string().optional(),
  isOrphan: z.boolean().default(false),
  familyMemberSubstanceAbuse: z.boolean().default(false),
  familyCriminalInvolvement: z.boolean().default(false),
  peerCircleInfo: z.string().optional(),
  basicNeedsFulfilled: z.boolean().default(false),
  basicNeedsNote: z.string().optional(),
  safetyEnsured: z.boolean().default(false),
  safetyEnsuredNote: z.string().optional(),
  initialHealthCheckCompleted: z.boolean().default(false),
  initialHealthCheckNote: z.string().optional(),
  courtReferenceNo: z.string().optional(),
  caseType: z.string().optional(),
});

function fetchJson(url: string) {
  return fetch(url, { credentials: "include" }).then((r) => r.json());
}

type CenterLike = { id: number; centerName?: string | null; location?: string | null };

function centerGroup(center?: CenterLike | null): "konabari" | "tongi_or_fulerhat" | "other" {
  const normalized = `${center?.centerName ?? ""} ${center?.location ?? ""}`.toLowerCase();
  if (normalized.includes("konabari")) return "konabari";
  if (normalized.includes("tongi") || normalized.includes("fulerhat") || normalized.includes("jashore")) {
    return "tongi_or_fulerhat";
  }
  return "other";
}

function getCenterGenderError(args: {
  gender?: string;
  center?: CenterLike | null;
  isBypassRole: boolean;
  isBn: boolean;
}) {
  const rawGender = (args.gender ?? "").toLowerCase();
  const gender = rawGender === "male" ? "boy" : rawGender === "female" ? "girl" : rawGender === "other" ? "others" : rawGender;
  // "others" gender can be admitted to any center — no restriction
  if (args.isBypassRole || !gender || gender === "others") return "";

  const group = centerGroup(args.center);
  if (group === "konabari" && gender === "boy") {
    return args.isBn
      ? "কনাবাড়ি কেন্দ্র শুধুমাত্র মেয়েদের জন্য"
      : "Konabari center is for girls only";
  }
  if (group === "tongi_or_fulerhat" && gender === "girl") {
    return args.isBn
      ? "মেয়েদের শুধুমাত্র কনাবাড়ি কেন্দ্রে ভর্তি করা যাবে"
      : "Girls can only be admitted to Konabari center";
  }
  return "";
}

export default function EditAdmissionFullProfile() {
  const { divisionData: DIVISION_DATA } = useDivisionData();
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { user } = useAuth();
  const roleName = user?.roleName ?? "";
  const isDeo = roleName === "Data Entry Operator";
  const isBypassRole = roleName === "Super Admin" || roleName === "Head Office";
  const canChooseAnyCenter = isBypassRole || roleName === "Center Admin";
  const updateChild = useUpdateChild();
  const updateAdmission = useUpdateAdmission();
  const qc = useQueryClient();
  const admissionId = Number(id || 0);
  const [predictedAgeInput, setPredictedAgeInput] = useState("");
  const [verifiedAgeInput, setVerifiedAgeInput] = useState("");
  const { data: centersResp } = useQuery({
    queryKey: ["centers"],
    queryFn: () => fetchJson("/api/centers"),
  });
  const centers = (centersResp?.centers ?? []).filter((center: any) => center.isHq !== "yes");
  const { data: admission } = useGetAdmission(admissionId, { query: { queryKey: getGetAdmissionQueryKey(admissionId), enabled: !!admissionId } });
  const childId = (admission as any)?.childId ? Number((admission as any).childId) : 0;
  const { data: child } = useGetChild(childId, { query: { queryKey: getGetChildQueryKey(childId), enabled: !!childId } });
  const workflowStatus = (admission as any)?.approvalStatus;
  const feedbackText = workflowStatus === "Update Needed by CW"
    ? (admission as any)?.cwFeedback
    : workflowStatus === "Update Needed by PO"
      ? (admission as any)?.poFeedback
      : "";
  const isResubmitState = workflowStatus === "Update Needed by CW" || workflowStatus === "Update Needed by PO";
  const canEditForm = hasRole(user, "Super Admin", "Head Office", "Center Admin", "Data Entry Operator");
  const isReadOnly = !canEditForm;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      centerId: user?.centerId ? String(user.centerId) : "",
      fullName: "",
      admissionSource: "court order",
      receivingOfficer: "",
      admissionDate: todayIsoDate(),
      nationality: isBn ? "বাংলাদেশী" : "Bangladeshi",
      isMarried: false,
      isOrphan: false,
      familyMemberSubstanceAbuse: false,
      familyCriminalInvolvement: false,
      basicNeedsFulfilled: false,
      safetyEnsured: false,
      initialHealthCheckCompleted: false,
    },
  });

  useEffect(() => {
    if (!user?.centerId) return;
    if (isDeo) {
      form.setValue("centerId", String(user.centerId), { shouldDirty: false, shouldValidate: true });
      return;
    }
    if (!form.getValues("centerId")) {
      form.setValue("centerId", String(user.centerId), { shouldDirty: false });
    }
  }, [form, isDeo, user?.centerId]);

  useEffect(() => {
    if (!child || !admission) return;
    const c: any = child;
    const a: any = admission;

    const pDist = c.presentDistrict;
    const derivedPresentDivision = pDist 
      ? DIVISION_DATA.find(div => div.districts.some(d => d.bn === pDist || d.en === pDist))
      : undefined;
    const presentDivisionValue = derivedPresentDivision ? (isBn ? derivedPresentDivision.bn : derivedPresentDivision.en) : "";

    const permDist = c.permanentDistrict;
    const derivedPermanentDivision = permDist
      ? DIVISION_DATA.find(div => div.districts.some(d => d.bn === permDist || d.en === permDist))
      : undefined;
    const permanentDivisionValue = derivedPermanentDivision ? (isBn ? derivedPermanentDivision.bn : derivedPermanentDivision.en) : "";

    form.reset({
      centerId: isDeo
        ? (user?.centerId ? String(user.centerId) : "")
        : (c.centerId != null ? String(c.centerId) : (user?.centerId ? String(user.centerId) : "")),
      fullName: c.fullName ?? "",
      motherName: c.motherName ?? "",
      fatherName: c.fatherName ?? "",
      gender: c.gender ?? "",
      admissionSource: c.admissionSource ?? "court order",
      receivingOfficer: a.receivingOfficer ?? "",
      admissionDate: c.admissionDate ?? "",
      dateOfBirth: c.dateOfBirth ?? "",
      ageAtAdmission: c.ageAtAdmission ?? undefined,
      verifiedDob: c.verifiedDob ?? "",
      verifiedAge: c.verifiedAge ?? undefined,
      verifiedAgeDate: c.verifiedAgeDate ?? "",
      birthRegistrationNo: c.birthRegistrationNo ?? "",
      birthCertificateFileName: c.birthCertificateFileName ?? "",
      birthCertificateFileDataUrl: c.birthCertificateFileDataUrl ?? "",
      profileImageFileName: c.profileImageFileName ?? "",
      profileImageDataUrl: c.profileImageDataUrl ?? "",
      religion: c.religion ?? "",
      nationality: c.nationality ?? "",
      presentDivision: c.presentDivision || presentDivisionValue,
      presentDistrict: c.presentDistrict ?? "",
      presentUpazila: c.presentUpazila ?? "",
      presentVillage: c.presentVillage ?? "",
      presentAddress: c.presentAddress ?? "",
      permanentDivision: c.permanentDivision || permanentDivisionValue,
      permanentDistrict: c.permanentDistrict ?? "",
      permanentUpazila: c.permanentUpazila ?? "",
      permanentVillage: c.permanentVillage ?? "",
      permanentAddress: c.permanentAddress ?? "",
      arrivalDistrict: c.arrivalDistrict ?? "",
      legalContext: c.legalContext ?? "",
      judicialStatus: c.judicialStatus ?? "",
      educationLevel: c.educationLevel ?? "",
      skills: c.skills ?? "",
      futureGoal: c.futureGoal ?? "",
      childRisk: c.childRisk ?? "",
      parentsEducation: c.parentsEducation ?? "",
      parentsOccupation: c.parentsOccupation ?? "",
      parentsMonthlyIncome: c.parentsMonthlyIncome ?? undefined,
      socioeconomicStatus: c.socioeconomicStatus ?? "",
      parentsContactNumber: c.parentsContactNumber ?? "",
      childRelationshipWithParents: c.childRelationshipWithParents ?? "",
      siblingsCountAndOrder: c.siblingsCountAndOrder ?? "",
      isMarried: c.isMarried ?? false,
      childrenCount: c.childrenCount ?? undefined,
      familyType: c.familyType ?? "",
      parentsMaritalStatus: c.parentsMaritalStatus ?? "",
      guardianType: c.guardianType ?? "",
      isOrphan: c.isOrphan ?? false,
      familyMemberSubstanceAbuse: c.familyMemberSubstanceAbuse ?? false,
      familyCriminalInvolvement: c.familyCriminalInvolvement ?? false,
      peerCircleInfo: c.peerCircleInfo ?? "",
      basicNeedsFulfilled: c.basicNeedsFulfilled ?? false,
      basicNeedsNote: c.basicNeedsNote ?? "",
      safetyEnsured: c.safetyEnsured ?? false,
      safetyEnsuredNote: c.safetyEnsuredNote ?? "",
      initialHealthCheckCompleted: c.initialHealthCheckCompleted ?? false,
      initialHealthCheckNote: c.initialHealthCheckNote ?? "",
      courtReferenceNo: c.courtReferenceNo ?? "",
      caseType: c.caseType ?? "",
    });
  }, [admission, child, form, isDeo, user?.centerId]);

  const admissionDate = form.watch("admissionDate");
  const selectedCenterId = form.watch("centerId");
  const selectedGender = form.watch("gender");
  const dateOfBirth = form.watch("dateOfBirth");
  const verifiedDob = form.watch("verifiedDob");
  const birthCertificateFileName = form.watch("birthCertificateFileName");
  const profileImageDataUrl = form.watch("profileImageDataUrl");
  const profileImageFileName = form.watch("profileImageFileName");
  const predictedAge = calculateAgeFromDob(dateOfBirth);
  const verifiedAge = calculateAgeFromDob(verifiedDob);
  const selectedCenter = centers.find((c: CenterLike) => String(c.id) === selectedCenterId);
  const centerGenderError = getCenterGenderError({
    gender: selectedGender,
    center: selectedCenter,
    isBypassRole,
    isBn,
  });
  const normalizedSelectedGender = (() => {
    const value = (selectedGender ?? "").toLowerCase();
    if (value === "male") return "boy";
    if (value === "female") return "girl";
    if (value === "other") return "others";
    return value;
  })();
  const deoInstantError = !centerGenderError
    ? ""
    : (isDeo && centerGroup(selectedCenter) === "konabari" && normalizedSelectedGender !== "girl")
      ? (isBn ? "কনাবাড়ি কেন্দ্র শুধুমাত্র মেয়েদের গ্রহণ করে" : "Konabari only accepts girls")
      : (isDeo && centerGroup(selectedCenter) === "tongi_or_fulerhat" && normalizedSelectedGender === "girl")
        ? (isBn ? "এই কেন্দ্র মেয়ে গ্রহণ করে না" : "This center does not accept girls")
        : centerGenderError;
  const effectiveGenderError = deoInstantError || centerGenderError;

  useEffect(() => {
    setPredictedAgeInput(predictedAge != null ? String(predictedAge) : "");
  }, [predictedAge]);

  useEffect(() => {
    setVerifiedAgeInput(verifiedAge != null ? String(verifiedAge) : "");
  }, [verifiedAge]);

  const presentDivision = form.watch("presentDivision");
  const presentDistrict = form.watch("presentDistrict");
  const presentUpazila = form.watch("presentUpazila");
  const presentVillage = form.watch("presentVillage");

  useEffect(() => {
    const parts = [presentVillage, presentUpazila, presentDistrict, presentDivision].filter(Boolean);
    if (parts.length > 0) {
      form.setValue("presentAddress", parts.join(", "), { shouldDirty: true });
    }
  }, [presentDivision, presentDistrict, presentUpazila, presentVillage, form]);

  const permanentDivision = form.watch("permanentDivision");
  const permanentDistrict = form.watch("permanentDistrict");
  const permanentUpazila = form.watch("permanentUpazila");
  const permanentVillage = form.watch("permanentVillage");

  useEffect(() => {
    const parts = [permanentVillage, permanentUpazila, permanentDistrict, permanentDivision].filter(Boolean);
    if (parts.length > 0) {
      form.setValue("permanentAddress", parts.join(", "), { shouldDirty: true });
    }
  }, [permanentDivision, permanentDistrict, permanentUpazila, permanentVillage, form]);

  useEffect(() => {
    if (!dateOfBirth || !admissionDate) {
      form.setValue("ageAtAdmission", undefined);
      return;
    }

    const nextAgeAtAdmission = calculateAgeFromDob(dateOfBirth, admissionDate);
    form.setValue("ageAtAdmission", nextAgeAtAdmission ?? undefined, { shouldDirty: true });
  }, [admissionDate, dateOfBirth, form]);

  function handlePredictedDobChange(value: string) {
    form.setValue("dateOfBirth", value || undefined, { shouldDirty: true, shouldValidate: true });
    const nextAge = calculateAgeFromDob(value);
    setPredictedAgeInput(nextAge != null ? String(nextAge) : "");
  }

  function handlePredictedAgeChange(value: string) {
    setPredictedAgeInput(value);
    const numericAge = Number.parseInt(value, 10);
    if (!value || Number.isNaN(numericAge) || numericAge < 1) {
      form.setValue("dateOfBirth", undefined, { shouldDirty: true, shouldValidate: true });
      form.setValue("ageAtAdmission", undefined, { shouldDirty: true });
      return;
    }

    const nextDob = calculateDobFromAge(numericAge);
    form.setValue("dateOfBirth", nextDob ?? undefined, { shouldDirty: true, shouldValidate: true });
    const nextAgeAtAdmission = nextDob && admissionDate
      ? calculateAgeFromDob(nextDob, admissionDate)
      : null;
    form.setValue("ageAtAdmission", nextAgeAtAdmission ?? undefined, { shouldDirty: true });
  }

  function handleVerifiedDobChange(value: string) {
    form.setValue("verifiedDob", value || undefined, { shouldDirty: true, shouldValidate: true });
    const nextAge = calculateAgeFromDob(value);
    setVerifiedAgeInput(nextAge != null ? String(nextAge) : "");
    form.setValue("verifiedAge", nextAge ?? undefined, { shouldDirty: true });
    form.setValue("verifiedAgeDate", value ? todayIsoDate() : undefined, { shouldDirty: true });
  }

  function handleVerifiedAgeChange(value: string) {
    setVerifiedAgeInput(value);
    const numericAge = Number.parseInt(value, 10);
    if (!value || Number.isNaN(numericAge) || numericAge < 1) {
      form.setValue("verifiedDob", undefined, { shouldDirty: true, shouldValidate: true });
      form.setValue("verifiedAge", undefined, { shouldDirty: true });
      form.setValue("verifiedAgeDate", undefined, { shouldDirty: true });
      return;
    }

    const nextDob = calculateDobFromAge(numericAge);
    form.setValue("verifiedDob", nextDob ?? undefined, { shouldDirty: true, shouldValidate: true });
    form.setValue("verifiedAge", numericAge, { shouldDirty: true });
    form.setValue("verifiedAgeDate", todayIsoDate(), { shouldDirty: true });
  }

  async function handleBirthCertificateChange(file: File | null) {
    if (!file) {
      form.setValue("birthCertificateFileName", undefined, { shouldDirty: true });
      form.setValue("birthCertificateFileDataUrl", undefined, { shouldDirty: true });
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      form.setValue("birthCertificateFileName", file.name, { shouldDirty: true });
      form.setValue("birthCertificateFileDataUrl", dataUrl, { shouldDirty: true });
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

  async function handleProfileImageChange(file: File | null) {
    if (!file) {
      form.setValue("profileImageFileName", undefined, { shouldDirty: true });
      form.setValue("profileImageDataUrl", undefined, { shouldDirty: true });
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      form.setValue("profileImageFileName", file.name, { shouldDirty: true });
      form.setValue("profileImageDataUrl", dataUrl, { shouldDirty: true });
    } catch {
      toast({
        title: isBn ? "ত্রুটি" : "Error",
        description: isBn
          ? `ছবি আপলোড করা যায়নি। সর্বোচ্চ আকার ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))} MB।`
          : `Failed to upload image. Maximum size is ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`,
        variant: "destructive",
      });
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!admissionId || !childId) {
      toast({
        title: isBn ? "ত্রুটি" : "Error",
        description: isBn ? "ভর্তি রেকর্ড লোড হয়নি।" : "Admission record is not loaded yet.",
        variant: "destructive",
      });
      return;
    }

    if (effectiveGenderError) {
      toast({
        title: isBn ? "ত্রুটি" : "Error",
        description: effectiveGenderError,
        variant: "destructive",
      });
      return;
    }

    const resolvedCenterId = (!canChooseAnyCenter && user?.centerId)
      ? String(user.centerId)
      : values.centerId;
    const payload: any = { ...values, centerId: Number(resolvedCenterId) };
    const selectedCenter = centers.find((c: any) => String(c.id) === resolvedCenterId);

    // Edits are only allowed on draft/send-back records; keep them hidden from Children until final approval.
    payload.currentStatus = "Draft";

    if (!payload.basicNeedsFulfilled) payload.basicNeedsNote = undefined;
    if (!payload.safetyEnsured) payload.safetyEnsuredNote = undefined;
    if (!payload.initialHealthCheckCompleted) payload.initialHealthCheckNote = undefined;

    if (payload.dateOfBirth && payload.admissionDate) {
      payload.ageAtAdmission = calculateAgeFromDob(payload.dateOfBirth, payload.admissionDate) ?? undefined;
    }

    if (payload.verifiedDob) {
      payload.verifiedAge = calculateAgeFromDob(payload.verifiedDob) ?? undefined;
      payload.verifiedAgeDate = todayIsoDate();
    } else {
      delete payload.verifiedAge;
      delete payload.verifiedAgeDate;
    }

    updateChild.mutate({
      id: childId,
      data: payload as any,
    }, {
      onSuccess: () => {
        const admissionPayload = {
          childId,
          admissionDate: values.admissionDate,
          admissionSource: values.admissionSource,
          admissionTime: "",
          centerId: Number(resolvedCenterId),
          receivingOfficer: values.receivingOfficer ?? "",
          approvalStatus: admission?.approvalStatus ?? "Draft",
        };
        updateAdmission.mutate({
          id: admissionId,
          data: admissionPayload as any,
        }, {
          onSuccess: () => {
            qc.invalidateQueries({ queryKey: getGetAdmissionQueryKey(admissionId) });
            qc.invalidateQueries({ queryKey: getGetChildQueryKey(childId) });
            qc.invalidateQueries({ queryKey: getListAdmissionsQueryKey({}) });
            qc.invalidateQueries({ queryKey: getListChildrenQueryKey({}) });
            toast({
              title: isBn ? "সফল" : "Success",
              description: isBn ? "ভর্তি তথ্য আপডেট হয়েছে।" : "Admission data updated.",
            });
            setLocation(`/admissions/${admissionId}`);
          },
          onError: (error: any) => {
            const message = error?.message;
            toast({
              title: isBn ? "ত্রুটি" : "Error",
              description: message || (isBn ? "ভর্তি রেকর্ড আপডেট করতে সমস্যা হয়েছে।" : "Failed to update admission record."),
              variant: "destructive",
            });
          },
        });
      },
      onError: (error: any) => {
        const message = error?.message;
        toast({
          title: isBn ? "ত্রুটি" : "Error",
          description: message || (isBn ? "শিশুর প্রোফাইল আপডেট করতে সমস্যা হয়েছে।" : "Failed to update child profile."),
          variant: "destructive",
        });
      },
    });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isReadOnly
            ? (isBn ? "ভর্তি ফর্ম দেখুন (পূর্ণ শিশু প্রোফাইল)" : "View Admission Form (Full Child Profile)")
            : (isBn ? "ভর্তি সম্পাদনা (পূর্ণ শিশু প্রোফাইল)" : "Edit Admission (Full Child Profile)")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isReadOnly
            ? (isBn ? "CW, PO এবং SUPT এই ফর্মের পূর্ণ তথ্য দেখতে পারবেন।" : "CW, PO, and SUPT can review the complete form here.")
            : (isBn ? "ভর্তি মডিউল থেকেই সম্পূর্ণ শিশু প্রোফাইল তথ্য সম্পাদনা করুন।" : "Edit the complete child profile from Admissions module.")}
        </p>
      </div>

      {feedbackText && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-semibold">
                {workflowStatus === "Update Needed by CW"
                  ? (isBn ? "কেস ওয়ার্কার ফিডব্যাক — যেটি ঠিক করতে হবে" : "Case Worker Feedback — What Needs Fixing")
                  : (isBn ? "প্রবেশন অফিসার ফিডব্যাক — যেটি ঠিক করতে হবে" : "Probation Officer Feedback — What Needs Fixing")}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{feedbackText}</p>
            </div>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className={isReadOnly ? "pointer-events-none opacity-95" : ""}>

          {/* Personal Info */}
          <div className="rounded-xl border bg-card p-5 space-y-5 shadow-sm">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">
              {isBn ? "ব্যক্তিগত তথ্য" : "Personal Information"}
            </h2>

            <div className="grid gap-4 md:grid-cols-[1fr_240px]">
              <div className="space-y-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isBn ? "পূর্ণ নাম *" : "Full Name *"}</FormLabel>
                    <FormControl><Input placeholder={isBn ? "পূর্ণ নাম লিখুন" : "Enter full name"} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="motherName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isBn ? "মাতার নাম" : "Mother's Name"}</FormLabel>
                      <FormControl><Input placeholder={isBn ? "মাতার নাম লিখুন" : "Enter mother's name"} {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="fatherName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isBn ? "পিতার নাম" : "Father's Name"}</FormLabel>
                      <FormControl><Input placeholder={isBn ? "পিতার নাম লিখুন" : "Enter father's name"} {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isBn ? "লিঙ্গ" : "Gender"}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={isBn ? "বেছে নিন" : "Select"} /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Boy">{isBn ? "ছেলে" : "Boy"}</SelectItem>
                          <SelectItem value="Girl">{isBn ? "মেয়ে" : "Girl"}</SelectItem>
                          <SelectItem value="Others">{isBn ? "অন্যান্য" : "Others"}</SelectItem>
                        </SelectContent>
                      </Select>
                      {effectiveGenderError && (
                        <p className="text-sm font-medium text-destructive">{effectiveGenderError}</p>
                      )}
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="religion" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isBn ? "ধর্ম" : "Religion"}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={isBn ? "বেছে নিন" : "Select"} /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="ইসলাম">{isBn ? "ইসলাম" : "Islam"}</SelectItem>
                          <SelectItem value="হিন্দু">{isBn ? "হিন্দু" : "Hinduism"}</SelectItem>
                          <SelectItem value="খ্রিস্টান">{isBn ? "খ্রিস্টান" : "Christianity"}</SelectItem>
                          <SelectItem value="বৌদ্ধ">{isBn ? "বৌদ্ধ" : "Buddhism"}</SelectItem>
                          <SelectItem value="অন্যান্য">{isBn ? "অন্যান্য" : "Other"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="nationality" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isBn ? "জাতীয়তা" : "Nationality"}</FormLabel>
                    <FormControl><Input placeholder={isBn ? "বাংলাদেশী" : "Bangladeshi"} {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>

              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <ImageIcon className="h-4 w-4" />
                  <h3 className="text-sm font-semibold">
                    {isBn ? "শিশুর ছবি" : "Child Photo"}
                  </h3>
                </div>

                <div className="overflow-hidden rounded-lg border bg-white">
                  {profileImageDataUrl ? (
                    <img
                      src={profileImageDataUrl}
                      alt={isBn ? "শিশুর প্রোফাইল ছবি" : "Child profile"}
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-slate-100 text-slate-500">
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-8 w-8" />
                        <p className="mt-2 text-xs">
                          {isBn ? "এখনও কোনো ছবি নেই" : "No image uploaded yet"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {isBn ? "প্রোফাইল ছবি আপলোড" : "Upload Profile Photo"}
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleProfileImageChange(e.target.files?.[0] ?? null)}
                  />
                  <p className="text-xs text-slate-600">
                    {profileImageFileName
                      ? (isBn ? `নির্বাচিত ফাইল: ${profileImageFileName}` : `Selected file: ${profileImageFileName}`)
                      : (isBn ? "JPG, PNG বা WebP ছবি আপলোড করুন।" : "Upload a JPG, PNG, or WebP image.")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Age & DoB Section */}
          <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">
              {isBn ? "জন্ম তথ্য" : "Birth Information"}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <CalendarDays className="h-4 w-4" />
                  <h3 className="text-sm font-semibold">
                    {isBn ? "শিশুর বর্তমান বয়স" : "Current Age Information"}
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {isBn ? "তারিখ" : "Date"}
                  </label>
                  <Input
                    type="date"
                    value={dateOfBirth ?? ""}
                    onChange={(e) => handlePredictedDobChange(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {isBn ? "বয়স" : "Age"}
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={25}
                    placeholder={isBn ? "যেমন: ১৪" : "e.g. 14"}
                    value={predictedAgeInput}
                    onChange={(e) => handlePredictedAgeChange(e.target.value)}
                  />
                </div>

                <p className="text-xs text-blue-700/80">
                  {isBn
                    ? "তারিখ বা বয়স যেকোনো একটি দিন, অন্যটি স্বয়ংক্রিয়ভাবে পূরণ হবে।"
                    : "Enter either the date or age, and the other field will fill automatically."}
                </p>
              </div>

              <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-4 space-y-3">
                <div className="flex items-center gap-2 text-teal-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <h3 className="text-sm font-semibold">
                    {isBn ? "সিডব্লিউ/জন্ম সনদ অনুযায়ী বয়স" : "CW/Birth Certificate Age"}
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {isBn ? "তারিখ" : "Date"}
                  </label>
                  <Input
                    type="date"
                    value={verifiedDob ?? ""}
                    onChange={(e) => handleVerifiedDobChange(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {isBn ? "বয়স" : "Age"}
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={25}
                    placeholder={isBn ? "যেমন: ১৪" : "e.g. 14"}
                    value={verifiedAgeInput}
                    onChange={(e) => handleVerifiedAgeChange(e.target.value)}
                  />
                </div>

                <p className="text-xs text-teal-700/80">
                  {isBn
                    ? "সিডব্লিউ/জন্ম সনদ অনুযায়ী তারিখ বা বয়স লিখলে অন্য ঘরটিও স্বয়ংক্রিয়ভাবে পূরণ হবে।"
                    : "When you enter the CW/birth certificate date or age, the other field is calculated automatically."}
                </p>
              </div>

              <div className="rounded-lg border border-violet-200 bg-violet-50/60 p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-violet-700">
                    {isBn ? "জন্ম নিবন্ধন তথ্য" : "Birth Registration Information"}
                  </h3>
                </div>

                <FormField control={form.control} name="birthRegistrationNo" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isBn ? "জন্ম নিবন্ধন নম্বর" : "Birth Registration No."}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={isBn ? "নম্বর লিখুন" : "Enter registration number"}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                  </FormItem>
                )} />

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {isBn ? "জন্ম সনদ আপলোড" : "Upload Birth Certificate"}
                  </label>
                  <Input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleBirthCertificateChange(e.target.files?.[0] ?? null)}
                  />
                  <p className="text-xs text-violet-700/80">
                    {birthCertificateFileName
                      ? (isBn ? `নির্বাচিত ফাইল: ${birthCertificateFileName}` : `Selected file: ${birthCertificateFileName}`)
                      : (isBn ? "PDF বা ছবি আপলোড করা যাবে।" : "You can upload a PDF or image file.")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address Info */}
          <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">
              {isBn ? "ঠিকানা" : "Address"}
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center h-8">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {isBn ? "বর্তমান ঠিকানা" : "Present Address"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="presentDivision" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isBn ? "বিভাগ" : "Division"}</FormLabel>
                      <Select 
                        onValueChange={(v) => {
                          const division = DIVISION_DATA.find(d => d.id.toString() === v);
                          field.onChange(isBn ? division?.bn : division?.en);
                          form.setValue("presentDistrict", "");
                          form.setValue("presentUpazila", "");
                        }} 
                        value={isBn ? DIVISION_DATA.find(d => d.bn === field.value)?.id.toString() : DIVISION_DATA.find(d => d.en === field.value)?.id.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isBn ? "বিভাগ" : "Division"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DIVISION_DATA.map(d => (
                            <SelectItem key={d.id} value={d.id.toString()}>{isBn ? d.bn : d.en}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="presentDistrict" render={({ field }) => {
                    const divisionName = form.watch("presentDivision");
                    const division = DIVISION_DATA.find(d => (isBn ? d.bn : d.en) === divisionName);
                    const districts = division?.districts ?? [];
                    return (
                      <FormItem>
                        <FormLabel>{isBn ? "জেলা" : "District"}</FormLabel>
                        <Select 
                          key={divisionName || 'present-district'}
                          onValueChange={(v) => {
                            const district = districts.find(d => d.id.toString() === v);
                            field.onChange(isBn ? district?.bn : district?.en);
                            form.setValue("presentUpazila", "");
                          }} 
                          value={isBn ? districts.find(d => d.bn === field.value)?.id.toString() : districts.find(d => d.en === field.value)?.id.toString()}
                          disabled={!divisionName}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isBn ? "জেলা" : "District"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {districts.map(d => (
                              <SelectItem key={d.id} value={d.id.toString()}>{isBn ? d.bn : d.en}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    );
                  }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="presentUpazila" render={({ field }) => {
                    const divisionName = form.watch("presentDivision");
                    const districtName = form.watch("presentDistrict");
                    const division = DIVISION_DATA.find(d => (isBn ? d.bn : d.en) === divisionName);
                    const district = division?.districts.find(d => (isBn ? d.bn : d.en) === districtName);
                    const upazilas = district?.upazilas ?? [];
                    return (
                      <FormItem>
                        <FormLabel>{isBn ? "উপজেলা" : "Upazila"}</FormLabel>
                        <Select key={districtName || 'present-upazila'} onValueChange={field.onChange} value={field.value} disabled={!districtName}>
                          <FormControl><SelectTrigger><SelectValue placeholder={isBn ? "উপজেলা" : "Upazila"} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {upazilas.map(u => {
                              const label = isBn ? (typeof u === 'string' ? u : u.bn) : (typeof u === 'string' ? u : u.en);
                              const val = typeof u === 'string' ? u : (isBn ? u.bn : u.en);
                              return <SelectItem key={val} value={val}>{label}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    );
                  }} />
                  <FormField control={form.control} name="presentVillage" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isBn ? "গ্রাম" : "Village"}</FormLabel>
                      <FormControl><Input placeholder={isBn ? "বর্তমান গ্রামের নাম" : "Present village"} {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="presentAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isBn ? "পূর্ণ ঠিকানা" : "Full Address"}</FormLabel>
                    <FormControl><Textarea className="min-h-[96px]" placeholder={isBn ? "বর্তমান পূর্ণ ঠিকানা লিখুন" : "Enter present full address"} {...field} value={field.value ?? ""} /></FormControl>
                  </FormItem>
                )} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between h-8">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {isBn ? "স্থায়ী ঠিকানা" : "Permanent Address"}
                  </p>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs font-semibold text-primary border-primary/20 hover:bg-primary/10"
                    onClick={() => {
                      form.setValue("permanentDivision", form.watch("presentDivision") || "");
                      form.setValue("permanentDistrict", form.watch("presentDistrict") || "");
                      form.setValue("permanentUpazila", form.watch("presentUpazila") || "");
                      form.setValue("permanentVillage", form.watch("presentVillage") || "");
                      form.setValue("permanentAddress", form.watch("presentAddress") || "");
                    }}
                  >
                    <Copy className="mr-2 h-3 w-3" />
                    {isBn ? "বর্তমান ঠিকানার অনুরূপ" : "Same as present"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="permanentDivision" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isBn ? "বিভাগ" : "Division"}</FormLabel>
                      <Select 
                        onValueChange={(v) => {
                          const division = DIVISION_DATA.find(d => d.id.toString() === v);
                          field.onChange(isBn ? division?.bn : division?.en);
                          form.setValue("permanentDistrict", "");
                          form.setValue("permanentUpazila", "");
                        }} 
                        value={isBn ? DIVISION_DATA.find(d => d.bn === field.value)?.id.toString() : DIVISION_DATA.find(d => d.en === field.value)?.id.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isBn ? "বিভাগ" : "Division"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DIVISION_DATA.map(d => (
                            <SelectItem key={d.id} value={d.id.toString()}>{isBn ? d.bn : d.en}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="permanentDistrict" render={({ field }) => {
                    const divisionName = form.watch("permanentDivision");
                    const division = DIVISION_DATA.find(d => (isBn ? d.bn : d.en) === divisionName);
                    const districts = division?.districts ?? [];
                    return (
                      <FormItem>
                        <FormLabel>{isBn ? "জেলা" : "District"}</FormLabel>
                        <Select 
                          key={divisionName || 'permanent-district'}
                          onValueChange={(v) => {
                            const district = districts.find(d => d.id.toString() === v);
                            field.onChange(isBn ? district?.bn : district?.en);
                            form.setValue("permanentUpazila", "");
                          }} 
                          value={isBn ? districts.find(d => d.bn === field.value)?.id.toString() : districts.find(d => d.en === field.value)?.id.toString()}
                          disabled={!divisionName}
                        >
                          <FormControl><SelectTrigger><SelectValue placeholder={isBn ? "জেলা" : "District"} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {districts.map(d => (
                              <SelectItem key={d.id} value={d.id.toString()}>{isBn ? d.bn : d.en}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    );
                  }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="permanentUpazila" render={({ field }) => {
                    const divisionName = form.watch("permanentDivision");
                    const districtName = form.watch("permanentDistrict");
                    const division = DIVISION_DATA.find(d => (isBn ? d.bn : d.en) === divisionName);
                    const district = division?.districts.find(d => (isBn ? d.bn : d.en) === districtName);
                    const upazilas = district?.upazilas ?? [];
                    return (
                      <FormItem>
                        <FormLabel>{isBn ? "উপজেলা" : "Upazila"}</FormLabel>
                        <Select key={districtName || 'permanent-upazila'} onValueChange={field.onChange} value={field.value} disabled={!districtName}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isBn ? "উপজেলা" : "Upazila"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {upazilas.map(u => {
                              const label = isBn ? (typeof u === 'string' ? u : u.bn) : (typeof u === 'string' ? u : u.en);
                              const val = typeof u === 'string' ? u : (isBn ? u.bn : u.en);
                              return <SelectItem key={val} value={val}>{label}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    );
                  }} />
                  <FormField control={form.control} name="permanentVillage" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isBn ? "গ্রাম" : "Village"}</FormLabel>
                      <FormControl><Input placeholder={isBn ? "স্থায়ী গ্রামের নাম" : "Permanent village"} {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="permanentAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isBn ? "স্থায়ী ঠিকানা" : "Permanent Address"}</FormLabel>
                    <FormControl><Textarea className="min-h-[96px]" placeholder={isBn ? "স্থায়ী ঠিকানা লিখুন" : "Enter permanent address"} {...field} value={field.value ?? ""} /></FormControl>
                  </FormItem>
                )} />
              </div>
            </div>
          </div>

          {/* Admission & Case Info */}
          <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">
              {isBn ? "মৌলিক তথ্য" : "Basic Information"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="centerId" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? "কেন্দ্রের নাম *" : "Center Name *"}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isDeo || isReadOnly}
                  >
                    <FormControl><SelectTrigger><SelectValue placeholder={isBn ? "কেন্দ্র নির্বাচন করুন" : "Select center"} /></SelectTrigger></FormControl>
                    <SelectContent>
                      {centers.map((center: any) => (
                        <SelectItem key={center.id} value={String(center.id)}>
                          {getCenterLabel(center, isBn)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isDeo && (
                    <p className="text-xs text-muted-foreground">
                      {isBn ? "ডিইও ব্যবহারকারীর জন্য কেন্দ্র স্বয়ংক্রিয়ভাবে নির্ধারিত।" : "Receiving Center is auto-assigned for DEO users."}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="admissionDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? "আগমনের তারিখ *" : "Arrival Date *"}</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="legalContext" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? "শিশু আগমনের ধরণ" : "Child Arrival Type"}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Child in Conflict with Law">{isBn ? "আইনের সংঘাতে জড়িত শিশু" : "Child in Conflict with Law"}</SelectItem>
                      <SelectItem value="Child in Contact with Law">{isBn ? "আইনের সংস্পর্শে আসা শিশু" : "Child in Contact with Law"}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="arrivalDistrict" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? "জেলা" : "District"}</FormLabel>
                  <FormControl><Input placeholder={isBn ? "আগমনের জেলা" : "Arrival district"} {...field} value={field.value ?? ""} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="courtReferenceNo" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? "আদালতের রেফারেন্স নং" : "Court Reference No."}</FormLabel>
                  <FormControl><Input placeholder={isBn ? "রেফারেন্স নম্বর লিখুন" : "Enter court reference number"} {...field} value={field.value ?? ""} /></FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="caseType" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? "মামলার ধরন" : "Case Type"}</FormLabel>
                  <FormControl><Input placeholder={isBn ? "মামলার ধরন লিখুন" : "Enter case type"} {...field} value={field.value ?? ""} /></FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="receivingOfficer" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? "গ্রহণকারী কর্মকর্তা" : "Receiving Officer"}</FormLabel>
                  <FormControl><Input placeholder={isBn ? "কর্মকর্তার নাম লিখুন" : "Enter receiving officer name"} {...field} value={field.value ?? ""} /></FormControl>
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="judicialStatus" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? "শিশুর বিচারিক অবস্থা" : "Judicial Status"}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder={isBn ? "বেছে নিন" : "Select"} /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Under Trial">{isBn ? "বিচারাধীন" : "Under Trial"}</SelectItem>
                      <SelectItem value="Sentenced">{isBn ? "সাজাপ্রাপ্ত" : "Sentenced"}</SelectItem>
                      <SelectItem value="Safe Custody">{isBn ? "নিরাপদ হেফাজত" : "Safe Custody"}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="educationLevel" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? "শিশুর শিক্ষাগত যোগ্যতা" : "Educational Qualification"}</FormLabel>
                  <FormControl><Input placeholder={isBn ? "যেমন: পঞ্চম শ্রেণি" : "e.g. Grade 5"} {...field} value={field.value ?? ""} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="childRisk" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? "শিশুর ঝুঁকি" : "Child Risk"}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder={isBn ? "বেছে নিন" : "Select"} /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Low">{isBn ? "কম" : "Low"}</SelectItem>
                      <SelectItem value="Medium">{isBn ? "মাঝারি" : "Medium"}</SelectItem>
                      <SelectItem value="High">{isBn ? "উচ্চ" : "High"}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="skills" render={({ field }) => (
              <FormItem>
                <FormLabel>{isBn ? "শিশুর সক্ষমতা/দক্ষতা" : "Skills / Capabilities"}</FormLabel>
                <FormControl><Textarea className="min-h-[80px]" placeholder={isBn ? "শিশুর দক্ষতা লিখুন" : "Describe the child's skills"} {...field} value={field.value ?? ""} /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="futureGoal" render={({ field }) => (
              <FormItem>
                <FormLabel>{isBn ? "শিশুর ভবিষ্যৎ লক্ষ্য" : "Future Goal"}</FormLabel>
                <FormControl><Textarea className="min-h-[80px]" placeholder={isBn ? "শিশুর ভবিষ্যৎ লক্ষ্য লিখুন" : "Describe the child's future goal"} {...field} value={field.value ?? ""} /></FormControl>
              </FormItem>
            )} />

            <div className="space-y-4 rounded-lg border border-dashed p-4">
              <h3 className="text-sm font-semibold">
                {isBn ? "প্রাথমিক সুরক্ষা ও সেবা" : "Initial Protection and Services"}
              </h3>

              <FormField control={form.control} name="basicNeedsFulfilled" render={({ field }) => (
                <FormItem className="space-y-3 rounded-lg border p-4">
                  <FormLabel>{isBn ? "মৌলিক চাহিদা (খাদ্য, পোশাক, চিকিৎসা এবং ব্যবহার্য সামগ্রী) পূরণ" : "Basic needs fulfilled (food, clothing, treatment, and essential supplies)"}</FormLabel>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={field.value === true} onCheckedChange={() => field.onChange(true)} />
                      <span>{isBn ? "হ্যাঁ" : "Yes"}</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={field.value === false} onCheckedChange={() => field.onChange(false)} />
                      <span>{isBn ? "না" : "No"}</span>
                    </label>
                  </div>
                </FormItem>
              )} />

              <FormField control={form.control} name="basicNeedsNote" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? "নোট" : "Note"}</FormLabel>
                  <FormControl><Textarea className="min-h-[80px]" placeholder={isBn ? "মৌলিক চাহিদা সংক্রান্ত নোট লিখুন" : "Write a note about basic needs"} {...field} value={field.value ?? ""} /></FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="safetyEnsured" render={({ field }) => (
                <FormItem className="space-y-3 rounded-lg border p-4">
                  <FormLabel>{isBn ? "নিরাপত্তা নিশ্চিতকরণ" : "Safety ensured"}</FormLabel>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={field.value === true} onCheckedChange={() => field.onChange(true)} />
                      <span>{isBn ? "হ্যাঁ" : "Yes"}</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={field.value === false} onCheckedChange={() => field.onChange(false)} />
                      <span>{isBn ? "না" : "No"}</span>
                    </label>
                  </div>
                </FormItem>
              )} />

              <FormField control={form.control} name="safetyEnsuredNote" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? "নোট" : "Note"}</FormLabel>
                  <FormControl><Textarea className="min-h-[80px]" placeholder={isBn ? "নিরাপত্তা নিশ্চিতকরণ সংক্রান্ত নোট লিখুন" : "Write a note about safety status"} {...field} value={field.value ?? ""} /></FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="initialHealthCheckCompleted" render={({ field }) => (
                <FormItem className="space-y-3 rounded-lg border p-4">
                  <FormLabel>{isBn ? "প্রাথমিক স্বাস্থ্য পরীক্ষা" : "Initial health check"}</FormLabel>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={field.value === true} onCheckedChange={() => field.onChange(true)} />
                      <span>{isBn ? "হ্যাঁ" : "Yes"}</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={field.value === false} onCheckedChange={() => field.onChange(false)} />
                      <span>{isBn ? "না" : "No"}</span>
                    </label>
                  </div>
                </FormItem>
              )} />

              <FormField control={form.control} name="initialHealthCheckNote" render={({ field }) => (
                <FormItem>
                  <FormLabel>{isBn ? "নোট" : "Note"}</FormLabel>
                  <FormControl><Textarea className="min-h-[80px]" placeholder={isBn ? "প্রাথমিক স্বাস্থ্য পরীক্ষা সংক্রান্ত নোট লিখুন" : "Write a note about the initial health check"} {...field} value={field.value ?? ""} /></FormControl>
                </FormItem>
              )} />
            </div>
          </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setLocation(`/admissions/${admissionId}`)}>
              {isBn ? "ফিরে যান" : "Back"}
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={updateChild.isPending || updateAdmission.isPending || Boolean(effectiveGenderError)}>
                {(updateChild.isPending || updateAdmission.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isResubmitState
                  ? (isBn ? "আপডেট করুন" : "Update & Resubmit")
                  : (isBn ? "ভর্তি আপডেট করুন" : "Update Admission")}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
