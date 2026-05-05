import { useLocation, useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailField, SectionCard } from "@/components/DetailField";

function yesNo(value: boolean | null | undefined, isBn: boolean) {
  if (value == null) return undefined;
  return value ? (isBn ? "হ্যাঁ" : "Yes") : (isBn ? "না" : "No");
}

export default function FamilySocioeconomicDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const recordId = parseInt(id || "0", 10);

  const { data: record, isLoading } = useQuery({
    queryKey: ["family-socioeconomic-record", recordId],
    queryFn: async () => {
      const response = await fetch(`/api/family-socioeconomic-records/${recordId}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load record");
      return response.json();
    },
    enabled: !!recordId,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Home className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{isBn ? "রেকর্ড পাওয়া যায়নি।" : "Record not found."}</p>
        <Button variant="outline" onClick={() => navigate("/family-socioeconomic")}>{isBn ? "তালিকায় ফিরুন" : "Back to List"}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/family-socioeconomic")} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground font-mono">{record.recordId}</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn ? "শিশু: " : "Child: "}
            <Link href={`/children/${record.childId}`} className="text-primary hover:underline font-medium">
              {record.childName || `#${record.childId}`}
            </Link>
          </p>
        </div>
      </div>

      <SectionCard title={isBn ? "পারিবারিক ও আর্থ-সামাজিক তথ্য" : "Family & Socioeconomic Information"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailField label={isBn ? "পিতা মাতার শিক্ষাগত যোগ্যতা" : "Parents' Education"} value={record.parentsEducation} />
          <DetailField label={isBn ? "পিতা ও মাতার পেশা" : "Parents' Occupation"} value={record.parentsOccupation} />
          <DetailField label={isBn ? "পিতা/মাতার মাসিক আয়" : "Parents' Monthly Income"} value={record.parentsMonthlyIncome} />
          <DetailField label={isBn ? "আর্থ-সামাজিক অবস্থান" : "Socioeconomic Status"} value={record.socioeconomicStatus} />
          <DetailField label={isBn ? "পিতা/মাতার সাথে যোগাযোগের নম্বর" : "Parents' Contact Number"} value={record.parentsContactNumber} />
          <DetailField label={isBn ? "পিতা/মাতার সাথে শিশুর সম্পর্ক" : "Child's Relationship with Parents"} value={record.childRelationshipWithParents} />
          <DetailField label={isBn ? "ভাই বোনের সংখ্যা ও শিশুর ক্রম" : "Siblings Count and Child Order"} value={record.siblingsCountAndOrder} />
          <DetailField label={isBn ? "সন্তান সংখ্যা" : "Number of Children"} value={record.childrenCount} />
          <DetailField label={isBn ? "পরিবারের ধরণ" : "Family Type"} value={record.familyType} />
          <DetailField label={isBn ? "পিতা মাতার বৈবাহিক সম্পর্কের অবস্থা" : "Parents' Marital Status"} value={record.parentsMaritalStatus} />
          <DetailField label={isBn ? "শিশুর অভিভাবকের ধরণ" : "Guardian Type"} value={record.guardianType} />
          <DetailField label={isBn ? "শিশু বিবাহিত কি না" : "Is Married"} value={yesNo(record.isMarried, isBn)} />
          <DetailField label={isBn ? "শিশু এতিম কিনা" : "Is Orphan"} value={yesNo(record.isOrphan, isBn)} />
          <DetailField label={isBn ? "পরিবারের কোন সদস্য মাদকাসক্ত কিনা" : "Family Member Has Substance Abuse"} value={yesNo(record.familyMemberSubstanceAbuse, isBn)} />
          <DetailField label={isBn ? "পরিবারের কেউ অপরাধমূলক কাজে যুক্ত কি না" : "Family Member Involved in Crime"} value={yesNo(record.familyCriminalInvolvement, isBn)} />
          <DetailField label={isBn ? "শিশুর বন্ধু/পেয়ার সার্কল সংক্রান্ত তথ্য" : "Friend / Peer Circle Information"} value={record.peerCircleInfo} className="md:col-span-2" />
        </div>
      </SectionCard>
    </div>
  );
}
