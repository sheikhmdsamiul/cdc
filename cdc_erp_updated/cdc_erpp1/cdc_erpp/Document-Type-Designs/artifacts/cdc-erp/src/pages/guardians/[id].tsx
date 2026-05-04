import { useParams, useLocation } from "wouter";
import { useGetGuardian, getGetGuardianQueryKey, useListGuardianVisits, getListGuardianVisitsQueryKey } from "@workspace/api-client-react";
import { Loader2, ArrowLeft, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailField, SectionCard } from "@/components/DetailField";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function GuardianDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const guardianId = parseInt(id || "0", 10);

  const { data: guardian, isLoading } = useGetGuardian(guardianId, {
    query: { queryKey: getGetGuardianQueryKey(guardianId), enabled: !!guardianId },
  });
  const { data: visits = [] } = useListGuardianVisits({ guardianId } as any, {
    query: { queryKey: getListGuardianVisitsQueryKey({ guardianId } as any), enabled: !!guardianId },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!guardian) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <UsersRound className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{isBn ? "অভিভাবক পাওয়া যায়নি।" : "Guardian not found."}</p>
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
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{guardian.guardianName}</h1>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700">{guardian.relationship}</span>
          </div>
          <p className="text-muted-foreground text-sm mt-1 font-mono">{guardian.guardianId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title={isBn ? "অভিভাবকের তথ্য" : "Guardian Information"}>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label={t("guardians.guardianId")} value={guardian.guardianId} />
            <DetailField label={t("guardians.guardianName")} value={guardian.guardianName} />
            <DetailField label={t("guardians.relationship")} value={guardian.relationship} />
            <DetailField label={t("guardians.nidNumber")} value={guardian.nidNo} />
            <DetailField label={t("guardians.contactNumber")} value={guardian.contactNumber} />
          </div>
        </SectionCard>

        <SectionCard title={t("guardians.contactInfo")}>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t("guardians.address")}</p>
            <p className="text-sm text-foreground leading-relaxed">{guardian.address || <span className="text-muted-foreground italic">{t("common.notRecorded")}</span>}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <DetailField label={isBn ? "নিবন্ধনের তারিখ" : "Registered"} value={guardian.createdAt ? new Date(guardian.createdAt).toLocaleDateString() : undefined} />
          </div>
        </SectionCard>
      </div>

      <SectionCard title={isBn ? `পরিদর্শনের ইতিহাস (${visits.length})` : `Visit History (${visits.length})`}>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isBn ? "পরিদর্শন আইডি" : "Visit ID"}</TableHead>
                <TableHead>{isBn ? "শিশু" : "Child"}</TableHead>
                <TableHead>{isBn ? "পরিদর্শনের তারিখ" : "Visit Date"}</TableHead>
                <TableHead>{isBn ? "উদ্দেশ্য" : "Purpose"}</TableHead>
                <TableHead>{isBn ? "পর্যবেক্ষণ" : "Observations"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">{t("guardians.noVisits")}</TableCell></TableRow>
              ) : visits.map((v: any) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono text-xs">{v.visitId}</TableCell>
                  <TableCell>
                    <Link href={`/children/${v.childId}`} className="text-primary hover:underline">{v.childName || `#${v.childId}`}</Link>
                  </TableCell>
                  <TableCell>{v.visitDate}</TableCell>
                  <TableCell>{v.purposeOfVisit || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground text-xs">{v.observations || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
