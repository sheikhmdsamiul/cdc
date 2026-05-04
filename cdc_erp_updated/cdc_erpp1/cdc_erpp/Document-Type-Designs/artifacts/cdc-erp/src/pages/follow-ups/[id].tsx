import { useParams, useLocation } from "wouter";
import { useGetFollowUp, getGetFollowUpQueryKey } from "@workspace/api-client-react";
import { Loader2, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailField, SectionCard } from "@/components/DetailField";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { getFollowUpVisitTypeLabel } from "@/i18n/labels";

export default function FollowUpDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const followUpId = parseInt(id || "0", 10);

  const { data: followUp, isLoading } = useGetFollowUp(followUpId, {
    query: { queryKey: getGetFollowUpQueryKey(followUpId), enabled: !!followUpId },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!followUp) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Clock className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{isBn ? "ফলো-আপ লগ পাওয়া যায়নি।" : "Follow-up log not found."}</p>
        <Button variant="outline" onClick={() => navigate("/follow-ups")}>{isBn ? "ফলো-আপ তালিকায় ফিরুন" : "Back to Follow-ups"}</Button>
      </div>
    );
  }

  const visitTypeLabel = getFollowUpVisitTypeLabel(followUp.visitType, isBn);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/follow-ups")} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground font-mono">{followUp.followUpId}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${followUp.visitType === "Home" ? "bg-teal-50 text-teal-700" : "bg-blue-50 text-blue-700"}`}>
              {visitTypeLabel}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn ? "শিশু: " : "Child: "}<Link href={`/children/${followUp.childId}`} className="text-primary hover:underline font-medium">{(followUp as any).childName || `#${followUp.childId}`}</Link>
            {" · "}{followUp.followUpDate}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title={t("followUps.followUpDetails")}>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label={t("followUps.followUpId")} value={followUp.followUpId} />
            <DetailField label={t("followUps.followUpDate")} value={followUp.followUpDate} />
            <DetailField label={t("followUps.followUpType")} value={visitTypeLabel} />
          </div>
        </SectionCard>

        <SectionCard title={isBn ? "অনুসন্ধান ও পদক্ষেপ" : "Findings & Actions"}>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t("followUps.observations")}</p>
              <p className="text-sm text-foreground leading-relaxed">{followUp.observation || <span className="text-muted-foreground italic">{isBn ? "কোনো পর্যবেক্ষণ নেই" : "No observation recorded"}</span>}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t("followUps.nextActions")}</p>
              <p className="text-sm text-foreground leading-relaxed">{followUp.nextAction || <span className="text-muted-foreground italic">{isBn ? "পরবর্তী কোনো পদক্ষেপ নির্ধারিত হয়নি" : "No next action defined"}</span>}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title={t("timestamps.title")}>
        <div className="grid grid-cols-2 gap-4">
          <DetailField label={t("timestamps.createdAt")} value={followUp.createdAt ? new Date(followUp.createdAt).toLocaleString() : undefined} />
          <DetailField label={t("timestamps.lastUpdated")} value={(followUp as any).updatedAt ? new Date((followUp as any).updatedAt).toLocaleString() : undefined} />
        </div>
      </SectionCard>
    </div>
  );
}
