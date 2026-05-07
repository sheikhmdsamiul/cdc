import { useParams, useLocation, Link } from "wouter";
import { useGetReleaseRecord, getGetReleaseRecordQueryKey } from "@workspace/api-client-react";
import { Loader2, ArrowLeft, BookOpen, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailField, SectionCard } from "@/components/DetailField";
import { useTranslation } from "react-i18next";
import { useAuth, usePermission } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  "Submitted to PO": "bg-indigo-100 text-indigo-700",
  "Update Needed by CW": "bg-orange-100 text-orange-800",
  "Submitted to SUPT": "bg-purple-100 text-purple-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

type ActionDialog =
  | { action: "update_needed_po"; title: string; placeholder: string; field: "feedback" }
  | { action: "reject"; title: string; placeholder: string; field: "feedback" }
  | null;

export default function ReleaseRecordDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const recordId = parseInt(id || "0", 10);
  const [dialog, setDialog] = useState<ActionDialog>(null);
  const [dialogText, setDialogText] = useState("");

  const canView   = usePermission("release-records", "view");
  const canCreate = usePermission("release-records", "create");
  const canEdit   = usePermission("release-records", "edit");
  const canDelete = usePermission("release-records", "delete");

  const { data: record, isLoading } = useGetReleaseRecord(recordId, {
    query: { queryKey: getGetReleaseRecordQueryKey(recordId), enabled: !!recordId },
  });

  const workflowMutation = useMutation({
    mutationFn: ({ action, feedback }: { action: string; feedback?: string }) =>
      fetch(`/api/release-records/${recordId}/action`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, feedback }),
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json())?.error ?? "Failed");
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetReleaseRecordQueryKey(recordId) });
      qc.invalidateQueries({ queryKey: ["/api/release-records"] });
      setDialog(null);
      setDialogText("");
      toast({ title: isBn ? "ওয়ার্কফ্লো আপডেট হয়েছে" : "Workflow updated" });
    },
    onError: (error: any) => {
      toast({
        title: isBn ? "ত্রুটি" : "Error",
        description: String(error?.message ?? ""),
        variant: "destructive",
      });
    },
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

  const status = record.approvalStatus;
  const role = user?.roleName || "";
  const isAdmin = ["Super Admin", "Head Office", "Center Admin"].includes(role);

  const canSubmitToPo = ["Draft", "Update Needed by CW"].includes(status) && (isAdmin || user?.workflowRole === "CW");
  const canForwardToSupt = (status === "Submitted to PO" || status === "Pending") && (isAdmin || user?.workflowRole === "PO");
  const canUpdateNeededPo = canForwardToSupt;
  const canApprove = status === "Submitted to SUPT" && (isAdmin || user?.workflowRole === "SUPT");
  const canReject = canApprove;

  function submitDialogAction() {
    const text = dialogText.trim();
    if (!dialog) return;
    if (!text) {
      toast({
        title: isBn ? "লেখা প্রয়োজন" : "Text required",
        description: isBn ? "এই কাজের জন্য লেখা আবশ্যক।" : "This action requires text.",
        variant: "destructive",
      });
      return;
    }
    workflowMutation.mutate({ action: dialog.action, feedback: text });
  }

  function openFeedbackDialog(action: "update_needed_po") {
    let title = isBn ? "আপডেট প্রয়োজন" : "Update Needed";
    let placeholder = isBn ? "CW-এর জন্য কী আপডেট দরকার লিখুন" : "Write what Case Worker needs to update";

    setDialog({ action, field: "feedback", title, placeholder });
    setDialogText("");
  }

  function openRejectDialog() {
    setDialog({
      action: "reject",
      field: "feedback",
      title: isBn ? "বাতিলের কারণ লিখুন" : "Enter Rejection Note",
      placeholder: isBn ? "বাতিলের কারণ লিখুন" : "Write the reason for rejection",
    });
    setDialogText("");
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-700"}`}>{status}</span>
            {record.authorityApproval === "Yes" && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">{isBn ? "কর্তৃপক্ষ অনুমোদিত" : "Authority Approved"}</span>
            )}
            {record.authorityApproval === "Reject" && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">{isBn ? "কর্তৃপক্ষ প্রত্যাখ্যাত" : "Authority Rejected"}</span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn ? "শিশু: " : "Child: "}<Link href={`/children/${record.childId}`} className="text-primary hover:underline font-medium">{(record as any).childName || `#${record.childId}`}</Link>
            {isBn ? ` · মুক্তির তারিখ: ${record.releaseDate}` : ` · Released on ${record.releaseDate}`}
          </p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {canSubmitToPo && (
              <Button size="sm" onClick={() => workflowMutation.mutate({ action: "submit_to_po" })}>
                {isBn ? "PO-এ জমা দিন" : "Submit to PO"}
              </Button>
            )}
            {canUpdateNeededPo && (
              <Button size="sm" variant="outline" onClick={() => openFeedbackDialog("update_needed_po")}>
                {isBn ? "আপডেট প্রয়োজন" : "Update Needed"}
              </Button>
            )}
            {canForwardToSupt && (
              <Button size="sm" onClick={() => workflowMutation.mutate({ action: "forward_to_supt" })}>
                {isBn ? "SUPT-এ ফরোয়ার্ড" : "Forward to SUPT"}
              </Button>
            )}
            {canApprove && (
              <Button size="sm" className="bg-[#166534] hover:bg-[#0d4427]" onClick={() => workflowMutation.mutate({ action: "approve" })}>
                {isBn ? "অনুমোদন" : "Approve"}
              </Button>
            )}
            {canReject && (
              <Button size="sm" variant="destructive" onClick={openRejectDialog}>
                {isBn ? "বাতিল" : "Reject"}
              </Button>
            )}
            {canSubmitToPo && (
              <Button size="sm" variant="outline" onClick={() => navigate(`/release-records/${recordId}/edit`)}>
                {isBn ? "সম্পাদনা" : "Edit"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {status === "Update Needed by CW" && (record as any).poFeedback && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-semibold">{isBn ? "প্রবেশন অফিসার ফিডব্যাক — আপডেট প্রয়োজন" : "Probation Officer Feedback — Update Required"}</p>
              <p className="mt-1 text-sm leading-relaxed">{(record as any).poFeedback}</p>
            </div>
          </div>
        </div>
      )}

      {status === "Approved" && record.approvedByName && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-900">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-semibold">
              {isBn ? `অনুমোদন করেছেন ${record.approvedByName}` : `Approved by ${record.approvedByName}`}
            </p>
          </div>
        </div>
      )}

      {status === "Rejected" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-semibold">
                {isBn ? `বাতিল করেছেন ${(record as any).rejectedByName ?? ""}`.trim() : `Rejected by ${(record as any).rejectedByName ?? ""}`.trim()}
              </p>
              {record.rejectionNote && <p className="mt-1 text-sm leading-relaxed">{record.rejectionNote}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title={t("releaseRecords.releaseDetails")}>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label={t("releaseRecords.releaseId")} value={record.releaseId} />
            <DetailField label={t("releaseRecords.releaseDate")} value={record.releaseDate} />
            <DetailField label={t("releaseRecords.releaseType")} value={record.releaseType} />
            <DetailField label={t("releaseRecords.releasedTo")} value={record.handedOverTo} />
            <DetailField label={isBn ? "কর্তৃপক্ষ ও অনুমোদন" : "Authority Approval"} value={record.authorityApproval} />
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

      <Dialog open={!!dialog} onOpenChange={(open) => { if (!open) { setDialog(null); setDialogText(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialog?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={dialogText}
              onChange={(e) => setDialogText(e.target.value)}
              placeholder={dialog?.placeholder}
              className="min-h-[140px]"
            />
            <div className="flex gap-2">
              <Button onClick={submitDialogAction} disabled={workflowMutation.isPending}>
                {isBn ? "সংরক্ষণ করুন" : "Submit"}
              </Button>
              <Button variant="outline" onClick={() => { setDialog(null); setDialogText(""); }}>
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
