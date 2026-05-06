import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, ArrowRight, UserCircle, CornerDownLeft, FileSignature } from "lucide-react";

interface WorkflowLog {
  id: number;
  action: string;
  message: string | null;
  createdAt: string;
  userName: string;
  fullName: string;
}

const actionLabels: Record<string, { en: string; bn: string; icon: any; color: string; bg: string }> = {
  submit_to_df: { en: "Submitted to DF", bn: "DF এ পাঠানো হয়েছে", icon: ArrowRight, color: "text-blue-600", bg: "bg-blue-100" },
  send_back_to_cw_by_df: { en: "Sent back by DF", bn: "DF কর্তৃক ফেরত", icon: CornerDownLeft, color: "text-orange-600", bg: "bg-orange-100" },
  submit_to_po: { en: "Submitted to PO", bn: "PO এ পাঠানো হয়েছে", icon: ArrowRight, color: "text-indigo-600", bg: "bg-indigo-100" },
  send_back_to_cw_by_po: { en: "Sent back by PO", bn: "PO কর্তৃক ফেরত", icon: CornerDownLeft, color: "text-orange-600", bg: "bg-orange-100" },
  submit_to_supt: { en: "Submitted to Supt", bn: "তত্ত্বাবধায়কের কাছে পাঠানো হয়েছে", icon: ArrowRight, color: "text-purple-600", bg: "bg-purple-100" },
  approve: { en: "Approved", bn: "অনুমোদিত", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  reject: { en: "Rejected", bn: "প্রত্যাখ্যাত", icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
};

export function WorkflowTimeline({ recordType, recordId }: { recordType: "case" | "court_case"; recordId: number }) {
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";

  const { data: logs, isLoading } = useQuery<WorkflowLog[]>({
    queryKey: [`/api/workflow/${recordType}/${recordId}/logs`],
    queryFn: async () => {
      const res = await fetch(`/api/workflow/${recordType}/${recordId}/logs`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    }
  });

  if (isLoading) return <div className="p-4 text-center text-sm text-slate-500">{isBn ? "লোড হচ্ছে..." : "Loading timeline..."}</div>;
  if (!logs || logs.length === 0) return <div className="p-4 text-center text-sm text-slate-500">{isBn ? "কোনো লগ পাওয়া যায়নি" : "No workflow logs found"}</div>;

  return (
    <div className="space-y-4 py-4">
      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
        <FileSignature className="h-4 w-4" />
        {isBn ? "অনুমোদনের সময়রেখা" : "Approval Timeline"}
      </h3>
      <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
        {logs.map((log, idx) => {
          const uiInfo = actionLabels[log.action] || { en: log.action, bn: log.action, icon: UserCircle, color: "text-slate-500", bg: "bg-slate-100" };
          const Icon = uiInfo.icon;
          const isApproved = log.action === "approve";
          const isRejected = log.action === "reject";

          return (
            <div key={log.id} className="relative pl-6">
              <span className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full ring-4 ring-white flex items-center justify-center ${uiInfo.bg}`}>
                <Icon className={`h-2.5 w-2.5 ${uiInfo.color}`} />
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">
                    {isBn ? uiInfo.bn : uiInfo.en}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {format(new Date(log.createdAt), "dd MMM yyyy, h:mm a")}
                  </span>
                </div>
                
                {isApproved ? (
                  <p className="text-xs font-semibold text-green-700 mt-0.5">
                    {isBn ? `অনুমোদনকারী: ${log.fullName || log.userName}` : `Approved by: ${log.fullName || log.userName}`}
                  </p>
                ) : isRejected ? (
                  <p className="text-xs font-semibold text-red-700 mt-0.5">
                    {isBn ? `প্রত্যাখ্যানকারী: ${log.fullName || log.userName}` : `Rejected by: ${log.fullName || log.userName}`}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    {isBn ? `কর্তৃক: ${log.fullName || log.userName}` : `By: ${log.fullName || log.userName}`}
                  </p>
                )}

                {log.message && (
                  <div className={`mt-2 p-2.5 rounded-lg text-xs ${isRejected ? "bg-red-50 text-red-800" : "bg-slate-50 text-slate-700"}`}>
                    <span className="font-semibold block mb-1">{isBn ? "মন্তব্য:" : "Note:"}</span>
                    {log.message}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
