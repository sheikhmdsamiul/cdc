import { useParams, useLocation } from "wouter";
import { useGetReleaseRecord, getGetReleaseRecordQueryKey } from "@workspace/api-client-react";
import { Loader2, ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailField, SectionCard } from "@/components/DetailField";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function ReleaseRecordDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const recordId = parseInt(id || "0", 10);

  const { data: record, isLoading } = useGetReleaseRecord(recordId, {
    query: { queryKey: getGetReleaseRecordQueryKey(recordId), enabled: !!recordId },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{isBn ? "মুক্তির রেকর্ড পাওয়া যায়নি।" : "Release record not found."}</p>
        <Button variant="outline" onClick={() => navigate("/release-records")}>{isBn ? "মুক্তির রেকর্ড তালিকায় ফিরুন" : "Back to Release Records"}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/release-records")} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground font-mono">{record.releaseId}</h1>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{record.releaseType}</span>
            {record.authorityApproval
              ? <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">{isBn ? "কর্তৃপক্ষ অনুমোদিত" : "Authority Approved"}</span>
              : <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{isBn ? "অনুমোদনের অপেক্ষায়" : "Pending Approval"}</span>
            }
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn ? "শিশু: " : "Child: "}<Link href={`/children/${record.childId}`} className="text-primary hover:underline font-medium">{(record as any).childName || `#${record.childId}`}</Link>
            {isBn ? ` · মুক্তির তারিখ: ${record.releaseDate}` : ` · Released on ${record.releaseDate}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title={t("releaseRecords.releaseDetails")}>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label={t("releaseRecords.releaseId")} value={record.releaseId} />
            <DetailField label={t("releaseRecords.releaseDate")} value={record.releaseDate} />
            <DetailField label={t("releaseRecords.releaseType")} value={record.releaseType} />
            <DetailField label={t("releaseRecords.releasedTo")} value={record.handedOverTo} />
            <DetailField label={t("releaseRecords.authorityApproval")} value={record.authorityApproval} />
          </div>
        </SectionCard>

        <SectionCard title={isBn ? "মন্তব্য ও নোট" : "Remarks & Notes"}>
          <p className="text-sm text-foreground leading-relaxed">
            {record.remarks || <span className="text-muted-foreground italic">{isBn ? "কোনো মন্তব্য নেই" : "No remarks recorded"}</span>}
          </p>
        </SectionCard>
      </div>

      <SectionCard title={t("timestamps.title")}>
        <div className="grid grid-cols-2 gap-4">
          <DetailField label={t("timestamps.createdAt")} value={record.createdAt ? new Date(record.createdAt).toLocaleString() : undefined} />
          <DetailField label={t("timestamps.lastUpdated")} value={(record as any).updatedAt ? new Date((record as any).updatedAt).toLocaleString() : undefined} />
        </div>
      </SectionCard>
    </div>
  );
}
