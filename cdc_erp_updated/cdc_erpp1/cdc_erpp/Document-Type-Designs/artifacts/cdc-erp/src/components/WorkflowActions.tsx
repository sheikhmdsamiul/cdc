import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Send, CornerDownLeft, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface WorkflowActionsProps {
  recordType: "case" | "court_case";
  recordId: number;
  currentStatus: string;
  onSuccess?: () => void;
}

export function WorkflowActions({ recordType, recordId, currentStatus, onSuccess }: WorkflowActionsProps) {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [dialogAction, setDialogAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  if (!user) return null;

  const role = (user as any).roleName;

  // Helper to check if user can do CW actions
  const isCaseWorker = role === "Case Worker" || role === "worker" || role === "Data Entry Operator";
  const isProbationOfficer = role === "Probation Officer";
  const isSuperintendent = role === "Superintendent" || role === "Center Admin";
  const isSuperAdmin = role === "Super Admin" || role === "Head Office";

  // Map status to readable labels
  const statusLabels: Record<string, { en: string; bn: string }> = {
    "Draft": { en: "Draft", bn: "খসড়া" },
    "submitted_to_po": { en: "Forwarded to Probation Officer", bn: "প্রবেশন অফিসারের নিকট প্রেরিত" },
    "reviewed_by_po": { en: "Reviewed by Probation Officer", bn: "প্রবেশন অফিসার পর্যালোচনা করেছেন" },
    "submitted_to_supt": { en: "Forwarded to Superintendent", bn: "সুপারিনটেনডেন্টের নিকট প্রেরিত" },
    "approved": { en: "Approved by Superintendent", bn: "সুপারিনটেনডেন্ট অনুমোদিত" },
    "rejected": { en: "Rejected", bn: "প্রত্যাখ্যানিত" },
    "sent_back_to_cw": { en: "Forwarded to Case Worker (Update Needed)", bn: "কেস ওয়ার্কারের নিকট প্রেরিত (আপডেট প্রয়োজন)" },
  };

  const currentLabel = statusLabels[currentStatus] || { en: currentStatus, bn: currentStatus };

  // Determine available actions based on role and current status
  const availableActions: { id: string; labelEn: string; labelBn: string; icon: any; intent: string }[] = [];

  // Case Worker can submit to PO
  if (isCaseWorker) {
    if (!currentStatus || currentStatus === "Draft" || currentStatus === "sent_back_to_cw") {
      availableActions.push({ 
        id: "submit_to_po", 
        labelEn: "Forward to Probation Officer", 
        labelBn: "প্রবেশন অফিসারের কাছে পাঠান", 
        icon: Send, 
        intent: "primary" 
      });
    }
  }

  // Probation Officer actions
  if (isProbationOfficer) {
    if (currentStatus === "submitted_to_po") {
      availableActions.push({ 
        id: "submit_to_supt", 
        labelEn: "Forward to Superintendent", 
        labelBn: "তত্ত্বাবধায়কের কাছে পাঠান", 
        icon: Send, 
        intent: "primary" 
      });
      availableActions.push({ 
        id: "send_back_to_cw", 
        labelEn: "Update Needed", 
        labelBn: "আপডেট প্রয়োজন", 
        icon: CornerDownLeft, 
        intent: "warning" 
      });
    }
  }

  // Superintendent actions
  if (isSuperintendent) {
    if (currentStatus === "submitted_to_supt") {
      availableActions.push({ 
        id: "approve", 
        labelEn: "Approve", 
        labelBn: "অনুমোদন করুন", 
        icon: CheckCircle2, 
        intent: "success" 
      });
      availableActions.push({ 
        id: "reject", 
        labelEn: "Reject", 
        labelBn: "প্রত্যাখ্যান করুন", 
        icon: XCircle, 
        intent: "danger" 
      });
    }
  }

  // Super Admin has full access for testing
  if (isSuperAdmin) {
    if (!currentStatus || currentStatus === "Draft" || currentStatus === "sent_back_to_cw") {
      availableActions.push({ 
        id: "submit_to_po", 
        labelEn: "Forward to Probation Officer", 
        labelBn: "প্রবেশন অফিসারের কাছে পাঠান", 
        icon: Send, 
        intent: "primary" 
      });
    } else if (currentStatus === "submitted_to_po") {
      availableActions.push({ 
        id: "submit_to_supt", 
        labelEn: "Forward to Supt", 
        labelBn: "তত্ত্বাবধায়কের কাছে পাঠান", 
        icon: Send, 
        intent: "primary" 
      });
      availableActions.push({ 
        id: "send_back_to_cw", 
        labelEn: "Update Needed", 
        labelBn: "আপডেট প্রয়োজন", 
        icon: CornerDownLeft, 
        intent: "warning" 
      });
    } else if (currentStatus === "submitted_to_supt") {
      availableActions.push({ 
        id: "approve", 
        labelEn: "Approve", 
        labelBn: "অনুমোদন করুন", 
        icon: CheckCircle2, 
        intent: "success" 
      });
      availableActions.push({ 
        id: "reject", 
        labelEn: "Reject", 
        labelBn: "প্রত্যাখ্যান করুন", 
        icon: XCircle, 
        intent: "danger" 
      });
    }
  }

  if (availableActions.length === 0) return null;

  const handleAction = async () => {
    if (!dialogAction) return;
    
    const needsFeedback = dialogAction === "send_back_to_cw" || dialogAction === "reject";
    if (needsFeedback && !feedback.trim()) {
      toast({
        title: isBn ? "ত্রুটি" : "Error",
        description: isBn ? "মতামত আবশ্যক।" : "Feedback is required.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/workflow/${recordType}/${recordId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: dialogAction,
          feedback: feedback || undefined,
          message: feedback || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update status");
      }
      
      toast({
        title: isBn ? "সফল" : "Success",
        description: isBn ? "অবস্থা হালনাগাদ হয়েছে" : "Workflow status updated",
      });
      
      setDialogAction(null);
      setFeedback("");
      
      queryClient.invalidateQueries({ queryKey: [`/api/workflow/${recordType}/${recordId}/logs`] });
      
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDialogDetails = (actionId: string) => {
    const needsFeedback = actionId === "send_back_to_cw" || actionId === "reject";
    const actionInfo = availableActions.find(a => a.id === actionId);
    return {
      title: isBn ? actionInfo?.labelBn : actionInfo?.labelEn,
      desc: needsFeedback 
        ? (isBn ? "মতামত দিন যা CW কে জানানো হবে।" : "Provide feedback for the Case Worker.")
        : (isBn ? "আপনি কি এই কাজটি করতে নিশ্চিত?" : "Are you sure you want to proceed?"),
      btnColor: actionInfo?.intent === "danger" ? "bg-red-600 hover:bg-red-700" : 
                actionInfo?.intent === "warning" ? "bg-orange-500 hover:bg-orange-600" :
                "#166534",
      needsFeedback,
    };
  };

  return (
    <div className="flex flex-wrap gap-3 mt-4 border-t pt-4 border-slate-100">
      {availableActions.map(action => {
        const Icon = action.icon;
        const colorClass = 
          action.intent === "primary" ? "text-white border-0" :
          action.intent === "success" ? "text-white border-0" :
          action.intent === "warning" ? "bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-200" :
          "bg-red-100 hover:bg-red-200 text-red-700 border border-red-200";
        const inlineStyle = (action.intent === "primary" || action.intent === "success")
          ? { backgroundColor: "#166534", borderColor: "#166534" } as React.CSSProperties
          : {};

        return (
          <Button
            key={action.id}
            type="button"
            className={`gap-2 ${colorClass}`}
            style={inlineStyle}
            onClick={() => setDialogAction(action.id)}
          >
            <Icon className="h-4 w-4" />
            {isBn ? action.labelBn : action.labelEn}
          </Button>
        );
      })}

      <Dialog open={!!dialogAction} onOpenChange={(open) => !open && setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogAction && getDialogDetails(dialogAction).title}</DialogTitle>
            <DialogDescription>{dialogAction && getDialogDetails(dialogAction).desc}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {dialogAction && getDialogDetails(dialogAction).needsFeedback && (
              <div className="space-y-2">
                <Label>
                  {isBn ? "মতামত" : "Feedback"} 
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Textarea 
                  value={feedback} 
                  onChange={e => setFeedback(e.target.value)} 
                  placeholder={isBn ? "আপনার মতামত লিখুন..." : "Type your feedback here..."} 
                  className="min-h-[100px]"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction(null)} disabled={loading}>
              {isBn ? "বাতিল" : "Cancel"}
            </Button>
            <Button 
              className={dialogAction && (getDialogDetails(dialogAction).btnColor === "#166534") ? "text-white border-0" : (dialogAction ? getDialogDetails(dialogAction).btnColor : "")}
              style={dialogAction && getDialogDetails(dialogAction).btnColor === "#166534" ? { backgroundColor: "#166534", borderColor: "#166534" } : {}}
              onClick={handleAction} 
              disabled={loading}
            >
              {loading ? (isBn ? "অপেক্ষা করুন..." : "Processing...") : (isBn ? "নিশ্চিত করুন" : "Confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}