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
  const [message, setMessage] = useState("");
  const [hearingDate, setHearingDate] = useState("");

  if (!user) return null;

  const role = (user as any).roleName;

  // Determine available actions
  const availableActions: { id: string; labelEn: string; labelBn: string; icon: any; intent: string }[] = [];

  if (role === "Case Worker") {
    if (!currentStatus || currentStatus === "Draft" || currentStatus === "sent_back_to_cw_by_df" || currentStatus === "sent_back_to_cw_by_po") {
      availableActions.push({ id: "submit_to_df", labelEn: "Submit to DF", labelBn: "DF এ পাঠান", icon: Send, intent: "primary" });
    }
  } else if (role === "District Facilitator") {
    if (currentStatus === "submitted_to_df") {
      availableActions.push({ id: "submit_to_po", labelEn: "Forward to PO", labelBn: "PO এ পাঠান", icon: Send, intent: "primary" });
      availableActions.push({ id: "send_back_to_cw_by_df", labelEn: "Send Back to CW", labelBn: "CW কে ফেরত দিন", icon: CornerDownLeft, intent: "warning" });
    }
  } else if (role === "Probation Officer") {
    if (currentStatus === "submitted_to_po") {
      availableActions.push({ id: "submit_to_supt", labelEn: "Forward to Supt", labelBn: "তত্ত্বাবধায়কের কাছে পাঠান", icon: Send, intent: "primary" });
      availableActions.push({ id: "send_back_to_cw_by_po", labelEn: "Send Back to CW", labelBn: "CW কে ফেরত দিন", icon: CornerDownLeft, intent: "warning" });
    }
  } else if (role === "Superintendent" || role === "Center Admin") {
    // Center admin acts as Supt usually or manages them
    if (currentStatus === "submitted_to_supt") {
      availableActions.push({ id: "approve", labelEn: "Approve", labelBn: "অনুমোদন করুন", icon: CheckCircle2, intent: "success" });
      availableActions.push({ id: "reject", labelEn: "Reject", labelBn: "প্রত্যাখ্যান করুন", icon: XCircle, intent: "danger" });
    }
  }

  if (role === "Super Admin" || role === "Admin") {
    if (!currentStatus || currentStatus === "Draft" || currentStatus === "sent_back_to_cw_by_df" || currentStatus === "sent_back_to_cw_by_po") {
      if (!availableActions.some(a => a.id === "submit_to_df")) availableActions.push({ id: "submit_to_df", labelEn: "Submit to DF", labelBn: "DF এ পাঠান", icon: Send, intent: "primary" });
    } else if (currentStatus === "submitted_to_df") {
      if (!availableActions.some(a => a.id === "submit_to_po")) availableActions.push({ id: "submit_to_po", labelEn: "Forward to PO", labelBn: "PO এ পাঠান", icon: Send, intent: "primary" });
      if (!availableActions.some(a => a.id === "send_back_to_cw_by_df")) availableActions.push({ id: "send_back_to_cw_by_df", labelEn: "Send Back to CW", labelBn: "CW কে ফেরত দিন", icon: CornerDownLeft, intent: "warning" });
    } else if (currentStatus === "submitted_to_po") {
      if (!availableActions.some(a => a.id === "submit_to_supt")) availableActions.push({ id: "submit_to_supt", labelEn: "Forward to Supt", labelBn: "তত্ত্বাবধায়কের কাছে পাঠান", icon: Send, intent: "primary" });
      if (!availableActions.some(a => a.id === "send_back_to_cw_by_po")) availableActions.push({ id: "send_back_to_cw_by_po", labelEn: "Send Back to CW", labelBn: "CW কে ফেরত দিন", icon: CornerDownLeft, intent: "warning" });
    } else if (currentStatus === "submitted_to_supt") {
      if (!availableActions.some(a => a.id === "approve")) availableActions.push({ id: "approve", labelEn: "Approve", labelBn: "অনুমোদন করুন", icon: CheckCircle2, intent: "success" });
      if (!availableActions.some(a => a.id === "reject")) availableActions.push({ id: "reject", labelEn: "Reject", labelBn: "প্রত্যাখ্যান করুন", icon: XCircle, intent: "danger" });
    }
  }

  if (availableActions.length === 0) return null;

  const handleAction = async () => {
    if (!dialogAction) return;
    
    const isRejectionOrBack = dialogAction.includes("send_back") || dialogAction === "reject";
    if (isRejectionOrBack && !message.trim()) {
      toast({
        title: isBn ? "ত্রুটি" : "Error",
        description: isBn ? "এই কাজের জন্য মন্তব্য আবশ্যক।" : "A note is required for this action.",
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
          message,
          hearingDate: hearingDate || undefined,
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
      setMessage("");
      setHearingDate("");
      
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
    const isRejectionOrBack = actionId.includes("send_back") || actionId === "reject";
    const actionInfo = availableActions.find(a => a.id === actionId);
    return {
      title: isBn ? actionInfo?.labelBn : actionInfo?.labelEn,
      desc: isRejectionOrBack 
        ? (isBn ? "অনুগ্রহ করে ফেরত বা প্রত্যাখ্যানের কারণ উল্লেখ করুন।" : "Please provide a reason for sending back or rejecting.")
        : (isBn ? "আপনি কি এই কাজটি করতে নিশ্চিত?" : "Are you sure you want to proceed?"),
      btnColor: actionInfo?.intent === "danger" ? "bg-red-600 hover:bg-red-700" : 
                actionInfo?.intent === "warning" ? "bg-orange-500 hover:bg-orange-600" :
                "#166534",
      needsNote: isRejectionOrBack,
      canAddHearingDate: recordType === "court_case" && actionId === "submit_to_po"
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
            {dialogAction && getDialogDetails(dialogAction).canAddHearingDate && (
              <div className="space-y-2">
                <Label>{isBn ? "শুনানির তারিখ (ঐচ্ছিক)" : "Hearing Date (Optional)"}</Label>
                <Input type="date" value={hearingDate} onChange={e => setHearingDate(e.target.value)} />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>
                {isBn ? "মন্তব্য" : "Notes"} 
                {dialogAction && getDialogDetails(dialogAction).needsNote && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Textarea 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                placeholder={isBn ? "আপনার মন্তব্য লিখুন..." : "Type your notes here..."} 
                className="min-h-[100px]"
              />
            </div>
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
