import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function NewPoliceRequisition() {
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { user } = useAuth();

  const [form, setForm] = useState({
    childId: "",
    hearingDate: "",
    courtName: "",
    caseNumber: "",
    policeStation: "",
    officersRequired: "2",
    escortDepartureTime: "",
    requisitionDate: new Date().toISOString().split("T")[0],
    remarks: "",
    centerId: user?.centerId ? String(user.centerId) : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: childrenData } = useQuery({
    queryKey: ["children-list"],
    queryFn: () => fetch("/api/children?limit=500", { credentials: "include" }).then(r => r.json()),
  });

  const { data: courtCasesData } = useQuery({
    queryKey: ["court-cases-list"],
    queryFn: () => fetch("/api/court-cases", { credentials: "include" }).then(r => r.json()),
  });

  const children: any[] = Array.isArray(childrenData)
    ? childrenData
    : Array.isArray((childrenData as any)?.data)
    ? (childrenData as any).data
    : [];
  const courtCases: any[] = Array.isArray(courtCasesData)
    ? courtCasesData
    : Array.isArray((courtCasesData as any)?.data)
    ? (courtCasesData as any).data
    : [];

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleChildSelect = (childId: string) => {
    setForm(f => ({ ...f, childId }));
    if (childId) {
      const latestCase = courtCases
        .filter((c: any) => String(c.childId) === childId && c.nextHearingDate)
        .sort((a: any, b: any) => new Date(a.nextHearingDate).getTime() - new Date(b.nextHearingDate).getTime())[0];
      if (latestCase) {
        setForm(f => ({
          ...f,
          childId,
          courtName: latestCase.courtName || f.courtName,
          caseNumber: latestCase.caseNumber || f.caseNumber,
          hearingDate: latestCase.nextHearingDate || f.hearingDate,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.childId || !form.hearingDate) {
      setError(isBn ? "শিশু এবং শুনানির তারিখ আবশ্যক" : "Child and hearing date are required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/police-acquisitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          childId: parseInt(form.childId),
          officersRequired: parseInt(form.officersRequired) || 2,
          centerId: form.centerId ? parseInt(form.centerId) : null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Error");
      const created = await res.json();
      navigate(`/police-requisitions/${created.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/police-requisitions")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t("policeRequisitions.newRequisition")}</h1>
          <p className="text-sm text-muted-foreground">{t("policeRequisitions.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground">{t("policeRequisitions.courtHearingInfo")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t("policeRequisitions.child")} <span className="text-destructive">*</span></label>
              <select
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.childId}
                onChange={e => handleChildSelect(e.target.value)}
                required
              >
                <option value="">{isBn ? "শিশু নির্বাচন করুন" : "Select a child"}</option>
                {children.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.fullName} ({c.childId})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t("policeRequisitions.hearingDate")} <span className="text-destructive">*</span></label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.hearingDate}
                onChange={set("hearingDate")}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t("policeRequisitions.courtName")}</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.courtName}
                onChange={set("courtName")}
                placeholder={isBn ? "আদালতের নাম লিখুন" : "Enter court name"}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t("policeRequisitions.caseNumber")}</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.caseNumber}
                onChange={set("caseNumber")}
                placeholder={isBn ? "মামলা নম্বর লিখুন" : "Enter case/mamla number"}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t("policeRequisitions.escortDepartureTime")}</label>
              <input
                type="time"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.escortDepartureTime}
                onChange={set("escortDepartureTime")}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t("policeRequisitions.requisitionDate")}</label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.requisitionDate}
                onChange={set("requisitionDate")}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-5 space-y-4">
          <h2 className="font-semibold text-foreground">{t("policeRequisitions.policeInfo")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t("policeRequisitions.policeStation")}</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.policeStation}
                onChange={set("policeStation")}
                placeholder={isBn ? "থানার নাম লিখুন" : "Enter police station name"}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{t("policeRequisitions.officersRequired")}</label>
              <input
                type="number"
                min="1"
                max="20"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.officersRequired}
                onChange={set("officersRequired")}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t("policeRequisitions.remarks")}</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.remarks}
              onChange={set("remarks")}
              placeholder={isBn ? "অতিরিক্ত নির্দেশনা বা মন্তব্য" : "Additional instructions or remarks"}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? t("common.loading") : t("common.create")}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/police-requisitions")}>
            {t("common.cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}
