import { useParams, useLocation } from "wouter";
import { useGetCounselingSession, getGetCounselingSessionQueryKey } from "@workspace/api-client-react";
import { Loader2, ArrowLeft, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailField, SectionCard } from "@/components/DetailField";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

const outcomeColors: Record<string, string> = {
  Positive: "bg-green-100 text-green-700",
  Neutral: "bg-amber-100 text-amber-700",
  Negative: "bg-red-100 text-red-700",
};

export default function CounselingDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const sessionId = parseInt(id || "0", 10);

  const { data: session, isLoading } = useGetCounselingSession(sessionId, {
    query: { queryKey: getGetCounselingSessionQueryKey(sessionId), enabled: !!sessionId },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Activity className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{isBn ? "কাউন্সেলিং সেশন পাওয়া যায়নি।" : "Counseling session not found."}</p>
        <Button variant="outline" onClick={() => navigate("/counseling")}>{isBn ? "কাউন্সেলিং তালিকায় ফিরুন" : "Back to Counseling"}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/counseling")} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground font-mono">{session.sessionId}</h1>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{session.sessionType}</span>
            {session.outcome && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${outcomeColors[session.outcome] || "bg-gray-100 text-gray-700"}`}>
                {session.outcome}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn ? "শিশু: " : "Child: "}<Link href={`/children/${session.childId}`} className="text-primary hover:underline font-medium">{(session as any).childName || `#${session.childId}`}</Link>
            {" · "}{session.sessionDate}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title={t("counseling.sessionDetails")}>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label={t("counseling.sessionId")} value={session.sessionId} />
            <DetailField label={t("counseling.sessionDate")} value={session.sessionDate} />
            <DetailField label={t("counseling.counselorName")} value={session.counselor} />
            <DetailField label={t("counseling.sessionType")} value={session.sessionType} />
            <DetailField label={t("counseling.sessionOutcome")} value={session.outcome} />
            <DetailField label={t("counseling.nextSessionDate")} value={session.nextSessionDate} />
          </div>
        </SectionCard>

        <SectionCard title={t("counseling.sessionNotes")}>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t("counseling.issuesDiscussed")}</p>
              <p className="text-sm text-foreground leading-relaxed">{session.issuesDiscussed || <span className="text-muted-foreground italic">{t("common.notRecorded")}</span>}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t("counseling.counselorObservations")}</p>
              <p className="text-sm text-foreground leading-relaxed">{session.observations || <span className="text-muted-foreground italic">{t("common.notRecorded")}</span>}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title={t("timestamps.title")}>
        <div className="grid grid-cols-2 gap-4">
          <DetailField label={t("timestamps.createdAt")} value={session.createdAt ? new Date(session.createdAt).toLocaleString() : undefined} />
          <DetailField label={t("timestamps.lastUpdated")} value={(session as any).updatedAt ? new Date((session as any).updatedAt).toLocaleString() : undefined} />
        </div>
      </SectionCard>
    </div>
  );
}
