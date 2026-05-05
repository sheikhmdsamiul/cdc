import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useListCases, getListCasesQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { DataTable, type ColumnDef } from "@/components/DataTable";
import { useAuth, hasRole, usePermission } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const RISK_COLOR: Record<string, string> = {
  Low: "bg-green-100 text-green-800", Medium: "bg-amber-100 text-amber-800", High: "bg-red-100 text-red-800",
};
const STATUS_COLOR: Record<string, string> = {
  Open: "bg-blue-100 text-blue-800", Active: "bg-amber-100 text-amber-800",
  Review: "bg-purple-100 text-purple-800", Closed: "bg-gray-100 text-gray-800",
};

export default function CasesList() {
  const { t, i18n } = useTranslation();
  const [, navigate] = useLocation();
  const isBn = i18n.language === "bn";
  const { user } = useAuth();
  const { toast } = useToast();
  const canCreate = usePermission("cases", "create");
  const canEdit   = usePermission("cases", "edit");
  const canDelete = usePermission("cases", "delete");

  const [deleting, setDeleting] = useState<any>(null);
  const { data: cases = [], isLoading } = useListCases({}, { query: { queryKey: getListCasesQueryKey({}) } });
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/cases/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCasesQueryKey({}) }); setDeleting(null); toast({ title: isBn ? "মামলা মুছে ফেলা হয়েছে" : "Case deleted" }); },
  });

  const RISK_LABEL: Record<string, string> = isBn
    ? { Low: "কম", Medium: "মাঝারি", High: "উচ্চ" }
    : { Low: "Low", Medium: "Medium", High: "High" };
  const STATUS_LABEL: Record<string, string> = isBn
    ? { Open: "খোলা", Active: "সক্রিয়", Review: "পর্যালোচনা", Closed: "বন্ধ" }
    : { Open: "Open", Active: "Active", Review: "Review", Closed: "Closed" };

  type Row = (typeof cases)[number];

  const columns: ColumnDef<Row>[] = [
    {
      key: "caseId", label: "Case ID", labelBn: "মামলা আইডি", filterType: "text",
      exportValue: r => r.caseId ?? "",
      render: r => <span className="font-medium text-primary">{r.caseId}</span>,
    },
    {
      key: "childName", label: "Child Name", labelBn: "শিশুর নাম", filterType: "text",
      exportValue: r => (r as any).childName ?? `#${r.childId}`,
      render: r => <span className="font-semibold">{(r as any).childName || `#${r.childId}`}</span>,
    },
    {
      key: "caseOpeningDate", label: "Opening Date", labelBn: "খোলার তারিখ",
      exportValue: r => r.caseOpeningDate ?? "",
      render: r => r.caseOpeningDate ? format(new Date(r.caseOpeningDate), "dd/MM/yyyy") : "—",
    },
    {
      key: "assignedCaseWorker", label: "Case Worker", labelBn: "কেস কর্মী", filterType: "text",
      exportValue: r => r.assignedCaseWorker ?? "",
      render: (r, bn) => r.assignedCaseWorker || (bn ? "নির্ধারিত নেই" : "Unassigned"),
    },
    {
      key: "riskLevel", label: "Risk Level", labelBn: "ঝুঁকির মাত্রা",
      filterType: "select",
      filterOptions: [
        { value: "Low", label: "Low", labelBn: "কম" },
        { value: "Medium", label: "Medium", labelBn: "মাঝারি" },
        { value: "High", label: "High", labelBn: "উচ্চ" },
      ],
      exportValue: r => r.riskLevel ?? "",
      render: r => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${RISK_COLOR[r.riskLevel ?? ""] ?? "bg-gray-100 text-gray-800"}`}>
          {RISK_LABEL[r.riskLevel ?? ""] ?? r.riskLevel ?? "—"}
        </span>
      ),
    },
    {
      key: "caseStatus", label: "Status", labelBn: "অবস্থা",
      filterType: "select",
      filterOptions: [
        { value: "Open", label: "Open", labelBn: "খোলা" },
        { value: "Active", label: "Active", labelBn: "সক্রিয়" },
        { value: "Review", label: "Review", labelBn: "পর্যালোচনা" },
        { value: "Closed", label: "Closed", labelBn: "বন্ধ" },
      ],
      exportValue: r => r.caseStatus ?? "",
      render: r => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[r.caseStatus] ?? "bg-gray-100 text-gray-800"}`}>
          {STATUS_LABEL[r.caseStatus] ?? r.caseStatus}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("cases.title")}</h1>
          <p className="text-muted-foreground">{isBn ? "সক্রিয় ও বন্ধ মামলা পরিচালনা করুন।" : "Manage and track active and closed cases."}</p>
        </div>
        {canCreate && (
          <Link href="/cases/new">
            <Button className="gap-2 bg-[#166534] hover:bg-[#0d4427]"><Plus className="h-4 w-4" /> {t("cases.newCase")}</Button>
          </Link>
        )}
      </div>
      <DataTable
        columns={columns} data={cases} isLoading={isLoading} isBn={isBn}
        exportTitle="Cases" exportTitleBn="মামলার তালিকা"
        emptyText="No cases found." emptyTextBn="কোনো মামলা পাওয়া যায়নি।"
        onRowClick={r => navigate(`/cases/${r.id}`)}
        actions={r => (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            {canEdit && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => navigate(`/cases/${r.id}`)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {canDelete && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleting(r)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {!canEdit && !canDelete && (
              <Link href={`/cases/${r.id}`}><Button variant="ghost" size="sm">{t("common.view")}</Button></Link>
            )}
          </div>
        )}
      />

      {deleting && (
        <Dialog open={!!deleting} onOpenChange={v => { if (!v) setDeleting(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{isBn ? "মামলা মুছুন" : "Delete Case"}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">
              {isBn ? `"${(deleting as any).caseId}" মুছে ফেলতে চান?` : `Delete case "${(deleting as any).caseId}"?`}
            </p>
            <div className="flex gap-2 mt-4">
              <Button variant="destructive" onClick={() => deleteMutation.mutate((deleting as any).id)} disabled={deleteMutation.isPending}>{isBn ? "মুছুন" : "Delete"}</Button>
              <Button variant="outline" onClick={() => setDeleting(null)}>{isBn ? "বাতিল" : "Cancel"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
