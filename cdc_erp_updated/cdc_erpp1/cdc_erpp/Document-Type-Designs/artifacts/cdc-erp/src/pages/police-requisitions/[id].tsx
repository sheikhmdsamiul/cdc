import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Printer, Shield, CheckCircle2, Send, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailField, SectionCard } from "@/components/DetailField";
import { Link } from "wouter";
import { useAuth, hasRole, usePermission } from "@/contexts/AuthContext";

const STATUS_COLORS: Record<string, string> = {
  Draft:        "bg-gray-100 text-gray-700",
  Sent:         "bg-blue-100 text-blue-700",
  Acknowledged: "bg-indigo-100 text-indigo-700",
  Fulfilled:    "bg-green-100 text-green-700",
  Cancelled:    "bg-red-100 text-red-700",
};

function PrintableRequisitionLetter({ req, centerName }: { req: any; centerName?: string }) {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";

  return (
    <div id="print-letter" className="hidden print:block font-serif text-black bg-white p-12 min-h-screen">
      <div className="text-center mb-8 space-y-1">
        <p className="text-lg font-bold">{isBn ? "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার" : "Government of the People's Republic of Bangladesh"}</p>
        <p className="text-base font-bold">{isBn ? "সমাজসেবা অধিদফতর" : "Department of Social Services"}</p>
        <p className="text-sm">{centerName || (isBn ? "শিশু উন্নয়ন কেন্দ্র" : "Child Development Center")}</p>
        <div className="border-b-2 border-black mt-2" />
      </div>

      <div className="flex justify-between text-sm mb-6">
        <div>
          <p><strong>{isBn ? "স্মারক নং:" : "Memo No:"}</strong> {req.acquisitionId}</p>
          <p><strong>{isBn ? "তারিখ:" : "Date:"}</strong> {req.requisitionDate || new Date().toLocaleDateString("bn-BD")}</p>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-base font-bold underline">
          {isBn ? "পুলিশ চাহিদাপত্র" : "POLICE REQUISITION LETTER"}
        </p>
        <p className="text-sm mt-1">
          {isBn ? "আদালতে শিশু প্রেরণের জন্য পুলিশ সহায়তার অনুরোধ" : "Request for Police Assistance for Child Court Escort"}
        </p>
      </div>

      <div className="mb-4">
        <p className="text-sm"><strong>{isBn ? "বরাবর," : "To,"}</strong></p>
        <p className="text-sm">{isBn ? "ভারপ্রাপ্ত কর্মকর্তা," : "Officer-in-Charge,"}</p>
        <p className="text-sm font-semibold">{req.policeStation || "_______________"} {isBn ? "থানা" : "Police Station"}</p>
      </div>

      <div className="mb-6 text-sm leading-7">
        <p>{isBn ? "বিষয়:" : "Subject:"} <strong>{isBn ? "আদালত শুনানিতে শিশু প্রেরণের জন্য পুলিশ সহায়তার অনুরোধ।" : "Request for police escort to bring child to court hearing."}</strong></p>
        <p className="mt-4">
          {isBn
            ? `মহোদয়, আদালতের আদেশে এই কেন্দ্রে আটক শিশু `
            : `Sir, The child currently under detention at this center, namely `}
          <strong>{req.childName || "___"}</strong>
          {isBn
            ? ` কে আগামী ${req.hearingDate} তারিখে ${req.courtName || "___"} আদালতে শুনানির জন্য উপস্থিত করতে হবে।`
            : ` is required to appear before the ${req.courtName || "___"} court for hearing on ${req.hearingDate}.`}
        </p>
        <p className="mt-2">
          {isBn
            ? `মামলা নম্বর: ${req.caseNumber || "___"}। উক্ত শিশুকে আদালতে নিয়ে যাওয়ার জন্য ${req.officersRequired} জন পুলিশ কর্মকর্তার সহায়তা প্রদানের অনুরোধ জানাচ্ছি।`
            : `Case No.: ${req.caseNumber || "___"}. We kindly request the assistance of ${req.officersRequired} police officer(s) for the escort.`}
        </p>
        {req.escortDepartureTime && (
          <p className="mt-2">
            {isBn
              ? `সকাল/বিকাল ${req.escortDepartureTime} ঘটিকায় রওনা দেওয়ার পরিকল্পনা রয়েছে।`
              : `Planned escort departure time: ${req.escortDepartureTime}.`}
          </p>
        )}
        {req.remarks && <p className="mt-2">{isBn ? "বিশেষ নির্দেশনা:" : "Special instructions:"} {req.remarks}</p>}
        <p className="mt-4">{isBn ? "আপনার সহযোগিতার জন্য ধন্যবাদ।" : "Your cooperation in this matter is greatly appreciated."}</p>
      </div>

      <div className="mt-16 flex justify-between text-sm">
        <div className="text-center">
          <div className="border-t border-black pt-1 w-40">
            <p>{isBn ? "কর্মকর্তার স্বাক্ষর" : "Officer's Signature"}</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-black pt-1 w-40">
            <p>{isBn ? "সুপারিনটেনডেন্ট" : "Superintendent"}</p>
            <p className="text-xs text-muted-foreground">{centerName || "CDC"}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 text-xs text-gray-500 border-t pt-2">
        <p>{isBn ? "এই চাহিদাপত্র সিডিসি ইআরপি সিস্টেম দ্বারা স্বয়ংক্রিয়ভাবে তৈরি।" : "This letter was auto-generated by the CDC ERP System."}</p>
        <p>Requisition ID: {req.acquisitionId} | Generated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

function StatusActions({ req, onUpdate }: { req: any; onUpdate: () => void }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isBn = i18n.language === "bn";
  const [loading, setLoading] = useState(false);
  const [ackRef, setAckRef] = useState("");
  const [officerName, setOfficerName] = useState(req.policeOfficerName || "");

  const canEdit = usePermission("police-requisitions", "edit");
  const canChangeStatus = canEdit;

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      await fetch(`/api/police-acquisitions/${req.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, acknowledgementRef: ackRef || undefined, policeOfficerName: officerName || undefined }),
      });
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  if (!canChangeStatus) return null;

  return (
    <div className="space-y-3">
      {(req.status === "Sent" || req.status === "Draft") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{t("policeRequisitions.acknowledgementRef")}</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={ackRef}
              onChange={e => setAckRef(e.target.value)}
              placeholder={isBn ? "স্বীকৃতি নং (ঐচ্ছিক)" : "Acknowledgement no. (optional)"}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{t("policeRequisitions.policeOfficerName")}</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={officerName}
              onChange={e => setOfficerName(e.target.value)}
              placeholder={isBn ? "পুলিশ কর্মকর্তার নাম" : "Police officer's name"}
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {req.status === "Draft" && (
          <Button size="sm" className="gap-1.5" disabled={loading} onClick={() => updateStatus("Sent")}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {t("policeRequisitions.markAsSent")}
          </Button>
        )}
        {(req.status === "Sent" || req.status === "Acknowledged") && (
          <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700" disabled={loading} onClick={() => updateStatus("Fulfilled")}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            {t("policeRequisitions.markAsFulfilled")}
          </Button>
        )}
        {req.status === "Sent" && (
          <Button size="sm" variant="outline" disabled={loading} onClick={() => updateStatus("Acknowledged")}>
            {isBn ? "স্বীকৃত হিসেবে চিহ্নিত করুন" : "Mark as Acknowledged"}
          </Button>
        )}
        {req.status !== "Cancelled" && req.status !== "Fulfilled" && (
          <Button size="sm" variant="destructive" className="gap-1.5" disabled={loading} onClick={() => updateStatus("Cancelled")}>
            <XCircle className="h-3.5 w-3.5" />
            {t("policeRequisitions.cancel")}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function PoliceRequisitionDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const reqId = parseInt(id || "0", 10);

  const { data: req, isLoading } = useQuery({
    queryKey: ["police-requisition", reqId],
    queryFn: () => fetch(`/api/police-acquisitions/${reqId}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!reqId,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["police-requisition", reqId] });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!req || req.error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{t("common.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/police-requisitions")}>{t("common.back")}</Button>
      </div>
    );
  }

  const daysUntilHearing = req.hearingDate
    ? Math.ceil((new Date(req.hearingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      <PrintableRequisitionLetter req={req} centerName={user?.centerName ?? undefined} />

      <div className="print:hidden flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/police-requisitions")} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold font-mono">{req.acquisitionId}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[req.status] || "bg-gray-100 text-gray-600"}`}>
              {t(`policeRequisitions.statuses.${req.status}` as any) || req.status}
            </span>
            {daysUntilHearing !== null && daysUntilHearing >= 0 && daysUntilHearing <= 3 && req.status !== "Fulfilled" && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                {daysUntilHearing === 0 ? "Today!" : `${daysUntilHearing}d`}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t("policeRequisitions.child")}:{" "}
            <Link href={`/children/${req.childId}`} className="text-primary hover:underline font-medium">
              {req.childName || `#${req.childId}`}
            </Link>
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 print:hidden" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          {t("policeRequisitions.printLetter")}
        </Button>
      </div>

      <div className="print:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title={t("policeRequisitions.courtHearingInfo")}>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label={t("policeRequisitions.hearingDate")} value={req.hearingDate} />
            <DetailField label={t("policeRequisitions.courtName")} value={req.courtName} />
            <DetailField label={t("policeRequisitions.caseNumber")} value={req.caseNumber} />
            <DetailField label={t("policeRequisitions.escortDepartureTime")} value={req.escortDepartureTime} />
            <DetailField label={t("policeRequisitions.requisitionDate")} value={req.requisitionDate} />
          </div>
        </SectionCard>

        <SectionCard title={t("policeRequisitions.policeInfo")}>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label={t("policeRequisitions.policeStation")} value={req.policeStation} />
            <DetailField label={t("policeRequisitions.officersRequired")} value={req.officersRequired ? String(req.officersRequired) : undefined} />
            <DetailField label={t("policeRequisitions.policeOfficerName")} value={req.policeOfficerName} />
            <DetailField label={t("policeRequisitions.acknowledgementRef")} value={req.acknowledgementRef} />
          </div>
          {req.remarks && (
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t("policeRequisitions.remarks")}</p>
              <p className="text-sm">{req.remarks}</p>
            </div>
          )}
        </SectionCard>
      </div>

      {req.status !== "Fulfilled" && req.status !== "Cancelled" && (
        <SectionCard title={t("common.actions")}>
          <StatusActions req={req} onUpdate={refresh} />
        </SectionCard>
      )}

      <SectionCard title={t("timestamps.title")}>
        <div className="grid grid-cols-2 gap-4">
          <DetailField label={t("timestamps.createdAt")} value={req.createdAt ? new Date(req.createdAt).toLocaleString() : undefined} />
          <DetailField label={t("timestamps.lastUpdated")} value={req.updatedAt ? new Date(req.updatedAt).toLocaleString() : undefined} />
        </div>
      </SectionCard>
    </div>
  );
}
