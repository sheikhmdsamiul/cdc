import {
  useGetDashboardStats,
  useGetRecentActivity,
  useGetChildrenByStatus,
  getGetDashboardStatsQueryKey,
  getGetRecentActivityQueryKey,
  getGetChildrenByStatusQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, FileText, ShieldAlert, HeartPulse, Scale, ShieldCheck, Activity,
  Clock, AlertTriangle, CalendarClock, Gavel, CheckSquare
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { useAuth, hasRole } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { getRoleLabel } from "@/i18n/labels";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useEffect, useMemo, useState } from "react";

const CHART_COLORS = ['hsl(185, 45%, 25%)', 'hsl(35, 100%, 50%)', 'hsl(205, 30%, 40%)', 'hsl(15, 70%, 55%)'];

type CenterKey = "tongi" | "konabari" | "fulerhat";

function toCenterKey(name: string | null | undefined): CenterKey | null {
  const normalized = String(name ?? "").toLowerCase();
  if (normalized.includes("tongi")) return "tongi";
  if (normalized.includes("konabari")) return "konabari";
  if (normalized.includes("fulerhat")) return "fulerhat";
  return null;
}

function centerTitle(key: CenterKey, isBn: boolean) {
  if (isBn) {
    if (key === "tongi") return "কেন্দ্র টঙ্গী";
    if (key === "konabari") return "কেন্দ্র কোনাবাড়ী";
    return "কেন্দ্র ফুলেরহাট";
  }
  if (key === "tongi") return "Center Tongi";
  if (key === "konabari") return "Center Konabari";
  return "Center Fulerhat";
}

function safeText(value: unknown, fallback = "—") {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : fallback;
}

function MonthlyReportKpiCards({ isBn }: { isBn: boolean }) {
  const now = new Date();
  const [selectedCenterId, setSelectedCenterId] = useState<string>("__all");
  const [selectedMonth, setSelectedMonth] = useState<string>(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState<string>(String(now.getFullYear()));

  const { data: centersResp, isLoading: centersLoading } = useQuery({
    queryKey: ["dashboard-monthly-report-centers"],
    queryFn: () => fetch("/api/centers", { credentials: "include" }).then((r) => r.json()),
  });

  const centers = (centersResp?.centers ?? []).filter((c: any) => String(c?.isHq ?? "").toLowerCase() !== "yes");

  useEffect(() => {
    if (selectedCenterId !== "__all") return;
    const preferred = centers.find((c: any) => {
      const n = String(c.centerName ?? "").toLowerCase();
      return n.includes("tongi") || n.includes("konabari") || n.includes("fulerhat");
    });
    if (preferred) setSelectedCenterId(String(preferred.id));
  }, [centers, selectedCenterId]);

  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ["dashboard-monthly-report-kpis", selectedCenterId, selectedMonth, selectedYear],
    queryFn: async () => {
      const params = new URLSearchParams({
        month: selectedMonth,
        year: selectedYear,
      });
      if (selectedCenterId !== "__all") params.set("centerId", selectedCenterId);
      const r = await fetch(`/api/reports/monthly-report?${params.toString()}`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load monthly report");
      return r.json();
    },
    enabled: !centersLoading,
  });

  const rows: string[][] = Array.isArray(reportData?.rows) ? reportData.rows : [];
  const hasTextAt = (row: string[] | undefined, index: number) => String(row?.[index] ?? "").trim().length > 0;

  const totalChildren = Number(reportData?.total ?? rows.length ?? 0);
  const linkedCaseRows = rows.filter((r) => hasTextAt(r, 17)).length;
  const nextHearingRows = rows.filter((r) => hasTextAt(r, 21)).length;
  const followUpRows = rows.filter((r) => hasTextAt(r, 66)).length;
  const releasedRows = rows.filter((r) => hasTextAt(r, 64) || hasTextAt(r, 65)).length;

  const bnMonths = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
  const yearOptions = Array.from({ length: 6 }, (_, i) => now.getFullYear() - 3 + i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: isBn ? bnMonths[i] : format(new Date(Number(selectedYear), i, 1), "MMM"),
  }));

  return (
    <Card className="shadow-sm border-l-4 border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">{isBn ? "মাসিক রিপোর্ট সারাংশ" : "Monthly Report Snapshot"}</CardTitle>
        <CardDescription className="text-xs">
          {isBn ? "কেন্দ্র, মাস ও বছর ফিল্টার করে মাসিক রিপোর্টভিত্তিক সারাংশ" : "Monthly-report-based KPI cards with center, month, and year filters"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 md:grid-cols-3">
          <Select value={selectedCenterId} onValueChange={setSelectedCenterId}>
            <SelectTrigger><SelectValue placeholder={isBn ? "কেন্দ্র নির্বাচন করুন" : "Select Center"} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">{isBn ? "সব কেন্দ্র" : "All Centers"}</SelectItem>
              {centers.map((c: any) => (
                <SelectItem key={c.id} value={String(c.id)}>{safeText(isBn ? (c.centerNameBn || c.centerName) : c.centerName, `Center ${c.id}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger><SelectValue placeholder={isBn ? "মাস" : "Month"} /></SelectTrigger>
            <SelectContent>
              {monthOptions.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger><SelectValue placeholder={isBn ? "বছর" : "Year"} /></SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {reportLoading ? (
          <Skeleton className="h-28 w-full" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title={isBn ? "মোট শিশু" : "Total Children"}
              value={totalChildren}
              icon={Users}
              isLoading={false}
              accent="stat-card-teal"
            />
            <StatCard
              title={isBn ? "মামলা-সংযুক্ত" : "Case Linked"}
              value={linkedCaseRows}
              icon={FileText}
              isLoading={false}
              accent="stat-card-blue"
            />
            <StatCard
              title={isBn ? "পরবর্তী শুনানি নির্ধারিত" : "Next Hearing Scheduled"}
              value={nextHearingRows}
              icon={Gavel}
              isLoading={false}
              accent="stat-card-amber"
            />
            <StatCard
              title={isBn ? "ফলো-আপ ট্র্যাকড" : "Follow-up Tracked"}
              value={followUpRows}
              icon={Clock}
              isLoading={false}
              accent="stat-card-teal"
            />
            <StatCard
              title={isBn ? "রিলিজড (রিপোর্টে)" : "Released (In Report)"}
              value={releasedRows}
              icon={ShieldCheck}
              isLoading={false}
              accent="stat-card-red"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AgeTransitionBarChart({ isBn }: { isBn: boolean }) {
  const [, navigate] = useLocation();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-age-transition-chart"],
    queryFn: async () => {
      const fetchJson = (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json());
      const pageSize = 1000;
      const firstChildrenPage = await fetchJson(`/api/children?page=1&limit=${pageSize}`);
      const allChildren: any[] = [...(firstChildrenPage?.data ?? [])];
      const totalChildren = Number(firstChildrenPage?.total ?? allChildren.length);
      const totalPages = Math.max(1, Math.ceil(totalChildren / pageSize));
      if (totalPages > 1) {
        const pageResponses = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) => fetchJson(`/api/children?page=${i + 2}&limit=${pageSize}`)),
        );
        pageResponses.forEach((p: any) => allChildren.push(...(p?.data ?? [])));
      }
      const byAge = Array.from({ length: 19 }, (_, age) => ({ age, count: 0 }));
      allChildren.forEach((c: any) => {
        const age = Number(c.currentAge);
        if (Number.isFinite(age) && age >= 0 && age <= 18) byAge[age].count += 1;
      });
      return byAge;
    },
  });

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">{isBn ? "বয়সভিত্তিক চার্ট (০-১৮)" : "Age Distribution (0-18)"}</CardTitle>
        <CardDescription className="text-xs">
          {isBn ? "১৭ ও ১৮ বছর লাল রঙে দেখানো হয়েছে (ট্রানজিশন/এক্সিট)" : "Ages 17 and 18 are marked in red (transition/exit ages)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[260px]">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis allowDecimals={false} />
              <RechartsTooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} onClick={() => navigate("/children")} className="cursor-pointer">
                {(data ?? []).map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.age >= 17 ? "hsl(0, 72%, 52%)" : "hsl(185, 45%, 35%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function MathematicalTable({ isBn }: { isBn: boolean }) {
  const [search, setSearch] = useState("");
  const [centerFilter, setCenterFilter] = useState("__all");
  const [districtFilter, setDistrictFilter] = useState("__all");
  const [caseTypeFilter, setCaseTypeFilter] = useState("__all");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-mathematical-table"],
    queryFn: async () => {
      const fetchJson = (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json());
      const [centersRes, courtCases] = await Promise.all([
        fetchJson("/api/centers"),
        fetchJson("/api/court-cases"),
      ]);
      const pageSize = 1000;
      const firstChildrenPage = await fetchJson(`/api/children?page=1&limit=${pageSize}`);
      const allChildren: any[] = [...(firstChildrenPage?.data ?? [])];
      const totalChildren = Number(firstChildrenPage?.total ?? allChildren.length);
      const totalPages = Math.max(1, Math.ceil(totalChildren / pageSize));
      if (totalPages > 1) {
        const pageResponses = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) => fetchJson(`/api/children?page=${i + 2}&limit=${pageSize}`)),
        );
        pageResponses.forEach((p: any) => allChildren.push(...(p?.data ?? [])));
      }

      const centers = centersRes?.centers ?? [];
      const centerNameById = new Map<number, string>(
        centers.map((c: any) => [Number(c.id), String((isBn ? (c.centerNameBn || c.centerName) : c.centerName) ?? "")]),
      );
      const latestCaseTypeByChildId = new Map<number, string>();
      (courtCases ?? []).forEach((cc: any) => {
        const childId = Number(cc.childId);
        if (!latestCaseTypeByChildId.has(childId)) {
          latestCaseTypeByChildId.set(childId, String(cc.childCaseType ?? cc.caseNo ?? "—"));
        }
      });

      const rows = allChildren.map((c: any) => {
        const centerName = safeText(isBn ? (centerNameById.get(Number(c.centerId)) || "") : (centerNameById.get(Number(c.centerId)) || ""));
        const centerKey = toCenterKey(centerName);
        return {
          id: Number(c.id),
          childId: safeText(c.childId),
          fullName: safeText(c.fullName),
          age: c.currentAge == null ? "—" : String(c.currentAge),
          caseType: safeText(latestCaseTypeByChildId.get(Number(c.id))),
          district: safeText(c.presentDistrict || c.permanentDistrict),
          centerName,
          centerKey: centerKey ?? "other",
        };
      });

      return rows;
    },
  });

  const districts = useMemo(() => {
    const values = new Set<string>();
    (data ?? []).forEach((r: any) => values.add(r.district));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const caseTypes = useMemo(() => {
    const values = new Set<string>();
    (data ?? []).forEach((r: any) => values.add(r.caseType));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return (data ?? []).filter((r: any) => {
      if (centerFilter !== "__all" && r.centerKey !== centerFilter) return false;
      if (districtFilter !== "__all" && r.district !== districtFilter) return false;
      if (caseTypeFilter !== "__all" && r.caseType !== caseTypeFilter) return false;
      if (!keyword) return true;
      const hay = `${r.childId} ${r.fullName} ${r.age} ${r.caseType} ${r.district} ${r.centerName}`.toLowerCase();
      return hay.includes(keyword);
    });
  }, [data, search, centerFilter, districtFilter, caseTypeFilter]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">{isBn ? "গাণিতিক টেবিল (ঘন ডেটা গ্রিড)" : "Mathematical Table (Dense Data Grid)"}</CardTitle>
        <CardDescription className="text-xs">
          {isBn ? "বয়স, মামলা ধরন, জেলা অনুযায়ী অনুসন্ধান ও মাল্টি-ফিল্টার" : "Search and multi-column filtering by age, case type, district, and center"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 md:grid-cols-4">
          <Input
            placeholder={isBn ? "নাম/আইডি/জেলা/মামলা লিখে খুঁজুন..." : "Search by name/ID/district/case..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={centerFilter} onValueChange={setCenterFilter}>
            <SelectTrigger><SelectValue placeholder={isBn ? "কেন্দ্র" : "Center"} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">{isBn ? "সব কেন্দ্র" : "All Centers"}</SelectItem>
              <SelectItem value="tongi">{centerTitle("tongi", isBn)}</SelectItem>
              <SelectItem value="konabari">{centerTitle("konabari", isBn)}</SelectItem>
              <SelectItem value="fulerhat">{centerTitle("fulerhat", isBn)}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger><SelectValue placeholder={isBn ? "জেলা" : "District"} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">{isBn ? "সব জেলা" : "All Districts"}</SelectItem>
              {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={caseTypeFilter} onValueChange={setCaseTypeFilter}>
            <SelectTrigger><SelectValue placeholder={isBn ? "মামলা ধরন" : "Case Type"} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">{isBn ? "সব মামলা" : "All Case Types"}</SelectItem>
              {caseTypes.map((ct) => <SelectItem key={ct} value={ct}>{ct}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="overflow-auto max-h-[360px] rounded-md border">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted/60 backdrop-blur">
                <tr className="border-b">
                  <th className="px-3 py-2 text-left font-semibold">{isBn ? "শিশু আইডি" : "Child ID"}</th>
                  <th className="px-3 py-2 text-left font-semibold">{isBn ? "নাম" : "Name"}</th>
                  <th className="px-3 py-2 text-left font-semibold">{isBn ? "বয়স" : "Age"}</th>
                  <th className="px-3 py-2 text-left font-semibold">{isBn ? "মামলা" : "Case Type"}</th>
                  <th className="px-3 py-2 text-left font-semibold">{isBn ? "জেলা" : "District"}</th>
                  <th className="px-3 py-2 text-left font-semibold">{isBn ? "কেন্দ্র" : "Center"}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r: any) => (
                  <tr key={r.id} className="border-b hover:bg-muted/40 transition-colors">
                    <td className="px-3 py-2"><Link href={`/children/${r.id}`}><span className="font-mono hover:underline cursor-pointer">{r.childId}</span></Link></td>
                    <td className="px-3 py-2"><Link href={`/children/${r.id}`}><span className="hover:underline cursor-pointer">{r.fullName}</span></Link></td>
                    <td className="px-3 py-2 tabular-nums">{r.age}</td>
                    <td className="px-3 py-2">{r.caseType}</td>
                    <td className="px-3 py-2">{r.district}</td>
                    <td className="px-3 py-2">{r.centerName}</td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                      {isBn ? "কোনো ডেটা পাওয়া যায়নি" : "No data found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FollowUpComparisonWeek({ isBn }: { isBn: boolean }) {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-followup-week-comparison"],
    queryFn: async () => {
      const fetchJson = (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json());
      const [centersRes, followUps] = await Promise.all([
        fetchJson("/api/centers"),
        fetchJson("/api/follow-ups"),
      ]);
      const pageSize = 1000;
      const firstChildrenPage = await fetchJson(`/api/children?page=1&limit=${pageSize}`);
      const allChildren: any[] = [...(firstChildrenPage?.data ?? [])];
      const totalChildren = Number(firstChildrenPage?.total ?? allChildren.length);
      const totalPages = Math.max(1, Math.ceil(totalChildren / pageSize));
      if (totalPages > 1) {
        const pageResponses = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) => fetchJson(`/api/children?page=${i + 2}&limit=${pageSize}`)),
        );
        pageResponses.forEach((p: any) => allChildren.push(...(p?.data ?? [])));
      }

      const centers = centersRes?.centers ?? [];
      const centerNameById = new Map<number, string>(
        centers.map((c: any) => [Number(c.id), String((isBn ? (c.centerNameBn || c.centerName) : c.centerName) ?? "")]),
      );
      const childCenterIdByChildId = new Map<number, number | null>(
        allChildren.map((c: any) => [Number(c.id), c.centerId == null ? null : Number(c.centerId)]),
      );

      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const end = new Date(start);
      end.setDate(end.getDate() + 7);

      const grouped: Record<CenterKey, any[]> = { tongi: [], konabari: [], fulerhat: [] };
      (followUps ?? []).forEach((f: any) => {
        if (!f.followUpDate) return;
        const d = new Date(f.followUpDate);
        const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        if (day < start || day > end) return;
        const childId = Number(f.childId);
        const centerId = childCenterIdByChildId.get(childId);
        const key = toCenterKey(centerId == null ? null : centerNameById.get(centerId));
        if (!key) return;
        grouped[key].push(f);
      });
      (["tongi", "konabari", "fulerhat"] as CenterKey[]).forEach((k) => {
        grouped[k].sort((a, b) => String(a.followUpDate).localeCompare(String(b.followUpDate)));
      });
      return grouped;
    },
  });

  const grouped = data ?? { tongi: [], konabari: [], fulerhat: [] };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">{isBn ? "সাপ্তাহিক পেন্ডিং ফলো-আপ তুলনা" : "Weekly Pending Follow-up Comparison"}</CardTitle>
        <CardDescription className="text-xs">
          {isBn ? "আগামী ৭ দিনের ফলো-আপ (কেন্দ্রভিত্তিক)" : "Upcoming follow-ups within 7 days by center"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {(["tongi", "konabari", "fulerhat"] as CenterKey[]).map((key) => (
              <div key={key} className="rounded-md border bg-muted/20 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold">{centerTitle(key, isBn)}</h4>
                  <Badge variant="outline" className="text-[10px]">{grouped[key].length}</Badge>
                </div>
                <div className="space-y-2 max-h-[190px] overflow-auto">
                  {grouped[key].map((f: any) => (
                    <Link key={f.id} href={`/follow-ups/${f.id}`}>
                      <div className="rounded border bg-white px-2 py-1.5 text-xs hover:bg-muted/50 cursor-pointer">
                        <p className="font-medium truncate">{f.childName ?? `#${f.childId}`}</p>
                        <p className="text-muted-foreground">{f.followUpDate} • {f.visitType ?? "—"}</p>
                      </div>
                    </Link>
                  ))}
                  {grouped[key].length === 0 && (
                    <p className="text-xs text-muted-foreground">{isBn ? "কোনো ফলো-আপ নেই" : "No upcoming follow-ups"}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HearingWeeklyCenterChart({ isBn }: { isBn: boolean }) {
  const [, navigate] = useLocation();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-hearing-weekly-center-chart"],
    queryFn: async () => {
      const fetchJson = (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json());
      const [centersRes, hearings] = await Promise.all([
        fetchJson("/api/centers"),
        fetchJson("/api/court-cases"),
      ]);
      const centers = centersRes?.centers ?? [];
      const centerNameById = new Map<number, string>(
        centers.map((c: any) => [Number(c.id), String((isBn ? (c.centerNameBn || c.centerName) : c.centerName) ?? "")]),
      );

      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return {
          key: d.toISOString().slice(0, 10),
          label: format(d, "EEE dd"),
          tongi: 0,
          konabari: 0,
          fulerhat: 0,
        };
      });
      const dayMap = new Map<string, any>(weekDays.map((d) => [d.key, d]));

      const recent: any[] = [];
      (hearings ?? []).forEach((h: any) => {
        if (!h.nextHearingDate) return;
        const hearingDateKey = String(h.nextHearingDate).slice(0, 10);
        const day = dayMap.get(hearingDateKey);
        if (!day) return;
        const key = toCenterKey(centerNameById.get(Number(h.childCenterId)));
        if (!key) return;
        day[key] += 1;
        recent.push({ ...h, key });
      });

      recent.sort((a, b) => String(a.nextHearingDate).localeCompare(String(b.nextHearingDate)));
      return { chart: weekDays, recent: recent.slice(0, 12) };
    },
  });

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">{isBn ? "সাপ্তাহিক শুনানি ক্যালেন্ডার/চার্ট" : "Weekly Shunani (Hearing) Calendar/Chart"}</CardTitle>
        <CardDescription className="text-xs">
          {isBn ? "কেন্দ্রভিত্তিক শুনানির সংখ্যা (৭ দিনের ভিউ)" : "Weekly hearing counts across centers (7-day view)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-[250px]">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.chart ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="tongi" name="Center Tongi" fill="hsl(205, 30%, 40%)" radius={[3, 3, 0, 0]} onClick={() => navigate("/court-cases")} className="cursor-pointer" />
                <Bar dataKey="konabari" name="Center Konabari" fill="hsl(35, 100%, 50%)" radius={[3, 3, 0, 0]} onClick={() => navigate("/court-cases")} className="cursor-pointer" />
                <Bar dataKey="fulerhat" name="Center Fulerhat" fill="hsl(185, 45%, 35%)" radius={[3, 3, 0, 0]} onClick={() => navigate("/court-cases")} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {!isLoading && (
          <div className="grid gap-2 md:grid-cols-2">
            {(data?.recent ?? []).map((h: any) => (
              <Link key={`${h.id}-${h.nextHearingDate}`} href={`/court-cases/${h.id}`}>
                <div className="rounded border bg-muted/20 px-2.5 py-2 text-xs hover:bg-muted/40 cursor-pointer">
                  <p className="font-medium truncate">{h.childName ?? "—"} • {h.caseNo ?? "—"}</p>
                  <p className="text-muted-foreground">{h.nextHearingDate} • {centerTitle(h.key, isBn)}</p>
                </div>
              </Link>
            ))}
            {(data?.recent ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground">{isBn ? "এই সপ্তাহে কোনো শুনানি নেই" : "No hearings scheduled this week"}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CenterComparisonTable({ isBn }: { isBn: boolean }) {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-center-comparison"],
    queryFn: async () => {
      const fetchJson = (url: string) => fetch(url, { credentials: "include" }).then((r) => r.json());

      const [centersRes, admissions, cases, healthAssessments] = await Promise.all([
        fetchJson("/api/centers"),
        fetchJson("/api/admissions"),
        fetchJson("/api/cases"),
        fetchJson("/api/health-assessments"),
      ]);

      const pageSize = 1000;
      const firstChildrenPage = await fetchJson(`/api/children?page=1&limit=${pageSize}`);
      const allChildren: any[] = [...(firstChildrenPage?.data ?? [])];
      const totalChildren = Number(firstChildrenPage?.total ?? allChildren.length);
      const totalPages = Math.max(1, Math.ceil(totalChildren / pageSize));

      if (totalPages > 1) {
        const pageResponses = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) => fetchJson(`/api/children?page=${i + 2}&limit=${pageSize}`)),
        );
        pageResponses.forEach((p: any) => allChildren.push(...(p?.data ?? [])));
      }

      const centers = centersRes?.centers ?? [];
      const centerNameById = new Map<number, string>(
        centers.map((c: any) => [Number(c.id), String((isBn ? (c.centerNameBn || c.centerName) : c.centerName) ?? "")]),
      );
      const childCenterIdByChildId = new Map<number, number | null>(
        allChildren.map((c: any) => [Number(c.id), c.centerId == null ? null : Number(c.centerId)]),
      );

      const metricByCenter: Record<CenterKey, {
        totalIntake: number;
        totalRejected: number;
        activeCases: number;
        hospitalReferralNeeded: number;
      }> = {
        tongi: { totalIntake: 0, totalRejected: 0, activeCases: 0, hospitalReferralNeeded: 0 },
        konabari: { totalIntake: 0, totalRejected: 0, activeCases: 0, hospitalReferralNeeded: 0 },
        fulerhat: { totalIntake: 0, totalRejected: 0, activeCases: 0, hospitalReferralNeeded: 0 },
      };

      (admissions ?? []).forEach((a: any) => {
        const fromReceiving = toCenterKey(a.receivingCenter);
        const fromChildCenter = toCenterKey(centerNameById.get(Number(a.childCenterId)));
        const key = fromReceiving ?? fromChildCenter;
        if (!key) return;
        metricByCenter[key].totalIntake += 1;
        if (String(a.approvalStatus ?? "").toLowerCase() === "rejected") {
          metricByCenter[key].totalRejected += 1;
        }
      });

      (cases ?? []).forEach((c: any) => {
        const key = toCenterKey(centerNameById.get(Number(c.centerId)));
        if (!key) return;
        const status = String(c.caseStatus ?? "").toLowerCase();
        if (status === "open" || status === "active") {
          metricByCenter[key].activeCases += 1;
        }
      });

      const hospitalizedChildIds: Record<CenterKey, Set<number>> = {
        tongi: new Set<number>(),
        konabari: new Set<number>(),
        fulerhat: new Set<number>(),
      };

      (healthAssessments ?? []).forEach((h: any) => {
        if (!h?.hospitalReferralNeeded) return;
        const childId = Number(h.childId);
        const centerId = childCenterIdByChildId.get(childId);
        const key = toCenterKey(centerId == null ? null : centerNameById.get(centerId));
        if (!key) return;
        hospitalizedChildIds[key].add(childId);
      });

      (["tongi", "konabari", "fulerhat"] as CenterKey[]).forEach((k) => {
        metricByCenter[k].hospitalReferralNeeded = hospitalizedChildIds[k].size;
      });

      return metricByCenter;
    },
  });

  const metric = data ?? {
    tongi: { totalIntake: 0, totalRejected: 0, activeCases: 0, hospitalReferralNeeded: 0 },
    konabari: { totalIntake: 0, totalRejected: 0, activeCases: 0, hospitalReferralNeeded: 0 },
    fulerhat: { totalIntake: 0, totalRejected: 0, activeCases: 0, hospitalReferralNeeded: 0 },
  };

  if (isLoading) return <Skeleton className="h-56 w-full" />;

  return (
    <Card className="border-l-4 border-indigo-400 bg-indigo-50/40 shadow-sm">
      <CardHeader className="pb-2 pt-3.5 px-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-800">
          <span className="h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 bg-indigo-100 text-indigo-700">
            <Activity className="h-3.5 w-3.5" />
          </span>
          {isBn ? "৩টি কেন্দ্রের তুলনামূলক চিত্র" : "3-Center Comparison Table"}
        </CardTitle>
        <CardDescription className="text-xs">
          {isBn ? "টঙ্গী, কোনাবাড়ী ও ফুলেরহাট কেন্দ্রের প্রধান সূচক" : "Key metrics for Tongi, Konabari, and Fulerhat centers"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-1">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-b border-indigo-300/60 bg-white/30 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-4 py-2 text-left text-indigo-800 opacity-70">{isBn ? "সূচক" : "Metric"}</th>
                <th className="px-4 py-2 text-left text-indigo-800 opacity-70">Center Tongi</th>
                <th className="px-4 py-2 text-left text-indigo-800 opacity-70">Center Konabari</th>
                <th className="px-4 py-2 text-left text-indigo-800 opacity-70">Center Fulerhat</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/30 hover:bg-white/40 transition-colors">
                <td className="px-4 py-2.5 font-medium">{isBn ? "মোট ভর্তি (ইনটেক)" : "Total Intake"}</td>
                <td className="px-4 py-2.5 font-semibold tabular-nums">{metric.tongi.totalIntake}</td>
                <td className="px-4 py-2.5 font-semibold tabular-nums">{metric.konabari.totalIntake}</td>
                <td className="px-4 py-2.5 font-semibold tabular-nums">{metric.fulerhat.totalIntake}</td>
              </tr>
              <tr className="border-b border-border/30 hover:bg-white/40 transition-colors">
                <td className="px-4 py-2.5 font-medium">{isBn ? "মোট প্রত্যাখ্যাত" : "Total Rejected"}</td>
                <td className="px-4 py-2.5 font-semibold tabular-nums">{metric.tongi.totalRejected}</td>
                <td className="px-4 py-2.5 font-semibold tabular-nums">{metric.konabari.totalRejected}</td>
                <td className="px-4 py-2.5 font-semibold tabular-nums">{metric.fulerhat.totalRejected}</td>
              </tr>
              <tr className="border-b border-border/30 hover:bg-white/40 transition-colors">
                <td className="px-4 py-2.5 font-medium">{isBn ? "সক্রিয় মামলা" : "Active Cases"}</td>
                <td className="px-4 py-2.5 font-semibold tabular-nums">{metric.tongi.activeCases}</td>
                <td className="px-4 py-2.5 font-semibold tabular-nums">{metric.konabari.activeCases}</td>
                <td className="px-4 py-2.5 font-semibold tabular-nums">{metric.fulerhat.activeCases}</td>
              </tr>
              <tr className="hover:bg-white/40 transition-colors">
                <td className="px-4 py-2.5 font-medium">
                  {isBn ? "হাসপাতাল রেফারেল প্রয়োজন (হাসপাতালে)" : "Hospital Referral Needed (Hospitalized)"}
                </td>
                <td className="px-4 py-2.5 font-semibold tabular-nums">{metric.tongi.hospitalReferralNeeded}</td>
                <td className="px-4 py-2.5 font-semibold tabular-nums">{metric.konabari.hospitalReferralNeeded}</td>
                <td className="px-4 py-2.5 font-semibold tabular-nums">{metric.fulerhat.hospitalReferralNeeded}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Shared alert-table wrapper ──────────────────────────────────────────── */
function AlertTable({
  title, icon: Icon, iconBg, headerClass, borderClass, bgClass,
  columns, rows, emptyMsg, maxRows = 10,
}: {
  title: string; icon: any; iconBg?: string; headerClass: string; borderClass: string; bgClass: string;
  columns: string[]; rows: React.ReactNode[][]; emptyMsg?: string; maxRows?: number;
}) {
  const shown = rows.slice(0, maxRows);
  const extra = rows.length - maxRows;
  return (
    <Card className={`border-l-4 ${borderClass} ${bgClass} shadow-sm`}>
      <CardHeader className="pb-2 pt-3.5 px-4">
        <CardTitle className={`text-sm font-bold flex items-center gap-2 ${headerClass}`}>
          <span className={`h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 ${iconBg ?? "bg-gray-100"}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          {title}
          <span className="ml-auto text-xs font-semibold tabular-nums bg-white/50 px-2 py-0.5 rounded-full">
            {rows.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-1">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-t border-b ${borderClass}/60 bg-white/30 text-[11px] font-bold uppercase tracking-wider`}>
                {columns.map((col, i) => (
                  <th key={i} className={`px-4 py-2 text-left ${headerClass} opacity-70`}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && emptyMsg && (
                <tr><td colSpan={columns.length} className="px-4 py-5 text-center text-xs text-muted-foreground">{emptyMsg}</td></tr>
              )}
              {shown.map((cells, ri) => (
                <tr key={ri} className="border-b border-border/30 hover:bg-white/40 transition-colors last:border-0">
                  {cells.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2.5 align-middle">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {extra > 0 && (
          <p className="text-xs text-muted-foreground text-center pt-2 pb-1.5 font-medium">
            +{extra} আরও / more
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Stat Card ────────────────────────────────────────────────────────────── */
function StatCard({ title, value, icon: Icon, description, isLoading, accent }: any) {
  return (
    <Card className={`overflow-hidden shadow-sm ${accent ?? ""}`}>
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground leading-none mb-2">{title}</p>
            {isLoading
              ? <Skeleton className="h-8 w-16 mt-1" />
              : <p className="text-3xl font-extrabold text-foreground tabular-nums">{value ?? 0}</p>
            }
            {description && !isLoading && (
              <p className="text-xs text-muted-foreground mt-1.5 truncate">{description}</p>
            )}
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── 1. Age 18+ Table ──────────────────────────────────────────────────────── */
function Over18Table({ isBn }: { isBn: boolean }) {
  const { data, isLoading } = useQuery({
    queryKey: ["age-alerts"],
    queryFn: () => fetch("/api/children/age-alerts", { credentials: "include" }).then(r => r.json()),
  });

  const rows: any[] = data?.over18 ?? [];
  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (rows.length === 0) return null;

  return (
    <AlertTable
      title={isBn ? `বয়স ১৮+ — কারাগারে স্থানান্তর প্রয়োজন` : `Age 18+ — Prison Transfer Required`}
      icon={AlertTriangle}
      iconBg="bg-red-100 text-red-700"
      headerClass="text-red-800"
      borderClass="border-red-400"
      bgClass="bg-red-50/60"
      columns={isBn
        ? ["শিশুর নাম", "শিশু আইডি", "বর্তমান বয়স", "জন্ম তারিখ", "অবস্থা"]
        : ["Child Name", "Child ID", "Current Age", "Date of Birth", "Status"]}
      rows={rows.map(c => [
        <Link href={`/children/${c.id}`}><span className="font-medium text-red-900 hover:underline cursor-pointer">{c.fullName}</span></Link>,
        <span className="text-xs text-muted-foreground font-mono">{c.childId}</span>,
        <Badge variant="outline" className="border-red-300 text-red-800 bg-red-100 text-xs font-bold">
          {c.currentAge} {isBn ? "বছর" : "yrs"}
        </Badge>,
        <span className="text-xs">{c.dob ?? "—"}</span>,
        <Badge variant="outline" className={c.currentStatus === "Transferred" ? "border-gray-300 text-gray-600 text-xs" : "border-red-200 text-red-700 text-xs"}>
          {c.currentStatus === "Transferred" ? (isBn ? "স্থানান্তরিত" : "Transferred") : (isBn ? "কেন্দ্রে আছে" : "In Center")}
        </Badge>,
      ])}
    />
  );
}

/* ─── 2. Approaching 18 Table ───────────────────────────────────────────────── */
function Turning18Table({ isBn }: { isBn: boolean }) {
  const { data, isLoading } = useQuery({
    queryKey: ["age-alerts"],
    queryFn: () => fetch("/api/children/age-alerts", { credentials: "include" }).then(r => r.json()),
  });

  const rows: any[] = data?.turning18Soon ?? [];
  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (rows.length === 0) return null;

  return (
    <AlertTable
      title={isBn ? `আগামী ৯০ দিনে ১৮ বছর পূর্ণ হবে` : `Turning 18 in Next 90 Days`}
      icon={CalendarClock}
      iconBg="bg-amber-100 text-amber-700"
      headerClass="text-amber-800"
      borderClass="border-amber-400"
      bgClass="bg-amber-50/60"
      columns={isBn
        ? ["শিশুর নাম", "শিশু আইডি", "বর্তমান বয়স", "১৮তম জন্মদিন", "বাকি দিন"]
        : ["Child Name", "Child ID", "Current Age", "18th Birthday", "Days Left"]}
      rows={rows.map(c => [
        <Link href={`/children/${c.id}`}><span className="font-medium text-amber-900 hover:underline cursor-pointer">{c.fullName}</span></Link>,
        <span className="text-xs text-muted-foreground font-mono">{c.childId}</span>,
        <span className="text-xs font-medium">{c.currentAge} {isBn ? "বছর" : "yrs"}</span>,
        <span className="text-xs font-medium">{c.turns18Date}</span>,
        <Badge variant="outline" className={
          c.daysUntil18 <= 30 ? "border-red-300 text-red-700 bg-red-50 text-xs font-bold" :
          c.daysUntil18 <= 60 ? "border-amber-300 text-amber-700 bg-amber-50 text-xs font-bold" :
          "border-blue-300 text-blue-700 bg-blue-50 text-xs"
        }>
          {c.daysUntil18} {isBn ? "দিন" : "days"}
        </Badge>,
      ])}
    />
  );
}

/* ─── 3. Upcoming Hearings Table ────────────────────────────────────────────── */
function UpcomingHearingsTable({ isBn }: { isBn: boolean }) {
  const { data, isLoading } = useQuery({
    queryKey: ["upcoming-hearings"],
    queryFn: () => fetch("/api/court-cases/upcoming", { credentials: "include" }).then(r => r.json()),
  });

  const rows: any[] = Array.isArray(data) ? data : [];
  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (rows.length === 0) return null;

  const urgencyBadge = (urgency: string, days: number) => {
    if (urgency === "today") return (
      <Badge className="bg-red-600 text-white text-xs">{isBn ? "আজ" : "Today"}</Badge>
    );
    if (urgency === "thisWeek") return (
      <Badge className="bg-amber-500 text-white text-xs">{isBn ? `${days} দিন` : `${days}d`}</Badge>
    );
    return (
      <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">{isBn ? `${days} দিন` : `${days}d`}</Badge>
    );
  };

  return (
    <AlertTable
      title={isBn ? "আসন্ন আদালতের শুনানি (৩০ দিনের মধ্যে)" : "Upcoming Court Hearings (Within 30 Days)"}
      icon={Gavel}
      iconBg="bg-blue-100 text-blue-700"
      headerClass="text-blue-800"
      borderClass="border-blue-400"
      bgClass="bg-blue-50/60"
      columns={isBn
        ? ["শিশুর নাম", "মামলা নং", "আদালত", "পরবর্তী শুনানি", "সময়"]
        : ["Child Name", "Case No.", "Court", "Next Hearing", "Time Left"]}
      rows={rows.map(r => [
        <Link href={`/children/${r.childId}`}><span className="font-medium text-blue-900 hover:underline cursor-pointer">{r.childName ?? "—"}</span></Link>,
        <span className="text-xs font-mono text-muted-foreground">{r.caseNo}</span>,
        <span className="text-xs">{r.courtName}</span>,
        <span className="text-xs font-semibold">{r.nextHearingDate}</span>,
        urgencyBadge(r.urgency, r.daysUntil),
      ])}
    />
  );
}

/* ─── 4. Pending Approval Table ─────────────────────────────────────────────── */
function PendingApprovalTable({ isBn }: { isBn: boolean }) {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["cases-all"],
    queryFn: () => fetch("/api/cases?limit=200", { credentials: "include" }).then(r => r.json()),
  });

  const allCases: any[] = Array.isArray(data) ? data : [];

  const isSuperintendent = hasRole(user, "Superintendent");
  const isProbation = hasRole(user, "Probation Officer");
  const isDf = hasRole(user, "District Facilitator");
  const isCaseWorker = hasRole(user, "Case Worker");
  const isWorkerOrParent = hasRole(user, "Worker", "House Parent");

  const pending = allCases.filter((c: any) => {
    if (isSuperintendent) return c.workflowState === "Reviewed by PO";
    if (isProbation) return c.workflowState === "Reviewed by DF" || c.workflowState === "Sent Back to PO";
    if (isDf) return c.workflowState === "Submitted to DF";
    if (isCaseWorker) return c.workflowState === "Draft";
    if (isWorkerOrParent) return c.workflowState === "Draft";
    return false;
  });

  if (pending.length === 0) return null;

  const titleBn = isSuperintendent ? "চূড়ান্ত অনুমোদনের অপেক্ষায়"
    : isProbation ? "আপনার পর্যালোচনার অপেক্ষায়"
    : isDf ? "জেলা সহায়ক পর্যালোচনার অপেক্ষায়"
    : "অনুমোদনের অপেক্ষায় মামলা";

  const titleEn = isSuperintendent ? "Pending Final Approval"
    : isProbation ? "Awaiting Your Review"
    : isDf ? "Pending DF Review"
    : "Cases Pending Approval";

  const riskBadge = (risk: string) => {
    const cls = risk === "High" ? "bg-red-100 text-red-800 border-red-200"
      : risk === "Medium" ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-green-100 text-green-800 border-green-200";
    const label = risk === "High" ? (isBn ? "উচ্চ" : "High")
      : risk === "Medium" ? (isBn ? "মাঝারি" : "Medium")
      : (isBn ? "কম" : "Low");
    return <Badge variant="outline" className={`text-xs ${cls}`}>{label}</Badge>;
  };

  return (
    <AlertTable
      title={isBn ? titleBn : titleEn}
      icon={CheckSquare}
      iconBg="bg-green-100 text-[#14532d]"
      headerClass="text-[#14532d]"
      borderClass="border-[#14532d]"
      bgClass="bg-green-50/60"
      columns={isBn
        ? ["মামলা আইডি", "শিশুর নাম", "কার্যপ্রবাহ অবস্থা", "ঝুঁকি", "তারিখ"]
        : ["Case ID", "Child Name", "Workflow State", "Risk", "Date"]}
      rows={pending.map((c: any) => [
        <Link href={`/cases/${c.id}`}><span className="font-mono text-xs text-amber-900 hover:underline cursor-pointer font-semibold">{c.caseId}</span></Link>,
        <span className="text-sm font-medium">{c.childName ?? "—"}</span>,
        <span className="text-xs text-muted-foreground">{c.workflowState}</span>,
        riskBadge(c.riskLevel),
        <span className="text-xs text-muted-foreground">{c.createdAt ? format(new Date(c.createdAt), "dd/MM/yy") : "—"}</span>,
      ])}
    />
  );
}

/* ─── Main Dashboard ────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: activities, isLoading: activitiesLoading } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });
  const { data: statusData, isLoading: statusLoading } = useGetChildrenByStatus({ query: { queryKey: getGetChildrenByStatusQueryKey() } });

  const isGlobal = hasRole(user, "Super Admin", "Head Office");
  const roleLabel = getRoleLabel(user?.roleName, isBn);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isGlobal
              ? t("dashboard.nationalOverview")
              : user?.centerName
                ? `${user.centerName} — ${roleLabel}`
                : (isBn ? "সিডিসি সিস্টেমের সংক্ষিপ্ত বিবরণ।" : "Overview of CDC system metrics.")}
          </p>
        </div>
      </div>

      {isGlobal && (
        <div className="space-y-4">
          <MonthlyReportKpiCards isBn={isBn} />
          <div className="grid gap-4 lg:grid-cols-2">
            <AgeTransitionBarChart isBn={isBn} />
            <HearingWeeklyCenterChart isBn={isBn} />
          </div>
          <MathematicalTable isBn={isBn} />
          <FollowUpComparisonWeek isBn={isBn} />
          <CenterComparisonTable isBn={isBn} />
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("dashboard.totalChildren")} value={stats?.totalChildren ?? 0} icon={Users}
          description={`${stats?.admittedChildren ?? 0} ${t("dashboard.currentlyAdmitted")}`}
          isLoading={statsLoading} accent="stat-card-teal" />
        <StatCard title={t("dashboard.openCases")} value={stats?.openCases ?? 0} icon={FileText}
          isLoading={statsLoading} accent="stat-card-blue" />
        <StatCard title={t("dashboard.highRiskAlerts")} value={stats?.highRiskChildren ?? 0} icon={ShieldAlert}
          isLoading={statsLoading} accent="stat-card-red" />
        <StatCard title={t("dashboard.upcomingHearings")} value={stats?.upcomingHearings ?? 0} icon={Scale}
          isLoading={statsLoading} accent="stat-card-amber" />
      </div>

      {/* Alert Tables — 4 sections */}
      <div className="space-y-4">
        <Over18Table isBn={isBn} />
        <Turning18Table isBn={isBn} />
        <UpcomingHearingsTable isBn={isBn} />
        <PendingApprovalTable isBn={isBn} />
      </div>

      {/* Charts + Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t("dashboard.childrenByStatus")}</CardTitle>
            <CardDescription>{t("dashboard.statusDistribution")}</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {statusLoading ? (
              <div className="h-full flex items-center justify-center"><Skeleton className="h-[230px] w-[230px] rounded-full" /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData || []} cx="50%" cy="50%" innerRadius={75} outerRadius={105}
                    paddingAngle={2} dataKey="count" nameKey="status">
                    {(statusData || []).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
            <CardDescription>{t("dashboard.latestUpdates")}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto max-h-[280px]">
            {activitiesLoading ? (
              <div className="space-y-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
              <div className="space-y-5">
                {(activities || []).map((activity) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="mt-0.5 flex-shrink-0">
                      {activity.type === 'admission' && <Users className="h-5 w-5 text-blue-500" />}
                      {activity.type === 'case' && <FileText className="h-5 w-5 text-amber-500" />}
                      {activity.type === 'health' && <HeartPulse className="h-5 w-5 text-red-500" />}
                      {activity.type === 'risk' && <ShieldAlert className="h-5 w-5 text-orange-500" />}
                      {activity.type === 'release' && <ShieldCheck className="h-5 w-5 text-green-500" />}
                      {!['admission','case','health','risk','release'].includes(activity.type) && <Activity className="h-5 w-5 text-gray-400" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.childName ? <span className="font-semibold">{activity.childName}: </span> : null}
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(activity.timestamp), isBn ? "dd/MM/yyyy" : "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
                {(!activities || activities.length === 0) && (
                  <div className="text-sm text-muted-foreground text-center py-8">{t("dashboard.noRecentActivity")}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
