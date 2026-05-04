import { useParams, useLocation } from "wouter";
import { useGetRiskAssessment, getGetRiskAssessmentQueryKey } from "@workspace/api-client-react";
import { Loader2, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailField, SectionCard } from "@/components/DetailField";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

const riskColors: Record<string, string> = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-red-100 text-red-700",
};

function RiskBadge({ level, isBn }: { level?: string | null; isBn: boolean }) {
  const RISK_LABEL: Record<string, string> = isBn ? { Low: "কম", Medium: "মাঝারি", High: "উচ্চ" } : { Low: "Low", Medium: "Medium", High: "High" };
  if (!level) return <span className="text-muted-foreground text-sm italic">{isBn ? "নির্ধারিত নয়" : "Not set"}</span>;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${riskColors[level] || "bg-gray-100 text-gray-700"}`}>{RISK_LABEL[level] ?? level}</span>;
}

export default function RiskAssessmentDetail() {
  const mapStatusBn = (s: string) => s === "Draft" ? "খসড়া" : s === "Submitted" ? "দাখিলকৃত" : s === "Reviewed" ? "পর্যালোচিত" : s;
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const assessmentId = parseInt(id || "0", 10);

  const { data: assessment, isLoading } = useGetRiskAssessment(assessmentId, {
    query: { queryKey: getGetRiskAssessmentQueryKey(assessmentId), enabled: !!assessmentId },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <ShieldAlert className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{isBn ? "ঝুঁকি মূল্যায়ন পাওয়া যায়নি।" : "Risk assessment not found."}</p>
        <Button variant="outline" onClick={() => navigate("/risk-assessments")}>{isBn ? "ঝুঁকি মূল্যায়ন তালিকায় ফিরুন" : "Back to Risk Assessments"}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/risk-assessments")} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground font-mono">{assessment.riskId}</h1>
            <RiskBadge level={assessment.overallRiskLevel} isBn={isBn} />
            {assessment.immediateActionRequired && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">{isBn ? "তাৎক্ষণিক পদক্ষেপ প্রয়োজন" : "IMMEDIATE ACTION REQUIRED"}</span>
            )}
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">{assessment.status}</span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn ? "শিশু: " : "Child: "}<Link href={`/children/${assessment.childId}`} className="text-primary hover:underline font-medium">{(assessment as any).childName || `#${assessment.childId}`}</Link>
            {isBn ? ` · মূল্যায়ন: ${assessment.assessmentDate}${assessment.assessedBy ? ` — ${assessment.assessedBy}` : ""}` : ` · Assessed on ${assessment.assessmentDate}${assessment.assessedBy ? ` by ${assessment.assessedBy}` : ""}`}
          </p>
        </div>
      </div>

      <SectionCard title={t("riskAssessments.rehabilitationInfo")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailField label={t("riskAssessments.previousOccupation")} value={(assessment as any).previousOccupation} />
          <DetailField label={t("riskAssessments.childNature")} value={(assessment as any).childNature} />
          <DetailField label={t("riskAssessments.communicationSkill")} value={(assessment as any).communicationSkill} />
          <DetailField label={t("riskAssessments.communicationWithGuardian")} value={(assessment as any).communicationWithGuardian} />
          <DetailField label={t("riskAssessments.educationAndTraining")} value={(assessment as any).educationTrainingInfo} />
          <DetailField label={t("riskAssessments.childCounseling")} value={(assessment as any).childCounselingStatus} />
          <DetailField label={t("riskAssessments.familyCounseling")} value={(assessment as any).familyCounselingStatus} />
          <DetailField label={t("riskAssessments.recreationArrangement")} value={(assessment as any).recreationArrangement} />
          <DetailField label={t("riskAssessments.otherRehabilitation")} value={(assessment as any).otherRehabilitationInfo} />
        </div>
      </SectionCard>

      <SectionCard title={t("riskAssessments.riskMatrix")}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("riskAssessments.abuseRisk")}</p>
            <RiskBadge level={assessment.abuseRisk} isBn={isBn} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("riskAssessments.traffickingRisk")}</p>
            <RiskBadge level={assessment.traffickingRisk} isBn={isBn} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("riskAssessments.reoffendingRisk")}</p>
            <RiskBadge level={assessment.reoffendingRisk} isBn={isBn} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("riskAssessments.selfHarmRisk")}</p>
            <RiskBadge level={assessment.selfHarmRisk} isBn={isBn} />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t("riskAssessments.overallRiskLevel")}</p>
            <RiskBadge level={assessment.overallRiskLevel} isBn={isBn} />
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t("riskAssessments.immediateAction")}</p>
            {assessment.immediateActionRequired
              ? <span className="text-red-600 font-semibold text-sm">{t("riskAssessments.requiredYes")}</span>
              : <span className="text-green-600 font-medium text-sm">{t("riskAssessments.requiredNo")}</span>}
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title={t("riskAssessments.protectionMeasures")}>
          <p className="text-sm text-foreground leading-relaxed">
            {assessment.protectionMeasures || <span className="text-muted-foreground italic">{isBn ? "সুরক্ষা ব্যবস্থা নেই" : "No protection measures recorded"}</span>}
          </p>
        </SectionCard>

        <SectionCard title={t("riskAssessments.assessmentMetadata")}>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label={t("riskAssessments.assessmentDate")} value={assessment.assessmentDate} />
            <DetailField label={t("riskAssessments.assessedBy")} value={assessment.assessedBy} />
            <DetailField label={t("common.status")} value={isBn ? mapStatusBn(assessment.status ?? "") : assessment.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <DetailField label={t("timestamps.createdAt")} value={assessment.createdAt ? new Date(assessment.createdAt).toLocaleString() : undefined} />
            <DetailField label={t("timestamps.lastUpdated")} value={(assessment as any).updatedAt ? new Date((assessment as any).updatedAt).toLocaleString() : undefined} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
