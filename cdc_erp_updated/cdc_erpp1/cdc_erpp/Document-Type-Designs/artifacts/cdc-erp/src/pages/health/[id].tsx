import { useParams, useLocation } from "wouter";
import { useGetHealthAssessment, getGetHealthAssessmentQueryKey } from "@workspace/api-client-react";
import { Loader2, ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailField, SectionCard } from "@/components/DetailField";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

const conditionColors: Record<string, string> = {
  Normal: "bg-green-100 text-green-700",
  Weak: "bg-amber-100 text-amber-700",
  Critical: "bg-red-100 text-red-700",
};

export default function HealthDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const assessmentId = parseInt(id || "0", 10);

  const { data: assessment, isLoading } = useGetHealthAssessment(assessmentId, {
    query: { queryKey: getGetHealthAssessmentQueryKey(assessmentId), enabled: !!assessmentId },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Heart className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{isBn ? "স্বাস্থ্য মূল্যায়ন পাওয়া যায়নি।" : "Health assessment not found."}</p>
        <Button variant="outline" onClick={() => navigate("/health")}>{isBn ? "স্বাস্থ্য রেকর্ডে ফিরুন" : "Back to Health Records"}</Button>
      </div>
    );
  }

  const yesNo = (value?: boolean) => {
    if (value == null) return undefined;
    return value ? (isBn ? "হ্যাঁ" : "Yes") : (isBn ? "না" : "No");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/health")} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground font-mono">{assessment.assessmentId}</h1>
            {assessment.physicalCondition && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${conditionColors[assessment.physicalCondition] || "bg-gray-100 text-gray-700"}`}>
                {assessment.physicalCondition}
              </span>
            )}
            {assessment.hospitalReferralNeeded && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">{isBn ? "হাসপাতাল রেফারেল প্রয়োজন" : "Hospital Referral Required"}</span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn ? "শিশু: " : "Child: "}<Link href={`/children/${assessment.childId}`} className="text-primary hover:underline font-medium">{(assessment as any).childName || `#${assessment.childId}`}</Link>
            {" · "}{assessment.assessmentDate}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title={t("health.physicalMeasurements")}>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label={t("health.height")} value={assessment.height} />
            <DetailField label={t("health.weight")} value={assessment.weight} />
            <DetailField label={t("health.bmi")} value={assessment.bmi?.toFixed(2)} />
            <DetailField label={t("health.physicalCondition")} value={assessment.physicalCondition} />
          </div>
        </SectionCard>

        <SectionCard title={t("health.mentalPsychological")}>
          <div className="grid grid-cols-1 gap-4">
            <DetailField label={t("health.mentalCondition")} value={assessment.mentalCondition} />
            <DetailField label={t("health.examiningDoctor")} value={assessment.doctorName} />
          </div>
        </SectionCard>

        <SectionCard title={t("health.injuryHistory")}>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label={t("health.visibleInjury")} value={yesNo(assessment.visibleInjury)} />
            <DetailField label={t("health.injuryDescription")} value={assessment.injuryDescription} />
            <DetailField label={t("health.chronicDisease")} value={assessment.chronicDisease} />
            <DetailField label={t("health.congenitalDiseaseInfo")} value={assessment.congenitalDiseaseInfo} />
            <DetailField label={t("health.hereditaryDiseaseHistory")} value={yesNo(assessment.hasHereditaryDiseaseHistory)} />
            <DetailField label={t("health.hereditaryDiseaseDetails")} value={assessment.hereditaryDiseaseDetails} />
            <DetailField label={t("health.hasDisability")} value={yesNo(assessment.hasDisability)} />
            <DetailField label={t("health.disability")} value={assessment.disability} />
            <DetailField label={t("health.substanceAbuse")} value={yesNo(assessment.substanceAbuse)} />
            <DetailField label={t("health.gbvSurvivor")} value={yesNo(assessment.gbvSurvivor)} />
            <DetailField label={t("health.ongoingMedication")} value={assessment.ongoingMedication} />
          </div>
        </SectionCard>

        <SectionCard title={t("health.treatmentReferral")}>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label={t("health.immediateTreatment")} value={yesNo(assessment.immeditateTreatmentRequired)} />
            <DetailField label={t("health.hospitalReferral")} value={yesNo(assessment.hospitalReferralNeeded)} />
          </div>
          {assessment.recommendation && (
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t("health.recommendation")}</p>
              <p className="text-sm text-foreground leading-relaxed">{assessment.recommendation}</p>
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title={t("timestamps.title")}>
        <div className="grid grid-cols-2 gap-4">
          <DetailField label={t("timestamps.createdAt")} value={assessment.createdAt ? new Date(assessment.createdAt).toLocaleString() : undefined} />
          <DetailField label={t("timestamps.lastUpdated")} value={(assessment as any).updatedAt ? new Date((assessment as any).updatedAt).toLocaleString() : undefined} />
        </div>
      </SectionCard>
    </div>
  );
}
