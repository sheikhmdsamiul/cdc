import { useLocation, useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailField, SectionCard } from "@/components/DetailField";

export default function GuardianVisitDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const visitId = parseInt(id || "0", 10);

  const { data: visit, isLoading } = useQuery({
    queryKey: ["guardian-visit", visitId],
    queryFn: async () => {
      const response = await fetch(`/api/guardian-visits/${visitId}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load visit");
      return response.json();
    },
    enabled: !!visitId,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!visit) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <UsersRound className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{isBn ? "পরিদর্শন রেকর্ড পাওয়া যায়নি।" : "Visit record not found."}</p>
        <Button variant="outline" onClick={() => navigate("/guardians")}>{isBn ? "অভিভাবক তালিকায় ফিরুন" : "Back to Guardians"}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/guardians")} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground font-mono">{visit.visitId}</h1>
          <p className="text-muted-foreground text-sm mt-1">{visit.visitDate}</p>
        </div>
      </div>

      <SectionCard title={isBn ? "অভিভাবক পরিদর্শনের বিস্তারিত" : "Guardian Visit Details"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailField label={isBn ? "শিশু" : "Child"} value={visit.childName || `#${visit.childId}`} />
          <DetailField label={isBn ? "অভিভাবক" : "Guardian"} value={visit.guardianName || `#${visit.guardianId}`} />
          <DetailField label={isBn ? "তারিখ" : "Visit Date"} value={visit.visitDate} />
          <DetailField label={isBn ? "উদ্দেশ্য" : "Purpose"} value={visit.purposeOfVisit} />
          <DetailField label={isBn ? "পর্যবেক্ষণ" : "Observations"} value={visit.observations} className="md:col-span-2" />
        </div>
      </SectionCard>

      <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        <span className="font-medium">{isBn ? "শিশুর প্রোফাইল:" : "Child profile:"}</span>{" "}
        <Link href={`/children/${visit.childId}`} className="text-primary hover:underline">{visit.childName || `#${visit.childId}`}</Link>
      </div>
    </div>
  );
}
