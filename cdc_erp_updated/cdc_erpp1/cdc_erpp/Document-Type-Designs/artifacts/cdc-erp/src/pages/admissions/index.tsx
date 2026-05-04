import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useListAdmissions, getListAdmissionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/DataTable";
import { useAuth, hasRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  "Submitted to CW": "bg-sky-100 text-sky-700",
  "Update Needed by CW": "bg-orange-100 text-orange-800",
  "Submitted to PO": "bg-indigo-100 text-indigo-700",
  "Update Needed by PO": "bg-orange-100 text-orange-800",
  "Submitted to SUPT": "bg-purple-100 text-purple-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const ADMISSION_SOURCES = ["court order"];
const APPROVAL_STATUSES = [
  "Draft",
  "Submitted to CW",
  "Update Needed by CW",
  "Submitted to PO",
  "Update Needed by PO",
  "Submitted to SUPT",
  "Approved",
  "Rejected",
];

function normalizeAdmissionCenterName(value?: string | null) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  const normalized = text.toLowerCase();
  if (normalized.includes("tongi") || normalized.includes("টঙ্গ")) return "Child Development Center (Boys) Tongi";
  if (normalized.includes("konabari") || normalized.includes("কোনাবা")) return "Child Development Center (Girls) Konabari";
  if (normalized.includes("fulerhat") || normalized.includes("ফুলেরহাট")) return "Child Development Center (Boys) Fulerhat";
  return text;
}

export default function AdmissionsList() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const canEdit = hasRole(user, "Super Admin", "Center Admin", "Data Entry Operator");
  const canDelete = hasRole(user, "Super Admin", "Center Admin");
  const canBulkCascadeDelete = hasRole(user, "Super Admin");
  const [deleting, setDeleting] = useState<any>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data: admissions = [], isLoading } = useListAdmissions(
    {},
    {
      query: {
        queryKey: getListAdmissionsQueryKey({}),
        enabled: !loading && !!user,
        retry: false,
      },
    },
  );
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/admissions/${id}`, { method: "DELETE", credentials: "include" }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListAdmissionsQueryKey({}) });
      setDeleting(null);
      toast({ title: isBn ? "মুছে ফেলা হয়েছে" : "Deleted" });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (admissionIds: number[]) => {
      const response = await fetch("/api/admissions/bulk-delete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admissionIds }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Bulk delete failed");
      }
      return payload;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: getListAdmissionsQueryKey({}) });
      setBulkDeleting(false);
      setSelectedIds([]);
      toast({
        title: isBn ? "বাল্ক মুছে ফেলা সম্পন্ন" : "Bulk delete completed",
        description: isBn
          ? `নির্বাচিত ভর্তি ও সংশ্লিষ্ট শিশুর সব ট্যাবের তথ্য মুছে ফেলা হয়েছে।`
          : "Selected admissions and all related child/tab records were deleted.",
      });
      if ((result?.deleted?.children ?? 0) === 0) {
        toast({
          title: isBn ? "সতর্কতা" : "Warning",
          description: isBn ? "কোনো শিশু রেকর্ড মুছে যায়নি।" : "No child record was deleted.",
          variant: "destructive",
        });
      }
    },
    onError: (err: any) => {
      toast({
        title: isBn ? "বাল্ক মুছে ফেলা ব্যর্থ" : "Bulk delete failed",
        description: err?.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const visible = new Set((admissions ?? []).map((a) => a.id));
    setSelectedIds((prev) => {
      const next = prev.filter((id) => visible.has(id));
      if (next.length !== prev.length) return next;
      return next.every((id, index) => id === prev[index]) ? prev : next;
    });
  }, [admissions]);

  const allVisibleIds = useMemo(() => (admissions ?? []).map((a) => a.id), [admissions]);
  const allSelectedOnPage = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));

  function toggleSelect(id: number, checked: boolean) {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((x) => x !== id);
    });
  }

  const sourceLabel: Record<string, string> = isBn
    ? { "court order": "আদালতের আদেশ" }
    : Object.fromEntries(ADMISSION_SOURCES.map((s) => [s, s]));

  const statusLabel: Record<string, string> = isBn
    ? {
        Draft: "খসড়া",
        "Submitted to CW": "কেস ওয়ার্কারের নিকট প্রেরিত",
        "Update Needed by CW": "কেস ওয়ার্কার আপডেট চেয়েছেন",
        "Submitted to PO": "প্রবেশন অফিসারের নিকট প্রেরিত",
        "Update Needed by PO": "প্রবেশন অফিসার আপডেট চেয়েছেন",
        "Submitted to SUPT": "সুপারিনটেনডেন্টের নিকট প্রেরিত",
        Approved: "সুপারিনটেনডেন্ট অনুমোদিত",
        Rejected: "বাতিল",
      }
    : Object.fromEntries(APPROVAL_STATUSES.map((s) => [s, s]));

  type Row = (typeof admissions)[number];
  const columns: ColumnDef<Row>[] = [
    ...(canBulkCascadeDelete ? [{
      key: "__select",
      label: "",
      labelBn: "",
      filterType: "none" as const,
      exportValue: () => "",
      render: (r: Row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selectedIds.includes(r.id)}
            onCheckedChange={(v) => toggleSelect(r.id, !!v)}
            aria-label="Select admission"
          />
        </div>
      ),
      className: "w-10",
    }] : []),
    {
      key: "admissionId",
      label: "Admission ID",
      labelBn: "ভর্তি আইডি",
      filterType: "text",
      exportValue: (r) => r.admissionId ?? "",
      render: (r) => <span className="font-mono text-xs">{r.admissionId}</span>,
    },
    {
      key: "childName",
      label: "Child Name",
      labelBn: "শিশুর নাম",
      filterType: "text",
      exportValue: (r) => (r as any).childName ?? `#${r.childId}`,
      render: (r) => <span className="font-medium">{(r as any).childName || `#${r.childId}`}</span>,
    },
    {
      key: "admissionDate",
      label: "Admission Date",
      labelBn: "ভর্তির তারিখ",
      exportValue: (r) => r.admissionDate ?? "",
    },
    {
      key: "admissionSource",
      label: "Source",
      labelBn: "উৎস",
      filterType: "select",
      filterOptions: ADMISSION_SOURCES.map((s) => ({ value: s, label: s, labelBn: sourceLabel[s] ?? s })),
      exportValue: (r) => r.admissionSource ?? "",
      render: (r) => sourceLabel[r.admissionSource ?? ""] ?? r.admissionSource ?? "—",
    },
    {
      key: "centerName",
      label: "Center",
      labelBn: "কেন্দ্র",
      exportValue: (r) => isBn ? ((r as any).centerNameBn || (r as any).centerName || "") : ((r as any).centerName || ""),
      render: (r) => isBn ? ((r as any).centerNameBn || (r as any).centerName || "—") : ((r as any).centerName || "—"),
    },
    {
      key: "approvalStatus",
      label: "Status",
      labelBn: "অবস্থা",
      filterType: "select",
      filterOptions: APPROVAL_STATUSES.map((s) => ({ value: s, label: s, labelBn: statusLabel[s] ?? s })),
      exportValue: (r) => r.approvalStatus ?? "",
      render: (r) => {
        const needsAttention = hasRole(user, "Data Entry Operator")
          && ["Update Needed by CW", "Update Needed by PO"].includes(r.approvalStatus ?? "");

        return (
          <span className="inline-flex items-center gap-2">
            {needsAttention && <AlertCircle className="h-4 w-4 text-orange-600" />}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.approvalStatus ?? ""] || "bg-gray-100 text-gray-700"}`}>
              {statusLabel[r.approvalStatus ?? ""] ?? r.approvalStatus}
            </span>
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isBn ? "শিশু গ্রহণ" : "Admissions"}</h1>
         
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            {canBulkCascadeDelete && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSelectedIds(allSelectedOnPage ? [] : allVisibleIds)}
                >
                  {allSelectedOnPage
                    ? (isBn ? "সব আনসিলেক্ট" : "Unselect All")
                    : (isBn ? "সব সিলেক্ট" : "Select All")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedIds([])}
                  disabled={selectedIds.length === 0}
                >
                  {isBn ? "ক্লিয়ার" : "Clear"}
                </Button>
                <Button
                  variant="destructive"
                  disabled={selectedIds.length === 0}
                  onClick={() => setBulkDeleting(true)}
                >
                  {isBn ? `বাল্ক মুছুন (${selectedIds.length})` : `Bulk Delete (${selectedIds.length})`}
                </Button>
              </>
            )}
            <Button className="gap-2" onClick={() => navigate("/admissions/new")}>
              <Plus className="h-4 w-4" />
              {isBn ? "নতুন শিশু" : "New Child"}
            </Button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={admissions}
        isLoading={isLoading}
        isBn={isBn}
        exportTitle="Admissions"
        exportTitleBn="ভর্তির তালিকা "
        emptyText="No admission records found."
        emptyTextBn="কোনো ভর্তির রেকর্ড নেই।"
        onRowClick={(r) => navigate(`/admissions/${r.id}`)}
        actions={canEdit ? (r) => (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => navigate(`/admissions/${r.id}/edit`)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={() => setDeleting(r)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ) : undefined}
      />

      {deleting && (
        <Dialog open={!!deleting} onOpenChange={(v) => { if (!v) setDeleting(null); }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{isBn ? "ভর্তি মুছে ফেলুন" : "Delete Admission"}</DialogTitle>
              <DialogDescription>
                {isBn ? "নির্বাচিত ভর্তি রেকর্ডটি স্থায়ীভাবে মুছে ফেলার নিশ্চিতকরণ।" : "Confirm permanent deletion of the selected admission record."}
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {isBn ? `"${(deleting as any).admissionId}" মুছে ফেলতে চান?` : `Delete "${(deleting as any).admissionId}"?`}
            </p>
            <div className="flex gap-2 mt-4">
              <Button variant="destructive" onClick={() => deleteMutation.mutate((deleting as any).id)} disabled={deleteMutation.isPending}>
                {isBn ? "মুছুন" : "Delete"}
              </Button>
              <Button variant="outline" onClick={() => setDeleting(null)}>
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={bulkDeleting} onOpenChange={setBulkDeleting}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isBn ? "বাল্ক ভর্তি মুছুন" : "Bulk Delete Admissions"}</DialogTitle>
            <DialogDescription>
              {isBn ? "একাধিক ভর্তি রেকর্ড ও সংশ্লিষ্ট তথ্য মুছে ফেলার আগে নিশ্চিতকরণ।" : "Confirm bulk deletion of admissions and their related records."}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {isBn
              ? `নির্বাচিত ${selectedIds.length}টি ভর্তি রেকর্ড মুছলে সংশ্লিষ্ট শিশু, কেস ফাইল এবং অন্যান্য ট্যাবের সব তথ্যও স্থায়ীভাবে মুছে যাবে। আপনি কি নিশ্চিত?`
              : `Deleting ${selectedIds.length} selected admissions will permanently delete related child profile, case file, and all linked tab records. Are you sure?`}
          </p>
          <div className="flex gap-2 mt-4">
            <Button
              variant="destructive"
              disabled={selectedIds.length === 0 || bulkDeleteMutation.isPending}
              onClick={() => bulkDeleteMutation.mutate(selectedIds)}
            >
              {bulkDeleteMutation.isPending
                ? (isBn ? "মুছে ফেলা হচ্ছে..." : "Deleting...")
                : (isBn ? "হ্যাঁ, বাল্ক মুছুন" : "Yes, Bulk Delete")}
            </Button>
            <Button variant="outline" onClick={() => setBulkDeleting(false)}>
              {isBn ? "বাতিল" : "Cancel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
