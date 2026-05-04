import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Printer, Users, ClipboardList, Scale, ShieldAlert,
  Clock, BookOpen, Activity, Building2, TrendingUp, ChevronRight, PanelLeftClose, PanelLeftOpen,
  CalendarDays, Globe, FileText,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { MonthlyReport } from "./monthly-report";
import { Chok01Report } from "./chok01-report";

const API = "/api";
const TEAL = "hsl(185, 45%, 25%)";
const AMBER = "hsl(35, 100%, 50%)";
const BLUE = "hsl(210, 80%, 50%)";
const RED = "hsl(0, 75%, 52%)";
const GREEN = "hsl(140, 55%, 42%)";
const PURPLE = "hsl(270, 50%, 50%)";

const PALETTE = [TEAL, AMBER, BLUE, RED, GREEN, PURPLE];

type ReportKey =
  | "monthly"
  | "chok01"
  | "overview"
  | "children"
  | "admissions"
  | "court"
  | "risk"
  | "followups"
  | "releases"
  | "counseling"
  | "centers";

function useReport(path: string, centerId?: number | null) {
  const url = centerId ? `${API}/reports/${path}?centerId=${centerId}` : `${API}/reports/${path}`;
  return useQuery({ queryKey: ["reports", path, centerId ?? "all"], queryFn: async () => {
    const r = await fetch(url, { credentials: "include" });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }, staleTime: 60_000 });
}

const HQ_ROLES = ["Super Admin", "Head Office", "DD Division", "DD District"];

/* ─── Print helper ─────────────────────────────────────────────────────────── */
function usePrint(ref: React.RefObject<HTMLDivElement | null>) {
  return () => {
    const content = ref.current?.innerHTML;
    if (!content) return;
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head>
      <title>CDC ERP Report</title>
      <meta charset="utf-8"/>
      <style>
        @page { margin: 20mm; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #111; }
        h1,h2,h3 { color: #1a6c6c; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
        th { background: #1a6c6c; color: white; padding: 6px 10px; text-align: left; font-size: 11px; }
        td { padding: 5px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
        tr:nth-child(even) td { background: #f9fafb; }
        .stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 1rem; }
        .stat-box { background: #f0f9ff; border-left: 3px solid #1a6c6c; padding: 10px 14px; border-radius: 4px; }
        .stat-box .val { font-size: 24px; font-weight: bold; color: #1a6c6c; }
        .stat-box .lbl { font-size: 10px; color: #6b7280; margin-top: 2px; }
        .section-title { font-size: 13px; font-weight: bold; color: #1a6c6c; border-bottom: 2px solid #1a6c6c; padding-bottom: 4px; margin: 18px 0 10px; }
        .report-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px double #1a6c6c; padding-bottom: 12px; margin-bottom: 16px; }
        .report-header .title { font-size: 18px; font-weight: bold; color: #1a6c6c; }
        .report-header .meta { font-size: 10px; color: #6b7280; margin-top: 4px; }
        .report-header .logo { font-size: 22px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 600; }
        .badge-green { background: #dcfce7; color: #166534; }
        .badge-red { background: #fee2e2; color: #991b1b; }
        .badge-amber { background: #fef3c7; color: #92400e; }
        .badge-blue { background: #dbeafe; color: #1e40af; }
        .no-print { display: none !important; }
        @media print { .no-print { display: none !important; } }
      </style>
    </head><body>
      <div class="report-header">
        <div>
          <div class="title">শিশু উন্নয়ন কেন্দ্র (সিডিসি) — সমাজসেবা অধিদফতর</div>
          <div class="meta">Child Development Center (CDC) — Department of Social Services, Bangladesh</div>
          <div class="meta" style="margin-top:4px">Generated: ${format(new Date(), "dd MMM yyyy, HH:mm")}</div>
        </div>
        <div class="logo">🏛️</div>
      </div>
      ${content}
    </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);
  };
}

/* ─── Stat box ─────────────────────────────────────────────────────────────── */
function StatBox({ label, value, sub, color = TEAL }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div className="bg-card border rounded-lg p-4 flex flex-col gap-1" style={{ borderLeftColor: color, borderLeftWidth: 3 }}>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs font-semibold text-foreground/80">{label}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

/* ─── Simple bar chart ─────────────────────────────────────────────────────── */
function SimpleBarChart({ data, dataKey = "count", nameKey = "name", color = TEAL, height = 200 }:
  { data: any[]; dataKey?: string; nameKey?: string; color?: string; height?: number }) {
  if (!data?.length) return <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">No data</div>;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey={nameKey} tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
        <Tooltip contentStyle={{ fontSize: 11 }} />
        <Bar dataKey={dataKey} fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ─── Pie chart ────────────────────────────────────────────────────────────── */
function SimplePieChart({ data, height = 180 }: { data: { name: string; value: number }[]; height?: number }) {
  if (!data?.length) return null;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false} fontSize={10}>
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ─── Record table ──────────────────────────────────────────────────────────── */
function RecordTable({ columns, rows }: { columns: string[]; rows: (string | number | null | undefined)[][] }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/60 border-b">
            {columns.map((c, i) => <th key={i} className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={columns.length} className="px-3 py-6 text-center text-muted-foreground">No records</td></tr>}
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
              {row.map((cell, j) => <td key={j} className="px-3 py-2">{cell ?? "—"}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Breakdown grid ────────────────────────────────────────────────────────── */
function BreakdownGrid({ map, palette }: { map: Record<string, number>; palette?: string[] }) {
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {entries.map(([key, val], i) => (
        <div key={key} className="flex items-center gap-2 bg-muted/30 rounded-md px-3 py-2">
          <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: (palette ?? PALETTE)[i % PALETTE.length] }} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate">{key}</div>
            <div className="text-[10px] text-muted-foreground">{val} ({total ? Math.round(val * 100 / total) : 0}%)</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   REPORT TEMPLATES
══════════════════════════════════════════════════════════════════════════════ */

function OverviewReport({ isBn, centerId, centerLabel }: { isBn: boolean; centerId?: number | null; centerLabel?: string }) {
  const { data, isLoading } = useReport("overview", centerId);
  const contentRef = useRef<HTMLDivElement>(null);
  const doPrint = usePrint(contentRef);
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  const d = data ?? {};

  return (
    <div className="space-y-6">
      <ReportHeader
        titleBn="সার্বিক সারসংক্ষেপ প্রতিবেদন"
        titleEn="Overall Summary Report"
        descBn="সকল মডিউলের সামগ্রিক পরিসংখ্যান এবং বিশ্লেষণ"
        descEn="Comprehensive statistics and analytics across all modules"
        isBn={isBn}
        onPrint={doPrint}
        centerLabel={centerLabel}
      />
      <div ref={contentRef}>
        <section className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-700 border-b border-teal-200 pb-1">
            {isBn ? "শিশু পরিসংখ্যান" : "Children Statistics"}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox label={isBn ? "মোট শিশু" : "Total Children"} value={d.totalChildren ?? 0} color={TEAL} />
            <StatBox label={isBn ? "বর্তমানে ভর্তি" : "Currently Admitted"} value={d.admitted ?? 0} color={BLUE} />
            <StatBox label={isBn ? "মুক্তিপ্রাপ্ত" : "Released"} value={d.released ?? 0} color={GREEN} />
            <StatBox label={isBn ? "স্থানান্তরিত" : "Transferred"} value={d.transferred ?? 0} color={PURPLE} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatBox label={isBn ? "ছেলে" : "Male"} value={d.male ?? 0} color={BLUE} />
            <StatBox label={isBn ? "মেয়ে" : "Female"} value={d.female ?? 0} color={PURPLE} />
          </div>
        </section>

        <section className="space-y-3 mt-6">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-700 border-b border-teal-200 pb-1">
            {isBn ? "মামলা ও আইনি তথ্য" : "Cases & Legal"}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox label={isBn ? "মোট মামলা" : "Total Cases"} value={d.totalCases ?? 0} color={TEAL} />
            <StatBox label={isBn ? "খোলা মামলা" : "Open Cases"} value={d.openCases ?? 0} color={AMBER} />
            <StatBox label={isBn ? "বন্ধ মামলা" : "Closed Cases"} value={d.closedCases ?? 0} color={GREEN} />
            <StatBox label={isBn ? "আদালত মামলা" : "Court Cases"} value={d.totalCourtCases ?? 0} color={BLUE} />
          </div>
        </section>

        <section className="space-y-3 mt-6">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-700 border-b border-teal-200 pb-1">
            {isBn ? "ঝুঁকি ও সেবা" : "Risk & Services"}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox label={isBn ? "উচ্চ ঝুঁকি" : "High Risk"} value={d.highRisk ?? 0} color={RED} />
            <StatBox label={isBn ? "মাঝারি ঝুঁকি" : "Medium Risk"} value={d.mediumRisk ?? 0} color={AMBER} />
            <StatBox label={isBn ? "পরামর্শ সেশন" : "Counseling Sessions"} value={d.totalCounseling ?? 0} color={TEAL} />
            <StatBox label={isBn ? "পুনর্মিলন ভিজিট" : "Guardian Visits"} value={d.totalGuardianVisits ?? 0} color={GREEN} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox label={isBn ? "ফলো-আপ" : "Follow-ups"} value={d.totalFollowUps ?? 0} color={BLUE} />
            <StatBox label={isBn ? "পুলিশ রিকুইজিশন" : "Police Requisitions"} value={d.totalPoliceReqs ?? 0} color={PURPLE} />
            <StatBox label={isBn ? "মুক্তি রেকর্ড" : "Release Records"} value={d.totalReleases ?? 0} color={GREEN} />
            <StatBox label={isBn ? "আসন্ন শুনানি" : "Pending Hearings"} value={d.pendingHearings ?? 0} color={AMBER} />
          </div>
        </section>
      </div>
    </div>
  );
}

function ChildrenReport({ isBn, centerId, centerLabel }: { isBn: boolean; centerId?: number | null; centerLabel?: string }) {
  const { data, isLoading } = useReport("children-breakdown", centerId);
  const contentRef = useRef<HTMLDivElement>(null);
  const doPrint = usePrint(contentRef);
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  const d = data ?? {};

  const pieStatus = Object.entries(d.byStatus ?? {}).map(([name, value]) => ({ name, value: value as number }));
  const pieGender = Object.entries(d.byGender ?? {}).map(([name, value]) => ({ name, value: value as number }));
  const ageData = Object.entries(d.byAgeGroup ?? {}).map(([name, count]) => ({ name, count: count as number }));
  const centerData = Object.entries(d.byCenter ?? {}).map(([name, count]) => ({ name, count: count as number }));
  const monthData = (d.months ?? []).slice(-12).map((m: any) => ({ ...m, month: m.month.substring(5) }));

  return (
    <div className="space-y-6">
      <ReportHeader
        titleBn="শিশুর অবস্থা প্রতিবেদন"
        titleEn="Children Status Report"
        descBn="কেন্দ্র, লিঙ্গ, বয়স এবং ভর্তির উৎস অনুযায়ী শিশুর বিস্তারিত বিশ্লেষণ"
        descEn="Detailed analysis of children by center, gender, age and admission source"
        isBn={isBn}
        onPrint={doPrint}
        centerLabel={centerLabel}
      />
      <div ref={contentRef} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-4">
            <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "অবস্থা অনুযায়ী" : "By Status"}</div>
            <SimplePieChart data={pieStatus} />
          </Card>
          <Card className="p-4">
            <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "লিঙ্গ অনুযায়ী" : "By Gender"}</div>
            <SimplePieChart data={pieGender} height={180} />
          </Card>
        </div>

        <Card className="p-4">
          <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "বয়স গ্রুপ অনুযায়ী" : "By Age Group"}</div>
          <SimpleBarChart data={ageData} color={TEAL} height={160} />
        </Card>

        <Card className="p-4">
          <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "কেন্দ্র অনুযায়ী" : "By Center"}</div>
          <SimpleBarChart data={centerData} color={BLUE} height={160} />
        </Card>

        <Card className="p-4">
          <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "মাসিক ভর্তির প্রবণতা" : "Monthly Admission Trend"}</div>
          <SimpleBarChart data={monthData} nameKey="month" color={AMBER} height={180} />
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "ভর্তির উৎস" : "Admission Source"}</div>
            <BreakdownGrid map={d.bySource ?? {}} />
          </Card>
          <Card className="p-4">
            <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "মামলার ধরন" : "Case Type"}</div>
            <BreakdownGrid map={d.byCaseType ?? {}} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function AdmissionsReport({ isBn, centerId, centerLabel }: { isBn: boolean; centerId?: number | null; centerLabel?: string }) {
  const { data, isLoading } = useReport("admissions-monthly", centerId);
  const contentRef = useRef<HTMLDivElement>(null);
  const doPrint = usePrint(contentRef);
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  const d = data ?? {};
  const monthData = (d.months ?? []).slice(-12).map((m: any) => ({ ...m, month: m.month.substring(5) }));

  return (
    <div className="space-y-6">
      <ReportHeader
        titleBn="ভর্তি প্রতিবেদন"
        titleEn="Admissions Report"
        descBn="মাসিক ভর্তির তথ্য, উৎস এবং অনুমোদনের অবস্থা"
        descEn="Monthly admission data, sources and approval status"
        isBn={isBn}
        onPrint={doPrint}
        centerLabel={centerLabel}
      />
      <div ref={contentRef} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatBox label={isBn ? "মোট ভর্তি" : "Total Admissions"} value={d.total ?? 0} color={TEAL} />
          <StatBox label={isBn ? "অনুমোদিত" : "Approved"} value={d.byStatus?.Approved ?? 0} color={GREEN} />
          <StatBox label={isBn ? "অপেক্ষমাণ" : "Pending"} value={(d.byStatus?.Draft ?? 0) + (d.byStatus?.Pending ?? 0)} color={AMBER} />
        </div>

        <Card className="p-4">
          <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "মাসিক ভর্তির সংখ্যা" : "Monthly Admission Count"}</div>
          <SimpleBarChart data={monthData} nameKey="month" color={TEAL} height={200} />
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "ভর্তির উৎস" : "By Admission Source"}</div>
            <BreakdownGrid map={d.bySource ?? {}} />
          </Card>
          <Card className="p-4">
            <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "কেন্দ্র অনুযায়ী" : "By Center"}</div>
            <BreakdownGrid map={d.byCenter ?? {}} />
          </Card>
        </div>

        <Card className="p-4">
          <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "সাম্প্রতিক ভর্তি" : "Recent Admissions"}</div>
          <RecordTable
            columns={isBn ? ["শিশুর নাম", "ভর্তির তারিখ", "উৎস", "কেন্দ্র"] : ["Child Name", "Admission Date", "Source", "Center"]}
            rows={(d.recent ?? []).map((r: any) => [r.childName, r.admissionDate, r.admissionSource, r.receivingCenter])}
          />
        </Card>
      </div>
    </div>
  );
}

function CourtCasesReport({ isBn, centerId, centerLabel }: { isBn: boolean; centerId?: number | null; centerLabel?: string }) {
  const { data, isLoading } = useReport("court-cases", centerId);
  const contentRef = useRef<HTMLDivElement>(null);
  const doPrint = usePrint(contentRef);
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  const d = data ?? {};
  const pieStatus = Object.entries(d.byStatus ?? {}).map(([name, value]) => ({ name, value: value as number }));

  return (
    <div className="space-y-6">
      <ReportHeader
        titleBn="আদালত মামলার প্রতিবেদন"
        titleEn="Court Cases Report"
        descBn="আদালতের মামলার অবস্থা, আসন্ন শুনানি এবং মামলার ধরন"
        descEn="Court case status, upcoming hearings and case type breakdown"
        isBn={isBn}
        onPrint={doPrint}
        centerLabel={centerLabel}
      />
      <div ref={contentRef} className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBox label={isBn ? "মোট মামলা" : "Total Cases"} value={d.total ?? 0} color={TEAL} />
          <StatBox label={isBn ? "আসন্ন শুনানি" : "Upcoming Hearings"} value={d.upcomingCount ?? 0} color={AMBER} />
          <StatBox label={isBn ? "সক্রিয়" : "Active"} value={d.byStatus?.Active ?? 0} color={BLUE} />
          <StatBox label={isBn ? "নিষ্পত্তি" : "Disposed"} value={d.byStatus?.Disposed ?? 0} color={GREEN} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="p-4">
            <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "অবস্থা অনুযায়ী" : "By Status"}</div>
            <SimplePieChart data={pieStatus} />
          </Card>
          <Card className="p-4">
            <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "আদালত অনুযায়ী" : "By Court"}</div>
            <BreakdownGrid map={d.byCourt ?? {}} />
          </Card>
        </div>

        <Card className="p-4">
          <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "আসন্ন শুনানির তালিকা" : "Upcoming Hearings"}</div>
          <RecordTable
            columns={isBn ? ["শিশুর নাম", "মামলা নং", "আদালত", "পরবর্তী শুনানি", "ধরন"] : ["Child Name", "Case No.", "Court", "Next Hearing", "Type"]}
            rows={(d.upcomingHearings ?? []).map((r: any) => [r.childName, r.caseNo, r.court, r.nextHearingDate, r.caseType])}
          />
        </Card>
      </div>
    </div>
  );
}

function RiskReport({ isBn, centerId, centerLabel }: { isBn: boolean; centerId?: number | null; centerLabel?: string }) {
  const { data, isLoading } = useReport("risk-assessments", centerId);
  const contentRef = useRef<HTMLDivElement>(null);
  const doPrint = usePrint(contentRef);
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  const d = data ?? {};
  const pieLevel = Object.entries(d.byLevel ?? {}).map(([name, value]) => ({ name, value: value as number }));
  const centerData = Object.entries(d.byCenter ?? {}).map(([name, count]) => ({ name, count: count as number }));

  return (
    <div className="space-y-6">
      <ReportHeader
        titleBn="ঝুঁকি মূল্যায়ন প্রতিবেদন"
        titleEn="Risk Assessment Report"
        descBn="শিশুদের ঝুঁকির মাত্রা, কেন্দ্র অনুযায়ী বিশ্লেষণ"
        descEn="Children's risk levels and center-wise analysis"
        isBn={isBn}
        onPrint={doPrint}
        centerLabel={centerLabel}
      />
      <div ref={contentRef} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatBox label={isBn ? "মোট মূল্যায়ন" : "Total Assessments"} value={d.total ?? 0} color={TEAL} />
          <StatBox label={isBn ? "উচ্চ ঝুঁকি" : "High Risk"} value={d.byLevel?.High ?? 0} color={RED} />
          <StatBox label={isBn ? "মাঝারি ঝুঁকি" : "Medium Risk"} value={d.byLevel?.Medium ?? 0} color={AMBER} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="p-4">
            <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "ঝুঁকির স্তর" : "By Risk Level"}</div>
            <SimplePieChart data={pieLevel} />
          </Card>
          <Card className="p-4">
            <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "কেন্দ্র অনুযায়ী" : "By Center"}</div>
            <SimpleBarChart data={centerData} color={RED} height={180} />
          </Card>
        </div>

        <Card className="p-4">
          <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "সাম্প্রতিক মূল্যায়ন" : "Recent Assessments"}</div>
          <RecordTable
            columns={isBn ? ["শিশুর নাম", "ঝুঁকির মাত্রা", "মূল্যায়নকারী", "তারিখ", "কেন্দ্র"] : ["Child Name", "Risk Level", "Assessed By", "Date", "Center"]}
            rows={(d.recent ?? []).map((r: any) => [r.childName, r.overallRiskLevel, r.assessedBy, r.assessmentDate, r.centerName])}
          />
        </Card>
      </div>
    </div>
  );
}

function FollowUpsReport({ isBn, centerId, centerLabel }: { isBn: boolean; centerId?: number | null; centerLabel?: string }) {
  const { data, isLoading } = useReport("follow-ups", centerId);
  const contentRef = useRef<HTMLDivElement>(null);
  const doPrint = usePrint(contentRef);
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  const d = data ?? {};
  const monthData = (d.months ?? []).slice(-12).map((m: any) => ({ ...m, month: m.month.substring(5) }));

  return (
    <div className="space-y-6">
      <ReportHeader
        titleBn="ফলো-আপ প্রতিবেদন"
        titleEn="Follow-up Report"
        descBn="মুক্তির পরবর্তী ফলো-আপ ভিজিটের তথ্য এবং পরিসংখ্যান"
        descEn="Post-release follow-up visit data and statistics"
        isBn={isBn}
        onPrint={doPrint}
        centerLabel={centerLabel}
      />
      <div ref={contentRef} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatBox label={isBn ? "মোট ফলো-আপ" : "Total Follow-ups"} value={d.total ?? 0} color={TEAL} />
          <StatBox label={isBn ? "কেন্দ্র সংখ্যা" : "Centers Covered"} value={Object.keys(d.byCenter ?? {}).length} color={BLUE} />
        </div>

        <Card className="p-4">
          <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "মাসিক ফলো-আপ" : "Monthly Follow-ups"}</div>
          <SimpleBarChart data={monthData} nameKey="month" color={TEAL} height={180} />
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "ভিজিটের ধরন" : "By Visit Type"}</div>
            <BreakdownGrid map={d.byType ?? {}} />
          </Card>
          <Card className="p-4">
            <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "কেন্দ্র অনুযায়ী" : "By Center"}</div>
            <BreakdownGrid map={d.byCenter ?? {}} />
          </Card>
        </div>

        <Card className="p-4">
          <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "সাম্প্রতিক ফলো-আপ" : "Recent Follow-ups"}</div>
          <RecordTable
            columns={isBn ? ["শিশুর নাম", "তারিখ", "ধরন", "কেন্দ্র"] : ["Child Name", "Date", "Type", "Center"]}
            rows={(d.recent ?? []).map((r: any) => [r.childName, r.followUpDate, r.visitType, r.centerName])}
          />
        </Card>
      </div>
    </div>
  );
}

function ReleasesReport({ isBn, centerId, centerLabel }: { isBn: boolean; centerId?: number | null; centerLabel?: string }) {
  const { data, isLoading } = useReport("releases", centerId);
  const contentRef = useRef<HTMLDivElement>(null);
  const doPrint = usePrint(contentRef);
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  const d = data ?? {};
  const pieType = Object.entries(d.byType ?? {}).map(([name, value]) => ({ name, value: value as number }));
  const monthData = (d.months ?? []).slice(-12).map((m: any) => ({ ...m, month: m.month.substring(5) }));

  return (
    <div className="space-y-6">
      <ReportHeader
        titleBn="মুক্তি রেকর্ড প্রতিবেদন"
        titleEn="Release Records Report"
        descBn="শিশুদের মুক্তির ধরন, গন্তব্য এবং মাসিক পরিসংখ্যান"
        descEn="Children's release types, destinations and monthly statistics"
        isBn={isBn}
        onPrint={doPrint}
        centerLabel={centerLabel}
      />
      <div ref={contentRef} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatBox label={isBn ? "মোট মুক্তি" : "Total Releases"} value={d.total ?? 0} color={TEAL} />
          <StatBox label={isBn ? "পরিবারে প্রত্যাবর্তন" : "Family Reunification"} value={d.byType?.["Family Reunification"] ?? 0} color={GREEN} />
          <StatBox label={isBn ? "বিচারিক আদেশ" : "Court Order"} value={d.byType?.["Court Order"] ?? 0} color={BLUE} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="p-4">
            <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "মুক্তির ধরন" : "By Release Type"}</div>
            <SimplePieChart data={pieType} />
          </Card>
          <Card className="p-4">
            <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "কেন্দ্র অনুযায়ী" : "By Center"}</div>
            <BreakdownGrid map={d.byCenter ?? {}} />
          </Card>
        </div>

        <Card className="p-4">
          <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "মাসিক মুক্তির সংখ্যা" : "Monthly Releases"}</div>
          <SimpleBarChart data={monthData} nameKey="month" color={GREEN} height={180} />
        </Card>

        <Card className="p-4">
          <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "সাম্প্রতিক মুক্তি" : "Recent Releases"}</div>
          <RecordTable
            columns={isBn ? ["শিশুর নাম", "তারিখ", "মুক্তির ধরন", "হস্তান্তর", "কেন্দ্র"] : ["Child Name", "Date", "Release Type", "Handed To", "Center"]}
            rows={(d.recent ?? []).map((r: any) => [r.childName, r.releaseDate, r.releaseType, r.handedOverTo, r.centerName])}
          />
        </Card>
      </div>
    </div>
  );
}

function CounselingReport({ isBn, centerId, centerLabel }: { isBn: boolean; centerId?: number | null; centerLabel?: string }) {
  const { data, isLoading } = useReport("counseling", centerId);
  const contentRef = useRef<HTMLDivElement>(null);
  const doPrint = usePrint(contentRef);
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  const d = data ?? {};
  const monthData = (d.months ?? []).slice(-12).map((m: any) => ({ ...m, month: m.month.substring(5) }));
  const centerData = Object.entries(d.byCenter ?? {}).map(([name, count]) => ({ name, count: count as number }));

  return (
    <div className="space-y-6">
      <ReportHeader
        titleBn="পরামর্শ সেশন প্রতিবেদন"
        titleEn="Counseling Sessions Report"
        descBn="শিশুদের মনোসামাজিক সহায়তা সেশনের পরিসংখ্যান"
        descEn="Psychosocial support session statistics for children"
        isBn={isBn}
        onPrint={doPrint}
        centerLabel={centerLabel}
      />
      <div ref={contentRef} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatBox label={isBn ? "মোট সেশন" : "Total Sessions"} value={d.total ?? 0} color={TEAL} />
          <StatBox label={isBn ? "সেশনের ধরন" : "Session Types"} value={Object.keys(d.byType ?? {}).length} color={BLUE} />
        </div>

        <Card className="p-4">
          <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "মাসিক সেশন" : "Monthly Sessions"}</div>
          <SimpleBarChart data={monthData} nameKey="month" color={TEAL} height={200} />
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "সেশনের ধরন" : "By Session Type"}</div>
            <BreakdownGrid map={d.byType ?? {}} />
          </Card>
          <Card className="p-4">
            <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "কেন্দ্র অনুযায়ী" : "By Center"}</div>
            <SimpleBarChart data={centerData} color={PURPLE} height={160} />
          </Card>
        </div>

        <Card className="p-4">
          <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "সাম্প্রতিক সেশন" : "Recent Sessions"}</div>
          <RecordTable
            columns={isBn ? ["শিশুর নাম", "তারিখ", "সেশনের ধরন", "পরামর্শদাতা", "কেন্দ্র"] : ["Child Name", "Date", "Session Type", "Counselor", "Center"]}
            rows={(d.recent ?? []).map((r: any) => [r.childName, r.sessionDate, r.sessionType, r.counselor, r.centerName])}
          />
        </Card>
      </div>
    </div>
  );
}

function CenterComparisonReport({ isBn }: { isBn: boolean }) {
  const { data, isLoading } = useReport("center-comparison");
  const contentRef = useRef<HTMLDivElement>(null);
  const doPrint = usePrint(contentRef);
  if (isLoading) return <Skeleton className="h-96 w-full" />;
  const centers: any[] = data ?? [];

  const chartData = centers.map(c => ({
    name: c.centerName?.split(" ").pop() ?? c.centerName,
    Children: c.totalChildren,
    Admitted: c.admitted,
    Released: c.released,
    Counseling: c.counselingSessions,
  }));

  return (
    <div className="space-y-6">
      <ReportHeader
        titleBn="কেন্দ্র তুলনামূলক প্রতিবেদন"
        titleEn="Center Comparison Report"
        descBn="তিনটি সিডিসি কেন্দ্রের কার্যক্রমের তুলনামূলক বিশ্লেষণ"
        descEn="Comparative analysis of operations across all three CDC centers"
        isBn={isBn}
        onPrint={doPrint}
      />
      <div ref={contentRef} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {centers.map((c, i) => (
            <Card key={c.centerId} className="p-4 space-y-3" style={{ borderTopColor: PALETTE[i], borderTopWidth: 3 }}>
              <div className="font-bold text-sm" style={{ color: PALETTE[i] }}>{c.centerName}</div>
              <div className="text-xs text-muted-foreground">{c.location}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted/30 rounded p-2 text-center">
                  <div className="text-lg font-bold">{c.totalChildren}</div>
                  <div className="text-muted-foreground">{isBn ? "মোট" : "Total"}</div>
                </div>
                <div className="bg-muted/30 rounded p-2 text-center">
                  <div className="text-lg font-bold text-teal-700">{c.admitted}</div>
                  <div className="text-muted-foreground">{isBn ? "ভর্তি" : "Admitted"}</div>
                </div>
                <div className="bg-muted/30 rounded p-2 text-center">
                  <div className="text-lg font-bold text-green-700">{c.released}</div>
                  <div className="text-muted-foreground">{isBn ? "মুক্তি" : "Released"}</div>
                </div>
                <div className="bg-muted/30 rounded p-2 text-center">
                  <div className="text-lg font-bold text-blue-700">{c.openCases}</div>
                  <div className="text-muted-foreground">{isBn ? "মামলা" : "Cases"}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-4">
          <div className="text-xs font-bold text-teal-700 mb-3">{isBn ? "কেন্দ্র তুলনা চার্ট" : "Center Comparison Chart"}</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Children" fill={TEAL} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Admitted" fill={BLUE} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Released" fill={GREEN} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Counseling" fill={AMBER} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-bold text-teal-700 mb-4">{isBn ? "বিস্তারিত তুলনা" : "Detailed Comparison"}</div>
          <RecordTable
            columns={isBn
              ? ["কেন্দ্র", "অবস্থান", "মোট শিশু", "ছেলে", "মেয়ে", "ভর্তি", "মুক্তি", "খোলা মামলা", "পরামর্শ"]
              : ["Center", "Location", "Total", "Male", "Female", "Admitted", "Released", "Open Cases", "Counseling"]}
            rows={centers.map(c => [
              c.centerName, c.location, c.totalChildren, c.male, c.female,
              c.admitted, c.released, c.openCases, c.counselingSessions,
            ])}
          />
        </Card>
      </div>
    </div>
  );
}

/* ─── Report header component ──────────────────────────────────────────────── */
function ReportHeader({ titleBn, titleEn, descBn, descEn, isBn, onPrint, centerLabel }: {
  titleBn: string; titleEn: string; descBn: string; descEn: string;
  isBn: boolean; onPrint: () => void; centerLabel?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-teal-200">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-xl font-bold text-teal-800">{isBn ? titleBn : titleEn}</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{isBn ? descBn : descEn}</p>
        <div className="flex items-center gap-2 mt-2">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{format(new Date(), "dd MMM yyyy")}</span>
          <span className="text-xs text-muted-foreground">— {isBn ? "সমাজসেবা অধিদফতর, বাংলাদেশ" : "Department of Social Services, Bangladesh"}</span>
        </div>
      </div>
      <Button onClick={onPrint} variant="outline" size="sm" className="gap-2 border-teal-300 text-teal-700 hover:bg-teal-50 flex-shrink-0">
        <Printer className="h-4 w-4" />
        {isBn ? "মুদ্রণ" : "Print"}
      </Button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN REPORTS PAGE
══════════════════════════════════════════════════════════════════════════════ */

const ALL_REPORTS: {
  key: ReportKey; iconEn: string; iconBn: string; icon: React.ElementType; color: string; hqOnly?: boolean;
}[] = [
  { key: "monthly",    iconEn: "Monthly Report",        iconBn: "মাসিক রিপোর্ট",            icon: FileText,      color: GREEN },
  { key: "chok01",     iconEn: "Top Sheet",            iconBn: "টপ শিট",                  icon: FileText,      color: AMBER },
  { key: "overview",   iconEn: "Overall Summary",       iconBn: "সার্বিক সারসংক্ষেপ",      icon: TrendingUp,    color: TEAL },
  { key: "children",   iconEn: "Children Status",       iconBn: "শিশুর অবস্থা",             icon: Users,         color: BLUE },
  { key: "admissions", iconEn: "Admissions",            iconBn: "ভর্তি",                     icon: ClipboardList, color: AMBER },
  { key: "court",      iconEn: "Court Cases",           iconBn: "আদালত মামলা",              icon: Scale,         color: PURPLE },
  { key: "risk",       iconEn: "Risk Assessments",      iconBn: "ঝুঁকি মূল্যায়ন",          icon: ShieldAlert,   color: RED },
  { key: "followups",  iconEn: "Follow-up",             iconBn: "ফলো-আপ",                   icon: Clock,         color: GREEN },
  { key: "releases",   iconEn: "Release Records",       iconBn: "মুক্তি রেকর্ড",            icon: BookOpen,      color: GREEN },
  { key: "counseling", iconEn: "Counseling Sessions",   iconBn: "পরামর্শ সেশন",             icon: Activity,      color: TEAL },
  { key: "centers",    iconEn: "Center Comparison",     iconBn: "কেন্দ্র তুলনা",            icon: Building2,     color: BLUE, hqOnly: true },
];

export default function ReportsPage() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isBn = i18n.language === "bn";

  const isHQ = HQ_ROLES.includes(user?.roleName ?? "");

  // Center users: fixed to their center; HQ users: optional filter (null = all)
  const userCenterId = user?.centerId ?? null;
  const [selectedCenterId, setSelectedCenterId] = useState<number | null>(null);

  // Fetch centers list for HQ selector
  const { data: centersData } = useQuery({
    queryKey: ["centers-list"],
    queryFn: async () => {
      const r = await fetch("/api/centers", { credentials: "include" });
      if (!r.ok) return [];
      const json = await r.json();
      return Array.isArray(json) ? json : (json.centers ?? []);
    },
    staleTime: 300_000,
  });
  const centers: { id: number; name: string; centerType?: string | null; isHq?: string | null }[] =
    Array.isArray(centersData)
      ? centersData.map((center: any) => ({
          id: center.id,
          name: center.name ?? center.centerName,
          centerType: center.centerType,
          isHq: center.isHq,
        }))
      : [];

  // Effective centerId: center users → their center; HQ → selected or null
  const effectiveCenterId = isHQ ? selectedCenterId : userCenterId;

  // Label shown in report headers
  const centerLabel = effectiveCenterId
    ? (centers.find(c => c.id === effectiveCenterId)?.name ?? user?.centerName ?? undefined)
    : isHQ
    ? (isBn ? "সকল কেন্দ্র" : "All Centers")
    : (user?.centerName ?? undefined);

  const visibleReports = ALL_REPORTS.filter(r => !r.hqOnly || isHQ);
  const [active, setActive] = useState<ReportKey>("monthly");
  const [reportNavCollapsed, setReportNavCollapsed] = useState(false);

  const reportProps = { isBn, centerId: effectiveCenterId, centerLabel };
  const monthlyCenters = centers.filter(center => center.isHq !== "yes");
  const monthlyDefaultCenterId = isHQ
    ? (selectedCenterId ?? monthlyCenters[0]?.id ?? null)
    : (userCenterId ?? monthlyCenters[0]?.id ?? null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isBn ? "প্রতিবেদন ও বিশ্লেষণ" : "Reports & Analytics"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isBn ? "সকল মডিউলের প্রতিবেদন, পরিসংখ্যান এবং বিশ্লেষণ।"
              : "Reports, statistics and analytics across all modules."}
          </p>
        </div>

        {/* HQ: center selector */}
        {isHQ && active !== "monthly" && active !== "chok01" && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedCenterId?.toString() ?? "all"}
              onValueChange={v => setSelectedCenterId(v === "all" ? null : Number(v))}
            >
              <SelectTrigger className="w-52 h-9 text-sm border-teal-200 focus:ring-teal-300">
                <SelectValue placeholder={isBn ? "কেন্দ্র নির্বাচন করুন" : "Select Center"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {isBn ? "সকল কেন্দ্র" : "All Centers"}
                </SelectItem>
                {centers.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Center-level user: show their center badge */}
        {!isHQ && user?.centerName && (
          <Badge variant="outline" className="border-teal-300 text-teal-700 text-xs font-semibold h-7 px-3 self-start mt-1">
            {user.centerName}
          </Badge>
        )}
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar nav */}
        <div className={`flex-shrink-0 space-y-1 transition-[width] duration-200 ${reportNavCollapsed ? "w-16" : "w-56"}`}>
          <div className={`flex items-center ${reportNavCollapsed ? "justify-center" : "justify-between"} px-2 pb-1`}>
            {!reportNavCollapsed && (
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                {isBn ? "প্রতিবেদনের ধরন" : "Report Templates"}
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setReportNavCollapsed((value) => !value)}
              title={reportNavCollapsed ? (isBn ? "তালিকা খুলুন" : "Expand report list") : (isBn ? "তালিকা ছোট করুন" : "Collapse report list")}
            >
              {reportNavCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
          {visibleReports.map(r => {
            const Icon = r.icon;
            const isActive = active === r.key;
            return (
              <button
                key={r.key}
                onClick={() => setActive(r.key)}
                title={reportNavCollapsed ? (isBn ? r.iconBn : r.iconEn) : undefined}
                className={`w-full flex items-center ${reportNavCollapsed ? "justify-center px-2.5" : "gap-2.5 px-3"} py-2.5 rounded-lg text-left transition-all text-sm ${
                  isActive
                    ? "bg-teal-50 text-teal-800 font-semibold border border-teal-200 shadow-sm"
                    : "text-foreground/70 hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <span className={`h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 ${isActive ? "bg-teal-100" : "bg-muted"}`}>
                  <Icon className="h-3.5 w-3.5" style={{ color: isActive ? r.color : undefined }} />
                </span>
                {!reportNavCollapsed && <span className="flex-1 leading-tight">{isBn ? r.iconBn : r.iconEn}</span>}
                {!reportNavCollapsed && isActive && <ChevronRight className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Report content */}
        <div className="flex-1 min-w-0">
          <Card className="p-6">
            {active === "monthly"    && <MonthlyReport centers={monthlyCenters} defaultCenterId={monthlyDefaultCenterId} isHQ={isHQ} isBn={isBn} />}
            {active === "chok01"    && <Chok01Report  centers={monthlyCenters} defaultCenterId={monthlyDefaultCenterId} isHQ={isHQ} isBn={isBn} />}
            {active === "overview"   && <OverviewReport   {...reportProps} />}
            {active === "children"   && <ChildrenReport   {...reportProps} />}
            {active === "admissions" && <AdmissionsReport {...reportProps} />}
            {active === "court"      && <CourtCasesReport {...reportProps} />}
            {active === "risk"       && <RiskReport       {...reportProps} />}
            {active === "followups"  && <FollowUpsReport  {...reportProps} />}
            {active === "releases"   && <ReleasesReport   {...reportProps} />}
            {active === "counseling" && <CounselingReport {...reportProps} />}
            {active === "centers" && isHQ && <CenterComparisonReport isBn={isBn} />}
          </Card>
        </div>
      </div>
    </div>
  );
}
