import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetAdmission, getGetAdmissionQueryKey } from "@workspace/api-client-react";
import { Loader2, ArrowLeft, ClipboardList, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailField, SectionCard } from "@/components/DetailField";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth, hasRole, usePermission } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

type ActionDialog =
  | { action: "update_needed_cw" | "update_needed_po"; title: string; placeholder: string; field: "feedback" }
  | { action: "reject"; title: string; placeholder: string; field: "note" }
  | null;

export default function AdmissionDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const admissionId = parseInt(id || "0", 10);
  const [dialog, setDialog] = useState<ActionDialog>(null);
  const [dialogText, setDialogText] = useState("");

  const { data: admission, isLoading } = useGetAdmission(admissionId, {
    query: { queryKey: getGetAdmissionQueryKey(admissionId), enabled: !!admissionId },
  });

  const workflowMutation = useMutation({
    mutationFn: ({ action, feedback, note }: { action: string; feedback?: string; note?: string }) =>
      fetch(`/api/admissions/${admissionId}/action`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, feedback, note }),
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json())?.error ?? "Failed");
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getGetAdmissionQueryKey(admissionId) });
      qc.invalidateQueries({ queryKey: ["/api/admissions"] });
      qc.invalidateQueries({ queryKey: ["/api/children"] });
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

  if (!admission) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <ClipboardList className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{isBn ? "ভর্তি রেকর্ড পাওয়া যায়নি।" : "Admission record not found."}</p>
        <Button variant="outline" onClick={() => navigate("/admissions")}>{isBn ? "ভর্তির তালিকায় ফিরুন" : "Back to Admissions"}</Button>
      </div>
    );
  }

  const canView   = usePermission("admissions", "view");
  const canCreate = usePermission("admissions", "create");
  const canEdit   = usePermission("admissions", "edit");
  const canDelete = usePermission("admissions", "delete");

  const record = admission as any;
  const status = record.approvalStatus;

  // In this workflow, "edit" permission generally covers the review/forward/approve steps.
  // "create" permission covers the initial submission and draft edits.
  const canSubmit = ["Draft", "Update Needed by CW", "Update Needed by PO"].includes(status) && (canCreate || canEdit);
  const canEditProfile = canSubmit;
  const canViewFullForm = canView;
  const canForwardToPo = status === "Submitted to CW" && canEdit;
  const canUpdateNeededCw = canForwardToPo;
  const canForwardToSupt = status === "Submitted to PO" && canEdit;
  const canUpdateNeededPo = canForwardToSupt;
  const canApprove = status === "Submitted to SUPT" && canEdit;
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

    if (dialog.field === "feedback") {
      workflowMutation.mutate({ action: dialog.action, feedback: text });
      return;
    }

    workflowMutation.mutate({ action: dialog.action, note: text });
  }

  function openFeedbackDialog(action: "update_needed_cw" | "update_needed_po") {
    setDialog({
      action,
      field: "feedback",
      title: isBn ? "ফিডব্যাক পাঠান" : "Send Feedback",
      placeholder: isBn ? "DEO-এর জন্য কী আপডেট দরকার লিখুন" : "Write what DEO needs to update",
    });
    setDialogText("");
  }

  function openRejectDialog() {
    setDialog({
      action: "reject",
      field: "note",
      title: isBn ? "বাতিলের কারণ লিখুন" : "Enter Rejection Note",
      placeholder: isBn ? "বাতিলের কারণ লিখুন" : "Write the reason for rejection",
    });
    setDialogText("");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admissions")} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground font-mono">{record.admissionId}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-700"}`}>
              {status}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn ? "শিশু: " : "Child: "}
            <Link href={`/children/${record.childId}`} className="text-primary hover:underline font-medium">
              {record.childName || `#${record.childId}`}
            </Link>
          </p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {canEditProfile && (
              <Button size="sm" variant="outline" onClick={() => navigate(`/admissions/${admissionId}/edit`)}>
                {isBn ? "প্রোফাইল সম্পাদনা" : "Edit Profile"}
              </Button>
            )}
            {!canEditProfile && canViewFullForm && (
              <Button size="sm" variant="outline" onClick={() => navigate(`/admissions/${admissionId}/edit`)}>
                {isBn ? "পূর্ণ ফর্ম দেখুন" : "View Full Form"}
              </Button>
            )}
            {canSubmit && (
              <Button size="sm" onClick={() => workflowMutation.mutate({ action: "submit_to_cw" })}>
                {isBn ? "CW-এ জমা দিন" : "Submit to CW"}
              </Button>
            )}
            {canUpdateNeededCw && (
              <Button size="sm" variant="outline" onClick={() => openFeedbackDialog("update_needed_cw")}>
                {isBn ? "আপডেট প্রয়োজন" : "Update Needed"}
              </Button>
            )}
            {canForwardToPo && (
              <Button size="sm" onClick={() => workflowMutation.mutate({ action: "forward_to_po" })}>
                {isBn ? "PO-এ ফরোয়ার্ড" : "Forward to PO"}
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
          </div>
        </div>
      </div>

      {status === "Update Needed by CW" && record.cwFeedback && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-semibold">{isBn ? "কেস ওয়ার্কার ফিডব্যাক — আপডেট প্রয়োজন" : "Case Worker Feedback — Update Required"}</p>
              <p className="mt-1 text-sm leading-relaxed">{record.cwFeedback}</p>
            </div>
          </div>
        </div>
      )}

      {status === "Update Needed by PO" && record.poFeedback && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div>
              <p className="font-semibold">{isBn ? "প্রবেশন অফিসার ফিডব্যাক — আপডেট প্রয়োজন" : "Probation Officer Feedback — Update Required"}</p>
              <p className="mt-1 text-sm leading-relaxed">{record.poFeedback}</p>
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
                {isBn ? `বাতিল করেছেন ${record.rejectedByName ?? ""}`.trim() : `Rejected by ${record.rejectedByName ?? ""}`.trim()}
              </p>
              {record.rejectionNote && <p className="mt-1 text-sm leading-relaxed">{record.rejectionNote}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title={t("admissions.admissionDetails")}>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label={t("admissions.admissionId")} value={record.admissionId} />
            <DetailField label={t("admissions.admissionDate")} value={record.admissionDate} />
            <DetailField label={isBn ? "ভর্তির সময়" : "Admission Time"} value={record.admissionTime} />
            <DetailField label={isBn ? "ভর্তির উৎস" : "Admission Source"} value={record.admissionSource} />
            <DetailField label={isBn ? "ভর্তির কেন্দ্রের নাম" : "Admission Center Name"} value={isBn ? ((record as any).centerNameBn || (record as any).centerName) : (record as any).centerName} />
            <DetailField label={isBn ? "গ্রহণকারী কর্মকর্তা" : "Receiving Officer"} value={record.receivingOfficer} />
          </div>
        </SectionCard>

        <SectionCard title={t("admissions.verificationApproval")}>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label={isBn ? "নথি যাচাই" : "Documents Verified"} value={record.documentsVerified} />
            <DetailField label={t("admissions.verifiedBy")} value={record.verifiedBy} />
            <DetailField label={isBn ? "যাচাইয়ের তারিখ" : "Verification Date"} value={record.verificationDate} />
            <DetailField label={isBn ? "অনুমোদনের অবস্থা" : "Approval Status"} value={record.approvalStatus} />
            <DetailField label={isBn ? "অনুমোদনকারী (SUPT)" : "Approved By (SUPT)"} value={record.approvedByName} />
          </div>
          {record.authorityRemarks && (
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{isBn ? "কর্তৃপক্ষের মন্তব্য" : "Authority Remarks"}</p>
              <p className="text-sm text-foreground leading-relaxed">{record.authorityRemarks}</p>
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title={t("timestamps.title")}>
        <div className="grid grid-cols-2 gap-4">
          <DetailField label={t("timestamps.createdAt")} value={record.createdAt ? new Date(record.createdAt).toLocaleString() : undefined} />
          <DetailField label={t("timestamps.lastUpdated")} value={record.updatedAt ? new Date(record.updatedAt).toLocaleString() : undefined} />
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
