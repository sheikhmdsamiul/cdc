// @ts-nocheck
import { Router, type IRouter } from "express";
import { format } from "date-fns";
import { db } from "@workspace/db";
import {
  childrenTable, casesTable, courtCasesTable, admissionsTable,
  followUpsTable, riskAssessmentsTable, counselingSessionsTable,
  releaseRecordsTable, policeAcquisitionsTable, centersTable,
  guardianVisitsTable, healthAssessmentsTable, familySocioeconomicRecordsTable,
  caseInterventionPlansTable, educationPlansTable,
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentUser } from "../middlewares/auth";

const router: IRouter = Router();

/* ─── Resolve effective centerId for the request ─────────────────────────── */
async function resolveCenter(req: any): Promise<number | null> {
  const user = await getCurrentUser(req);
  if (!user) return null;
  // Center-level user: always scoped to their center, ignore query param
  if (user.centerId) return user.centerId;
  // HQ user: optional ?centerId= filter
  const qp = req.query.centerId;
  if (qp && !isNaN(Number(qp))) return Number(qp);
  return null; // HQ with no filter = all centers
}

function isHQRole(roleName: string | null) {
  return ["Super Admin", "Head Office", "DD Division", "DD District"].includes(roleName ?? "");
}

function isBoyGender(gender: string | null | undefined) {
  const normalized = String(gender ?? "").trim().toLowerCase();
  return normalized === "boy" || normalized === "male";
}

function isGirlGender(gender: string | null | undefined) {
  const normalized = String(gender ?? "").trim().toLowerCase();
  return normalized === "girl" || normalized === "female";
}

function parseDate(value?: string | Date | null) {
  if (!value) return null;
  const parsed = value instanceof Date ? new Date(value) : new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseDateTime(value?: string | Date | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isOnOrBefore(value: string | Date | null | undefined, limit: Date) {
  const parsed = value instanceof Date ? value : parseDate(value);
  return parsed ? parsed.getTime() <= limit.getTime() : false;
}

function latestByChild<T extends { childId: number | null | undefined }>(
  rows: T[],
  getDate: (row: T) => string | Date | null | undefined,
) {
  const result = new Map<number, T>();
  const times = new Map<number, number>();

  rows.forEach((row) => {
    if (!row.childId) return;
    const raw = getDate(row);
    const parsed = raw instanceof Date ? raw : (typeof raw === "string" && raw.includes("T") ? parseDateTime(raw) : parseDate(raw));
    const ts = parsed?.getTime() ?? 0;
    const prev = times.get(row.childId) ?? -Infinity;
    if (ts >= prev) {
      times.set(row.childId, ts);
      result.set(row.childId, row);
    }
  });

  return result;
}

function formatBnDate(value?: string | Date | null) {
  const parsed = value instanceof Date ? value : parseDate(value);
  if (!parsed) return "";
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = String(parsed.getFullYear());
  return `${day}/${month}/${year}`;
}

function toBnDigits(value: string | number) {
  const digits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(value).replace(/\d/g, (d) => digits[Number(d)]);
}

function formatCenterStay(admissionDate?: string | null, reportEnd?: Date) {
  if (!admissionDate || !reportEnd) return "";
  const start = parseDate(admissionDate);
  if (!start || start.getTime() > reportEnd.getTime()) return "";

  let years = reportEnd.getFullYear() - start.getFullYear();
  let months = reportEnd.getMonth() - start.getMonth();
  let days = reportEnd.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(reportEnd.getFullYear(), reportEnd.getMonth(), 0).getDate();
    days += prevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${toBnDigits(years)} বছর`);
  if (months > 0) parts.push(`${toBnDigits(months)} মাস`);
  if (days > 0 || parts.length === 0) parts.push(`${toBnDigits(days)} দিন`);
  return parts.join(" ");
}

function formatAgeFromDob(dob?: string | null, referenceDate?: Date, fallbackYears?: number | null) {
  const birthDate = parseDate(dob);
  if (!birthDate || !referenceDate) {
    return fallbackYears != null ? `${toBnDigits(fallbackYears)} বছর` : "";
  }

  let years = referenceDate.getFullYear() - birthDate.getFullYear();
  let months = referenceDate.getMonth() - birthDate.getMonth();
  let days = referenceDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0).getDate();
    days += prevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${toBnDigits(years)} বছর`);
  if (months > 0) parts.push(`${toBnDigits(months)} মাস`);
  if (days > 0 && years === 0) parts.push(`${toBnDigits(days)} দিন`);
  return parts.join(" ");
}

function joinLines(...values: Array<string | number | null | undefined>) {
  return values.map((value) => (value == null ? "" : String(value).trim())).filter(Boolean).join("\n");
}

function formatAddress(parts: {
  village?: string | null;
  district?: string | null;
  upazila?: string | null;
  address?: string | null;
}) {
  const lines = [
    parts.address,
    parts.village ? `গ্রাম: ${parts.village}` : undefined,
    parts.upazila ? `উপজেলা: ${parts.upazila}` : undefined,
    parts.district ? `জেলা: ${parts.district}` : undefined,
  ].filter(Boolean) as string[];
 
  return lines.join("\n");
}

function boolPair(value?: boolean | null, yesLabel = "হ্যাঁ", noLabel = "না") {
  if (value === true) return [yesLabel, ""];
  if (value === false) return ["", noLabel];
  return ["", ""];
}

function formatMoney(value?: number | null) {
  if (value == null) return "";
  return toBnDigits(value);
}

const OFFICIAL_CENTER_NAMES = {
  tongi: "Child Development Center (Boys) Tongi",
  konabari: "Child Development Center (Girls) Konabari",
  fulerhat: "Child Development Center (Boys) Fulerhat",
} as const;

function normalizeCenterName(centerName?: string | null) {
  const value = String(centerName ?? "").trim();
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized.includes("tongi") || normalized.includes("টঙ্গ")) return OFFICIAL_CENTER_NAMES.tongi;
  if (normalized.includes("konabari") || normalized.includes("কোনাবা")) return OFFICIAL_CENTER_NAMES.konabari;
  if (normalized.includes("fulerhat") || normalized.includes("ফুলেরহাট")) return OFFICIAL_CENTER_NAMES.fulerhat;
  return value;
}

function centerTitleBn(centerName?: string | null) {
  const resolvedName = normalizeCenterName(centerName);
  if (!resolvedName) return "শিশু উন্নয়ন কেন্দ্র";
  if (resolvedName.includes("Tongi")) return "শিশু উন্নয়ন কেন্দ্র (বালক), টঙ্গী, গাজীপুর";
  if (resolvedName.includes("Konabari")) return "শিশু উন্নয়ন কেন্দ্র (বালিকা), কোনাবাড়ী, গাজীপুর";
  if (resolvedName.includes("Fulerhat")) return "শিশু উন্নয়ন কেন্দ্র (বালক), ফুলেরহাট, যশোর";
  return centerName;
}

router.get("/overview", async (req, res) => {
  try {
    const centerId = await resolveCenter(req);

    const cond = centerId ? eq(childrenTable.centerId, centerId) : undefined;
    const caseCond = centerId ? eq(casesTable.centerId, centerId) : undefined;

    const [children, cases] = await Promise.all([
      cond ? db.select().from(childrenTable).where(cond) : db.select().from(childrenTable),
      caseCond ? db.select().from(casesTable).where(caseCond) : db.select().from(casesTable),
    ]);

    // For joined tables, filter by childId list when scoped
    const childIds = centerId ? children.map(c => c.id) : null;

    const filterByChildIds = <T extends { childId?: number | null }>(rows: T[]) =>
      childIds ? rows.filter(r => childIds.includes(r.childId ?? -1)) : rows;

    const [admissions, courtCases, riskAssessments, followUps, counseling, releases, policeReqs, guardianVisits] =
      await Promise.all([
        db.select().from(admissionsTable),
        db.select().from(courtCasesTable),
        db.select().from(riskAssessmentsTable),
        db.select().from(followUpsTable),
        db.select().from(counselingSessionsTable),
        db.select().from(releaseRecordsTable),
        db.select().from(policeAcquisitionsTable),
        db.select().from(guardianVisitsTable),
      ]);

    const filtAdmissions = filterByChildIds(admissions);
    const filtCourt = filterByChildIds(courtCases);
    const filtRisk = filterByChildIds(riskAssessments);
    const filtFollowUp = filterByChildIds(followUps);
    const filtCounseling = filterByChildIds(counseling);
    const filtReleases = filterByChildIds(releases);
    const filtPolice = filterByChildIds(policeReqs);
    const filtGuardian = filterByChildIds(guardianVisits);

    const now = new Date();
    res.json({
      totalChildren: children.length,
      admitted: children.filter(c => c.currentStatus === "Admitted" || c.currentStatus === "Under Care").length,
      released: children.filter(c => c.currentStatus === "Released").length,
      transferred: children.filter(c => c.currentStatus === "Transferred").length,
      male: children.filter(c => isBoyGender(c.gender)).length,
      female: children.filter(c => isGirlGender(c.gender)).length,
      totalCases: cases.length,
      openCases: cases.filter(c => c.caseStatus === "Open" || c.caseStatus === "Active").length,
      closedCases: cases.filter(c => c.caseStatus === "Closed").length,
      totalAdmissions: filtAdmissions.length,
      totalCourtCases: filtCourt.length,
      pendingHearings: filtCourt.filter(c => c.nextHearingDate && new Date(c.nextHearingDate) >= now).length,
      highRisk: filtRisk.filter(r => r.overallRiskLevel === "High").length,
      mediumRisk: filtRisk.filter(r => r.overallRiskLevel === "Medium").length,
      lowRisk: filtRisk.filter(r => r.overallRiskLevel === "Low").length,
      totalFollowUps: filtFollowUp.length,
      totalCounseling: filtCounseling.length,
      totalReleases: filtReleases.length,
      totalPoliceReqs: filtPolice.length,
      totalGuardianVisits: filtGuardian.length,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/children-breakdown", async (req, res) => {
  try {
    const centerId = await resolveCenter(req);
    const cond = centerId ? eq(childrenTable.centerId, centerId) : undefined;

    const query = db.select({
      id: childrenTable.id, gender: childrenTable.gender, currentStatus: childrenTable.currentStatus,
      admissionDate: childrenTable.admissionDate, ageAtAdmission: childrenTable.ageAtAdmission,
      centerId: childrenTable.centerId, admissionSource: childrenTable.admissionSource,
      presentDivision: childrenTable.presentDivision, caseType: childrenTable.caseType,
      centerName: centersTable.centerName,
    }).from(childrenTable).leftJoin(centersTable, eq(childrenTable.centerId, centersTable.id));

    const children = cond ? await query.where(cond) : await query;

    const byStatus: Record<string, number> = {};
    const byGender: Record<string, number> = {};
    const byCenter: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const byCaseType: Record<string, number> = {};
    const byAgeGroup: Record<string, number> = { "0–7": 0, "8–12": 0, "13–15": 0, "16–17": 0, "18+": 0 };
    const byMonth: Record<string, number> = {};

    children.forEach(c => {
      byStatus[c.currentStatus || "Unknown"] = (byStatus[c.currentStatus || "Unknown"] || 0) + 1;
      byGender[c.gender || "Unknown"] = (byGender[c.gender || "Unknown"] || 0) + 1;
      const cn = normalizeCenterName(c.centerName) || "Unknown";
      byCenter[cn] = (byCenter[cn] || 0) + 1;
      const src = c.admissionSource || "Unknown";
      bySource[src] = (bySource[src] || 0) + 1;
      const ct = c.caseType || "Unknown";
      byCaseType[ct] = (byCaseType[ct] || 0) + 1;

      const age = c.ageAtAdmission ?? 0;
      if (age <= 7) byAgeGroup["0–7"]++;
      else if (age <= 12) byAgeGroup["8–12"]++;
      else if (age <= 15) byAgeGroup["13–15"]++;
      else if (age <= 17) byAgeGroup["16–17"]++;
      else byAgeGroup["18+"]++;

      if (c.admissionDate) {
        const m = c.admissionDate.substring(0, 7);
        byMonth[m] = (byMonth[m] || 0) + 1;
      }
    });

    res.json({
      byStatus, byGender, byCenter, bySource, byCaseType, byAgeGroup, byMonth,
      months: Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count })),
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/admissions-monthly", async (req, res) => {
  try {
    const centerId = await resolveCenter(req);
    const cond = centerId ? eq(childrenTable.centerId, centerId) : undefined;

    const query = db.select({
      id: admissionsTable.id, admissionDate: admissionsTable.admissionDate,
      admissionSource: admissionsTable.admissionSource, approvalStatus: admissionsTable.approvalStatus,
      centerId: admissionsTable.centerId,
      childName: childrenTable.fullName, childGender: childrenTable.gender,
    })
      .from(admissionsTable)
      .leftJoin(childrenTable, eq(admissionsTable.childId, childrenTable.id))
      .orderBy(desc(admissionsTable.admissionDate));

    const admissions = cond ? await query.where(cond) : await query;

    const byMonth: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byCenter: Record<string, number> = {};

    admissions.forEach(a => {
      if (a.admissionDate) {
        const m = a.admissionDate.substring(0, 7);
        byMonth[m] = (byMonth[m] || 0) + 1;
      }
      bySource[a.admissionSource || "Unknown"] = (bySource[a.admissionSource || "Unknown"] || 0) + 1;
      byStatus[a.approvalStatus || "Unknown"] = (byStatus[a.approvalStatus || "Unknown"] || 0) + 1;
      const centerKey = a.centerId ? String(a.centerId) : "Unknown";
      byCenter[centerKey] = (byCenter[centerKey] || 0) + 1;
    });

    res.json({
      total: admissions.length, bySource, byStatus, byCenter,
      months: Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count })),
      recent: admissions.slice(0, 20),
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/court-cases", async (req, res) => {
  try {
    const centerId = await resolveCenter(req);
    const cond = centerId ? eq(childrenTable.centerId, centerId) : undefined;

    const query = db.select({
      id: courtCasesTable.id, caseNo: courtCasesTable.caseNo, court: courtCasesTable.court,
      caseType: courtCasesTable.caseType, caseStatus: courtCasesTable.caseStatus,
      filingDate: courtCasesTable.filingDate, nextHearingDate: courtCasesTable.nextHearingDate,
      childName: childrenTable.fullName,
    })
      .from(courtCasesTable)
      .leftJoin(childrenTable, eq(courtCasesTable.childId, childrenTable.id))
      .orderBy(desc(courtCasesTable.nextHearingDate));

    const cases = cond ? await query.where(cond) : await query;

    const now = new Date();
    const byStatus: Record<string, number> = {};
    const byCourt: Record<string, number> = {};
    const byCaseType: Record<string, number> = {};
    const upcoming: typeof cases = [];

    cases.forEach(c => {
      byStatus[c.caseStatus || "Unknown"] = (byStatus[c.caseStatus || "Unknown"] || 0) + 1;
      byCourt[c.court || "Unknown"] = (byCourt[c.court || "Unknown"] || 0) + 1;
      byCaseType[c.caseType || "Unknown"] = (byCaseType[c.caseType || "Unknown"] || 0) + 1;
      if (c.nextHearingDate && new Date(c.nextHearingDate) >= now) upcoming.push(c);
    });

    res.json({
      total: cases.length, byStatus, byCourt, byCaseType,
      upcomingCount: upcoming.length,
      upcomingHearings: upcoming.sort((a, b) =>
        new Date(a.nextHearingDate!).getTime() - new Date(b.nextHearingDate!).getTime()
      ).slice(0, 15),
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/risk-assessments", async (req, res) => {
  try {
    const centerId = await resolveCenter(req);
    const cond = centerId ? eq(childrenTable.centerId, centerId) : undefined;

    const query = db.select({
      id: riskAssessmentsTable.id, overallRiskLevel: riskAssessmentsTable.overallRiskLevel,
      assessmentDate: riskAssessmentsTable.assessmentDate, assessedBy: riskAssessmentsTable.assessedBy,
      childName: childrenTable.fullName, childGender: childrenTable.gender,
      centerId: childrenTable.centerId, centerName: centersTable.centerName,
    })
      .from(riskAssessmentsTable)
      .leftJoin(childrenTable, eq(riskAssessmentsTable.childId, childrenTable.id))
      .leftJoin(centersTable, eq(childrenTable.centerId, centersTable.id))
      .orderBy(desc(riskAssessmentsTable.assessmentDate));

    const assessments = cond ? await query.where(cond) : await query;

    const byLevel: Record<string, number> = {};
    const byCenter: Record<string, number> = {};

    assessments.forEach(a => {
      byLevel[a.overallRiskLevel || "Unknown"] = (byLevel[a.overallRiskLevel || "Unknown"] || 0) + 1;
      const cn = a.centerName || "Unknown";
      byCenter[cn] = (byCenter[cn] || 0) + 1;
    });

    res.json({ total: assessments.length, byLevel, byCenter, recent: assessments.slice(0, 20) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/follow-ups", async (req, res) => {
  try {
    const centerId = await resolveCenter(req);
    const cond = centerId ? eq(childrenTable.centerId, centerId) : undefined;

    const query = db.select({
      id: followUpsTable.id, visitType: followUpsTable.visitType,
      followUpDate: followUpsTable.followUpDate, nextAction: followUpsTable.nextAction,
      childName: childrenTable.fullName, centerName: centersTable.centerName,
    })
      .from(followUpsTable)
      .leftJoin(childrenTable, eq(followUpsTable.childId, childrenTable.id))
      .leftJoin(centersTable, eq(childrenTable.centerId, centersTable.id))
      .orderBy(desc(followUpsTable.followUpDate));

    const followUps = cond ? await query.where(cond) : await query;

    const byType: Record<string, number> = {};
    const byCenter: Record<string, number> = {};
    const byMonth: Record<string, number> = {};

    followUps.forEach(f => {
      byType[f.visitType || "Unknown"] = (byType[f.visitType || "Unknown"] || 0) + 1;
      const cn = f.centerName || "Unknown";
      byCenter[cn] = (byCenter[cn] || 0) + 1;
      if (f.followUpDate) {
        const m = f.followUpDate.substring(0, 7);
        byMonth[m] = (byMonth[m] || 0) + 1;
      }
    });

    res.json({
      total: followUps.length, byType, byCenter,
      months: Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count })),
      recent: followUps.slice(0, 20),
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/releases", async (req, res) => {
  try {
    const centerId = await resolveCenter(req);
    const cond = centerId ? eq(childrenTable.centerId, centerId) : undefined;

    const query = db.select({
      id: releaseRecordsTable.id, releaseType: releaseRecordsTable.releaseType,
      releaseDate: releaseRecordsTable.releaseDate, handedOverTo: releaseRecordsTable.handedOverTo,
      authorityApproval: releaseRecordsTable.authorityApproval,
      childName: childrenTable.fullName, childGender: childrenTable.gender,
      centerName: centersTable.centerName,
    })
      .from(releaseRecordsTable)
      .leftJoin(childrenTable, eq(releaseRecordsTable.childId, childrenTable.id))
      .leftJoin(centersTable, eq(childrenTable.centerId, centersTable.id))
      .orderBy(desc(releaseRecordsTable.releaseDate));

    const releases = cond ? await query.where(cond) : await query;

    const byType: Record<string, number> = {};
    const byCenter: Record<string, number> = {};
    const byMonth: Record<string, number> = {};
    const byHandedTo: Record<string, number> = {};

    releases.forEach(r => {
      byType[r.releaseType || "Unknown"] = (byType[r.releaseType || "Unknown"] || 0) + 1;
      byCenter[r.centerName || "Unknown"] = (byCenter[r.centerName || "Unknown"] || 0) + 1;
      byHandedTo[r.handedOverTo || "Unknown"] = (byHandedTo[r.handedOverTo || "Unknown"] || 0) + 1;
      if (r.releaseDate) {
        const m = r.releaseDate.substring(0, 7);
        byMonth[m] = (byMonth[m] || 0) + 1;
      }
    });

    res.json({
      total: releases.length, byType, byCenter, byHandedTo,
      months: Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count })),
      recent: releases.slice(0, 20),
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/counseling", async (req, res) => {
  try {
    const centerId = await resolveCenter(req);
    const cond = centerId ? eq(childrenTable.centerId, centerId) : undefined;

    const query = db.select({
      id: counselingSessionsTable.id, sessionType: counselingSessionsTable.sessionType,
      sessionDate: counselingSessionsTable.sessionDate, counselor: counselingSessionsTable.counselor,
      childName: childrenTable.fullName, centerName: centersTable.centerName,
    })
      .from(counselingSessionsTable)
      .leftJoin(childrenTable, eq(counselingSessionsTable.childId, childrenTable.id))
      .leftJoin(centersTable, eq(childrenTable.centerId, centersTable.id))
      .orderBy(desc(counselingSessionsTable.sessionDate));

    const sessions = cond ? await query.where(cond) : await query;

    const byType: Record<string, number> = {};
    const byCenter: Record<string, number> = {};
    const byMonth: Record<string, number> = {};

    sessions.forEach(s => {
      byType[s.sessionType || "Unknown"] = (byType[s.sessionType || "Unknown"] || 0) + 1;
      byCenter[s.centerName || "Unknown"] = (byCenter[s.centerName || "Unknown"] || 0) + 1;
      if (s.sessionDate) {
        const m = s.sessionDate.substring(0, 7);
        byMonth[m] = (byMonth[m] || 0) + 1;
      }
    });

    res.json({
      total: sessions.length, byType, byCenter,
      months: Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count })),
      recent: sessions.slice(0, 20),
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/monthly-report", async (req, res) => {
  try {
    const now = new Date();
    const month = Math.min(12, Math.max(1, Number(req.query.month) || (now.getMonth() + 1)));
    const year = Math.max(2000, Number(req.query.year) || now.getFullYear());
    const reportStart = new Date(year, month - 1, 1);
    const reportEnd = new Date(year, month, 0);
    reportEnd.setHours(23, 59, 59, 999);

    const centerId = await resolveCenter(req);

    const [
      children,
      admissions,
      courts,
      health,
      family,
      risk,
      followUps,
      releases,
      counseling,
      centers,
      educationPlans,
    ] = await Promise.all([
      db.select({
        id: childrenTable.id,
        childId: childrenTable.childId,
        centerId: childrenTable.centerId,
        centerName: centersTable.centerName,
        fullName: childrenTable.fullName,
        motherName: childrenTable.motherName,
        fatherName: childrenTable.fatherName,
        dateOfBirth: childrenTable.dateOfBirth,
        ageAtAdmission: childrenTable.ageAtAdmission,
        verifiedAge: childrenTable.verifiedAge,
        verifiedDob: childrenTable.verifiedDob,
        admissionDate: childrenTable.admissionDate,
        arrivalDistrict: childrenTable.arrivalDistrict,
        presentDistrict: childrenTable.presentDistrict,
        presentUpazila: childrenTable.presentUpazila,
        presentVillage: childrenTable.presentVillage,
        presentAddress: childrenTable.presentAddress,
        permanentVillage: childrenTable.permanentVillage,
        permanentUpazila: childrenTable.permanentUpazila,
        permanentDistrict: childrenTable.permanentDistrict,
        permanentAddress: childrenTable.permanentAddress,
        admissionSource: childrenTable.admissionSource,
        judicialStatus: childrenTable.judicialStatus,
        educationLevel: childrenTable.educationLevel,
        skills: childrenTable.skills,
        futureGoal: childrenTable.futureGoal,
        childRisk: childrenTable.childRisk,
      })
        .from(childrenTable)
        .leftJoin(centersTable, eq(childrenTable.centerId, centersTable.id)),
      db.select({
        childId: admissionsTable.childId,
        admissionDate: admissionsTable.admissionDate,
        admissionCenterId: admissionsTable.centerId,
      }).from(admissionsTable),
      db.select({
        childId: courtCasesTable.childId,
        policeStationName: courtCasesTable.policeStationName,
        grNumber: courtCasesTable.grNumber,
        caseNo: courtCasesTable.caseNo,
        legalSection: courtCasesTable.legalSection,
        legalAidType: courtCasesTable.legalAidType,
        courtName: courtCasesTable.courtName,
        hearingDate: courtCasesTable.hearingDate,
        lastHearingDate: courtCasesTable.lastHearingDate,
        nextHearingDate: courtCasesTable.nextHearingDate,
        childCaseType: courtCasesTable.childCaseType,
        previousCaseInvolvement: courtCasesTable.previousCaseInvolvement,
        updatedAt: courtCasesTable.updatedAt,
      }).from(courtCasesTable),
      db.select({
        childId: healthAssessmentsTable.childId,
        assessmentDate: healthAssessmentsTable.assessmentDate,
        height: healthAssessmentsTable.height,
        weight: healthAssessmentsTable.weight,
        congenitalDiseaseInfo: healthAssessmentsTable.congenitalDiseaseInfo,
        hasHereditaryDiseaseHistory: healthAssessmentsTable.hasHereditaryDiseaseHistory,
        hereditaryDiseaseDetails: healthAssessmentsTable.hereditaryDiseaseDetails,
        hasDisability: healthAssessmentsTable.hasDisability,
        substanceAbuse: healthAssessmentsTable.substanceAbuse,
        gbvSurvivor: healthAssessmentsTable.gbvSurvivor,
        createdAt: healthAssessmentsTable.createdAt,
      }).from(healthAssessmentsTable),
      db.select({
        childId: familySocioeconomicRecordsTable.childId,
        parentsEducation: familySocioeconomicRecordsTable.parentsEducation,
        parentsOccupation: familySocioeconomicRecordsTable.parentsOccupation,
        parentsMonthlyIncome: familySocioeconomicRecordsTable.parentsMonthlyIncome,
        socioeconomicStatus: familySocioeconomicRecordsTable.socioeconomicStatus,
        parentsContactNumber: familySocioeconomicRecordsTable.parentsContactNumber,
        childRelationshipWithParents: familySocioeconomicRecordsTable.childRelationshipWithParents,
        siblingsCountAndOrder: familySocioeconomicRecordsTable.siblingsCountAndOrder,
        isMarried: familySocioeconomicRecordsTable.isMarried,
        childrenCount: familySocioeconomicRecordsTable.childrenCount,
        familyType: familySocioeconomicRecordsTable.familyType,
        parentsMaritalStatus: familySocioeconomicRecordsTable.parentsMaritalStatus,
        guardianType: familySocioeconomicRecordsTable.guardianType,
        isOrphan: familySocioeconomicRecordsTable.isOrphan,
        familyMemberSubstanceAbuse: familySocioeconomicRecordsTable.familyMemberSubstanceAbuse,
        familyCriminalInvolvement: familySocioeconomicRecordsTable.familyCriminalInvolvement,
        peerCircleInfo: familySocioeconomicRecordsTable.peerCircleInfo,
        updatedAt: familySocioeconomicRecordsTable.updatedAt,
      }).from(familySocioeconomicRecordsTable),
      db.select({
        childId: riskAssessmentsTable.childId,
        assessmentDate: riskAssessmentsTable.assessmentDate,
        previousOccupation: riskAssessmentsTable.previousOccupation,
        childNature: riskAssessmentsTable.childNature,
        communicationSkill: riskAssessmentsTable.communicationSkill,
        communicationWithGuardian: riskAssessmentsTable.communicationWithGuardian,
        educationTrainingInfo: riskAssessmentsTable.educationTrainingInfo,
        childCounselingStatus: riskAssessmentsTable.childCounselingStatus,
        familyCounselingStatus: riskAssessmentsTable.familyCounselingStatus,
        recreationArrangement: riskAssessmentsTable.recreationArrangement,
        otherRehabilitationInfo: riskAssessmentsTable.otherRehabilitationInfo,
        protectionMeasures: riskAssessmentsTable.protectionMeasures,
        updatedAt: riskAssessmentsTable.updatedAt,
        status: riskAssessmentsTable.status,
      }).from(riskAssessmentsTable),
      db.select({
        childId: followUpsTable.childId,
        followUpDate: followUpsTable.followUpDate,
        visitType: followUpsTable.visitType,
        observation: followUpsTable.observation,
        createdAt: followUpsTable.createdAt,
      }).from(followUpsTable),
      db.select({
        childId: releaseRecordsTable.childId,
        releaseDate: releaseRecordsTable.releaseDate,
        releaseType: releaseRecordsTable.releaseType,
        handedOverTo: releaseRecordsTable.handedOverTo,
        remarks: releaseRecordsTable.remarks,
        createdAt: releaseRecordsTable.createdAt,
      }).from(releaseRecordsTable),
      db.select({
        childId: counselingSessionsTable.childId,
        sessionDate: counselingSessionsTable.sessionDate,
        outcome: counselingSessionsTable.outcome,
        createdAt: counselingSessionsTable.createdAt,
      }).from(counselingSessionsTable),
      db.select().from(centersTable),
      db.select({
        childId: educationPlansTable.childId,
        programType: educationPlansTable.programType,
        admissionEligibleFor: educationPlansTable.admissionEligibleFor,
        recordTitle: educationPlansTable.recordTitle,
        tradeName: educationPlansTable.tradeName,
        startDate: educationPlansTable.startDate,
        createdAt: educationPlansTable.createdAt,
      }).from(educationPlansTable),
    ]);

    const latestAdmissionByChild = latestByChild(
      admissions.filter((row) => isOnOrBefore(row.admissionDate, reportEnd)),
      (row) => row.admissionDate,
    );

    const childrenWithResolvedCenter = children.map((child) => {
      const admission = latestAdmissionByChild.get(child.id);
      // Use child's direct centerId first; fall back to admission's center
      const resolvedCenterId = child.centerId ?? admission?.admissionCenterId ?? null;
      const resolvedCenterName = normalizeCenterName(child.centerName)
        ?? (admission?.admissionCenterId
          ? normalizeCenterName(centers.find(c => c.id === admission.admissionCenterId)?.centerName)
          : null)
        ?? null;
      return {
        ...child,
        resolvedCenterId,
        resolvedCenterName,
      };
    });

    const filteredChildren = childrenWithResolvedCenter.filter((child) => {
      if (centerId && child.resolvedCenterId !== centerId) return false;
      return isOnOrBefore(child.admissionDate, reportEnd);
    });

    const releaseByChild = latestByChild(
      releases.filter((row) => isOnOrBefore(row.releaseDate ?? row.createdAt, reportEnd)),
      (row) => row.releaseDate ?? row.createdAt,
    );
    const courtByChild = latestByChild(
      courts,
      (row) => row.updatedAt ?? row.hearingDate ?? row.lastHearingDate ?? row.nextHearingDate,
    );
    const healthByChild = latestByChild(
      health.filter((row) => isOnOrBefore(row.assessmentDate ?? row.createdAt, reportEnd)),
      (row) => row.assessmentDate ?? row.createdAt,
    );
    const familyByChild = latestByChild(
      family.filter((row) => isOnOrBefore(row.updatedAt, reportEnd)),
      (row) => row.updatedAt,
    );
    const riskByChild = latestByChild(
      risk.filter((row) => isOnOrBefore(row.assessmentDate ?? row.updatedAt, reportEnd) && row.status !== "Draft"),
      (row) => row.assessmentDate ?? row.updatedAt,
    );
    const followUpByChild = latestByChild(
      followUps.filter((row) => isOnOrBefore(row.followUpDate ?? row.createdAt, reportEnd)),
      (row) => row.followUpDate ?? row.createdAt,
    );
    const counselingByChild = latestByChild(
      counseling.filter((row) => isOnOrBefore(row.sessionDate ?? row.createdAt, reportEnd)),
      (row) => row.sessionDate ?? row.createdAt,
    );
    const childEduPlansMap = new Map<number, typeof educationPlans>();
    for (const ep of educationPlans.filter((row) => isOnOrBefore(row.startDate ?? row.createdAt, reportEnd))) {
      if (ep.childId != null) {
        const plans = childEduPlansMap.get(ep.childId) || [];
        plans.push(ep);
        childEduPlansMap.set(ep.childId, plans);
      }
    }

    const activeChildren = filteredChildren.filter((child) => {
      const release = releaseByChild.get(child.id);
      if (!release?.releaseDate) return true;
      const releaseDate = parseDate(release.releaseDate);
      return !releaseDate || releaseDate.getTime() > reportEnd.getTime();
    });

    const selectedCenterName = centerId
      ? (normalizeCenterName(centers.find((center) => center.id === centerId)?.centerName) ?? filteredChildren[0]?.resolvedCenterName ?? null)
      : (activeChildren[0]?.resolvedCenterName ?? null);

    const rows = activeChildren.map((child, index) => {
      const court = courtByChild.get(child.id);
      const healthRow = healthByChild.get(child.id);
      const familyRow = familyByChild.get(child.id);
      const riskRow = riskByChild.get(child.id);
      const followUp = followUpByChild.get(child.id);
      const release = releaseByChild.get(child.id);
      const counselingRow = counselingByChild.get(child.id);

      const childEduPlans = childEduPlansMap.get(child.id) ?? [];
      const admissionEligibleFor = childEduPlans.find(p => p.programType === "Admission Form")?.admissionEligibleFor
        ?? childEduPlans.find(p => p.admissionEligibleFor)?.admissionEligibleFor;
      const trainingNames = childEduPlans
        .filter(p => p.programType === "Education" || p.programType === "Vocational")
        .map(p => joinLines(p.recordTitle, p.tradeName).replace(/\n/g, " - "))
        .filter(Boolean)
        .join(", ");

      const [congenitalYes, congenitalNo] = boolPair(Boolean(healthRow?.congenitalDiseaseInfo), "হ্যা", "না");
      const [disabilityYes, disabilityNo] = boolPair(healthRow?.hasDisability, "হ্যাঁ", "না");
      const [substanceYes, substanceNo] = boolPair(healthRow?.substanceAbuse, "হ্যাঁ", "না");
      const [gbvYes, gbvNo] = boolPair(healthRow?.gbvSurvivor, "হ্যাঁ", "না");
      const [orphanYes, orphanNo] = boolPair(familyRow?.isOrphan, "হ্যাঁ", "না");
      const [familySubstanceYes, familySubstanceNo] = boolPair(familyRow?.familyMemberSubstanceAbuse, "হ্যাঁ", "না");

      const admissionSource = child.admissionSource ?? "";
      const familyType = familyRow?.familyType ?? "";
      const maritalStatus = familyRow?.parentsMaritalStatus ?? "";
      const guardianType = familyRow?.guardianType ?? "";

      const caseLine = joinLines(
        court?.policeStationName ? `${court.policeStationName} থানার মামলা` : undefined,
        court?.caseNo ? `মামলা নং-${court.caseNo}` : undefined,
        court?.grNumber ? `জিআর-${court.grNumber}` : undefined,
        court?.legalSection ? `ধারা: ${court.legalSection}` : undefined,
      ).replace(/\n/g, ", ");

      const row = [
        toBnDigits(index + 1),
        child.childId ?? "",
        joinLines(
          child.fullName,
          child.motherName ? `মাতা: ${child.motherName}` : undefined,
          child.fatherName ? `পিতা: ${child.fatherName}` : undefined,
        ),
        formatAddress({
          address: child.permanentAddress,
          village: child.permanentVillage,
          upazila: child.permanentUpazila,
          district: child.permanentDistrict,
        }),
        formatAddress({
          address: child.presentAddress,
          village: child.presentVillage,
          upazila: child.presentUpazila,
          district: child.presentDistrict,
        }),
        formatAgeFromDob(child.verifiedDob, reportEnd, child.verifiedAge),
        formatAgeFromDob(child.dateOfBirth, reportEnd, child.ageAtAdmission),
        formatBnDate(child.admissionDate),
        child.arrivalDistrict ?? child.presentDistrict ?? "",
        formatCenterStay(child.admissionDate, reportEnd),
        admissionSource === "আইনের সংঘাতে জড়িত শিশু" || admissionSource === "আইনের সংঘাতে জড়িত শিশু" ? "হ্যা" : "না",
        admissionSource === "আইনের সংস্পর্শে আসা শিশু" ? "হ্যা" : "না",
        child.judicialStatus ?? "",
        child.educationLevel ?? "",
        child.skills ?? "",
        child.futureGoal ?? "",
        child.childRisk ?? "",
        caseLine,
        court?.legalAidType === "family_support" ? "পারিবারিক সহায়তা" : court?.legalAidType === "ngo_support" ? "এনজিও সহায়তা" : court?.legalAidType === "government_legal_aid" ? "সরকারি আইনি সহায়তা" : court?.legalAidType ?? "",
        court?.courtName ?? "",
        formatBnDate(court?.hearingDate ?? court?.lastHearingDate),
        formatBnDate(court?.nextHearingDate),
        court?.childCaseType ?? "",
        court?.previousCaseInvolvement === true ? "হ্যাঁ" : court?.previousCaseInvolvement === false ? "না" : "",
        healthRow?.height || healthRow?.weight
          ? `উচ্চতা-${healthRow?.height ? toBnDigits(healthRow.height) : ""} সেমি, ওজন-${healthRow?.weight ? toBnDigits(healthRow.weight) : ""} কেজি`
          : "",
        congenitalYes,
        congenitalNo,
        healthRow?.hereditaryDiseaseDetails ?? (healthRow?.hasHereditaryDiseaseHistory ? "আছে" : "নাই"),
        disabilityYes,
        disabilityNo,
        substanceYes,
        substanceNo,
        gbvYes,
        gbvNo,
        familyRow?.parentsEducation ?? "",
        familyRow?.parentsOccupation ?? "",
        formatMoney(familyRow?.parentsMonthlyIncome),
        familyRow?.socioeconomicStatus ?? "",
        familyRow?.parentsContactNumber ?? "",
        familyRow?.childRelationshipWithParents ?? "",
        familyRow?.siblingsCountAndOrder ?? "",
        familyRow?.isMarried ? "হ্যাঁ" : familyRow?.isMarried === false ? "না" : "",
        familyRow?.childrenCount != null ? toBnDigits(familyRow.childrenCount) : "",
        familyType === "একক" || familyType?.toLowerCase() === "nuclear" ? "একক" : "",
        familyType === "যৌথ" || familyType?.toLowerCase() === "joint" ? "যৌথ" : "",
        maritalStatus === "সহাবস্থান" || maritalStatus?.toLowerCase() === "married" || maritalStatus?.toLowerCase() === "cohabitation" ? "সহাবস্থান" : "",
        maritalStatus === "বিবাহ বিচ্ছেদ" || maritalStatus?.toLowerCase() === "divorced" || maritalStatus?.toLowerCase() === "separated" ? "বিবাহ বিচ্ছেদ" : "",
        guardianType === "পিতা" || guardianType === "মাতা" || guardianType?.toLowerCase() === "parents" || guardianType?.toLowerCase() === "father" || guardianType?.toLowerCase() === "mother" ? (guardianType === "Parents" ? "পিতা/মাতা" : guardianType) : "",
        guardianType && guardianType !== "পিতা" && guardianType !== "মাতা" && guardianType?.toLowerCase() !== "parents" && guardianType?.toLowerCase() !== "father" && guardianType?.toLowerCase() !== "mother" ? guardianType : "",
        orphanYes,
        orphanNo,
        familySubstanceYes,
        familySubstanceNo,
        familyRow?.familyCriminalInvolvement === true ? "হ্যাঁ" : familyRow?.familyCriminalInvolvement === false ? "না" : "",
        familyRow?.peerCircleInfo ?? "",
        riskRow?.previousOccupation ?? "",
        riskRow?.childNature ?? "",
        riskRow?.communicationSkill ?? "",
        riskRow?.communicationWithGuardian ?? "",
        joinLines(admissionEligibleFor, trainingNames).replace(/\n/g, ", ") || riskRow?.educationTrainingInfo || joinLines(child.educationLevel, child.skills).replace(/\n/g, ", "),
        riskRow?.childCounselingStatus ?? "",
        riskRow?.familyCounselingStatus ?? "",
        riskRow?.recreationArrangement ?? "",
        riskRow?.otherRehabilitationInfo ?? "",
        release?.releaseType ?? "",
        release?.handedOverTo ? formatBnDate(release.releaseDate) : "",
        followUp?.followUpDate
          ? `${formatBnDate(followUp.followUpDate)}${followUp.visitType ? ` (${followUp.visitType})` : ""}`
          : (followUp?.visitType ?? ""),
        joinLines(release?.remarks, followUp?.observation, counselingRow?.outcome),
      ];

      return row;
    });

    res.json({
      month,
      year,
      monthLabel: toBnDigits(month),
      centerId,
      centerName: selectedCenterName,
      centerTitle: centerTitleBn(selectedCenterName),
      reportStart: reportStart.toISOString(),
      reportEnd: reportEnd.toISOString(),
      total: rows.length,
      rows,
    });
  } catch (err: any) {
    console.error("[monthly-report] Error:", err?.stack ?? String(err));
    res.status(500).json({ error: String(err), stack: err?.stack ?? "" });
  }
});

/* ─── Center comparison — HQ only ────────────────────────────────────────── */
router.get("/center-comparison", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user || (!isHQRole(user.roleName) && user.centerId !== null)) {
      res.status(403).json({ error: "Access restricted to Head Office" });
      return;
    }

    const centers = await db.select().from(centersTable);
    const children = await db.select({
      id: childrenTable.id, centerId: childrenTable.centerId,
      currentStatus: childrenTable.currentStatus, gender: childrenTable.gender,
    }).from(childrenTable);
    const cases = await db.select({
      id: casesTable.id, centerId: casesTable.centerId, caseStatus: casesTable.caseStatus,
    }).from(casesTable);
    const counseling = await db.select({ id: counselingSessionsTable.id, centerId: childrenTable.centerId })
      .from(counselingSessionsTable)
      .leftJoin(childrenTable, eq(counselingSessionsTable.childId, childrenTable.id));
    const releases = await db.select({ id: releaseRecordsTable.id, centerId: childrenTable.centerId })
      .from(releaseRecordsTable)
      .leftJoin(childrenTable, eq(releaseRecordsTable.childId, childrenTable.id));
    const risk = await db.select({ id: riskAssessmentsTable.id, centerId: childrenTable.centerId,
      overallRiskLevel: riskAssessmentsTable.overallRiskLevel })
      .from(riskAssessmentsTable)
      .leftJoin(childrenTable, eq(riskAssessmentsTable.childId, childrenTable.id));

    const result = centers.map(center => ({
      centerId: center.id,
      centerName: center.name,
      location: center.location,
      totalChildren: children.filter(c => c.centerId === center.id).length,
      admitted: children.filter(c => c.centerId === center.id && (c.currentStatus === "Admitted" || c.currentStatus === "Under Care")).length,
      released: children.filter(c => c.centerId === center.id && c.currentStatus === "Released").length,
      male: children.filter(c => c.centerId === center.id && isBoyGender(c.gender)).length,
      female: children.filter(c => c.centerId === center.id && isGirlGender(c.gender)).length,
      openCases: cases.filter(c => c.centerId === center.id && (c.caseStatus === "Open" || c.caseStatus === "Active")).length,
      highRisk: risk.filter(r => r.centerId === center.id && r.overallRiskLevel === "High").length,
      counselingSessions: counseling.filter(c => c.centerId === center.id).length,
      releases: releases.filter(r => r.centerId === center.id).length,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

const AGE_GROUPS = [
  { label: "৯ বছরের নিচে", min: 0, max: 8 },
  { label: "৯–১০ বছর", min: 9, max: 10 },
  { label: "১০–১২ বছর", min: 11, max: 12 },
  { label: "১২–১৬ বছর", min: 13, max: 15 },
  { label: "১৬–১৮ বছর", min: 16, max: 17 },
  { label: "১৮ বছরের ঊর্ধ্বে", min: 18, max: 999 },
  { label: "বয়স উল্লেখ নেই", min: -1, max: -1 },
];

const CASE_TYPES = [
  "হত্যা",
  "নারী ও শিশু নির্যাতন",
  "মাদক",
  "দ্রুত বিচার",
  "ছিনতাই",
  "চুরি মামলা",
  "অস্ত্র মামলা",
  "মারামারি",
  "সাধারন ডায়েরী",
  "ডাকাতী",
  "তথ্য ও প্রযুক্তি/পর্নোগ্রাফি",
  "বিস্ফোরক দ্রব্য বিশেষ ক্ষমতা আইন",
  "বিবিধ",
  "সন্ত্রাস বিরোধী আইন",
  "বৈদেশিক নাগরিক আইন",
];

const TRIAL_STATUSES = [
  "বিচারাধীন",
  "বিচারে দোষী সাব্যস্ত",
  "আটকাদেশ",
  "অভিভাবক মামলায় বিচারাধীন",
  "অভিভাবক মামলায় আটকাদেশ",
  "উল্লেখ নাই",
];

const STAY_DURATIONS = [
  { label: "<৬ মাস", maxMonths: 6 },
  { label: "৬–১২ মাস", minMonths: 6, maxMonths: 12 },
  { label: "১–২ বছর", minMonths: 12, maxMonths: 24 },
  { label: "২+ বছর", minMonths: 24 },
];

const COURT_APPEARANCES = [
  "০১ বারও কোর্টে যায়নি (চলতি মাস)",
  "০১ বার (চলতি মাস)",
  "০২ বার (চলতি মাস)",
  "তলবমতে",
];

function calculateAge(dateOfBirth: Date | null, admissionDate: Date): number | null {
  if (!dateOfBirth) return null;
  const birthYear = dateOfBirth.getFullYear();
  const birthMonth = dateOfBirth.getMonth();
  const birthDay = dateOfBirth.getDate();
  const admitYear = admissionDate.getFullYear();
  const admitMonth = admissionDate.getMonth();
  const admitDay = admissionDate.getDate();
  let age = admitYear - birthYear;
  if (admitMonth < birthMonth || (admitMonth === birthMonth && admitDay < birthDay)) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

function getAgeGroup(age: number | null): string {
  if (age === null) return "বয়স উল্লেখ নেই";
  for (const group of AGE_GROUPS) {
    if (group.min === -1) continue;
    if (age >= group.min && age <= group.max) return group.label;
  }
  return "বয়স উল্লেখ নেই";
}

function getStayDuration(admissionDate: Date, reportDate: Date): string {
  const months = (reportDate.getFullYear() - admissionDate.getFullYear()) * 12 + (reportDate.getMonth() - admissionDate.getMonth());
  if (months < 6) return "<৬ মাস";
  if (months < 12) return "৬–১২ মাস";
  if (months < 24) return "১–২ বছর";
  return "২+ বছর";
}

function normalizeCaseType(caseType: string | null): string {
  if (!caseType) return "বিবিধ";
  const normalized = caseType.toLowerCase().trim();
  if (normalized.includes("হত্যা") || normalized.includes("murder") || normalized.includes("homicide")) return "হত্যা";
  if (normalized.includes("নারী ও শিশু নির্যাতন") || normalized.includes("women and children") || normalized.includes("abuse")) return "নারী ও শিশু নির্যাতন";
  if (normalized.includes("মাদক") || normalized.includes("drug")) return "মাদক";
  if (normalized.includes("দ্রুত বিচার") || normalized.includes("speedy") || normalized.includes("accelerated")) return "দ্রুত বিচার";
  if (normalized.includes("ছিনতাই") || normalized.includes("snatching") || normalized.includes("robbery")) return "ছিনতাই";
  if (normalized.includes("চুরি") || normalized.includes("theft")) return "চুরি মামলা";
  if (normalized.includes("অস্ত্র") || normalized.includes("arms") || normalized.includes("weapon")) return "অস্ত্র মামলা";
  if (normalized.includes("মারামারি") || normalized.includes("fight") || normalized.includes("assault")) return "মারামারি";
  if (normalized.includes("সাধারন") || normalized.includes("general") || normalized.includes("diary")) return "সাধারন ডায়েরী";
  if (normalized.includes("ডাকাতী") || normalized.includes("dacoit") || normalized.includes("bandit")) return "ডাকাতী";
  if (normalized.includes("তথ্য") || normalized.includes("পর্নো") || normalized.includes("it") || normalized.includes("technology") || normalized.includes("pornography")) return "তথ্য ও প্রযুক্তি/পর্নোগ্রাফি";
  if (normalized.includes("বিস্ফোরক") || normalized.includes("explosive")) return "বিস্ফোরক দ্রব্য বিশেষ ক্ষমতা আইন";
  if (normalized.includes("সন্ত্রাস") || normalized.includes("terror") || normalized.includes("terrorism")) return "সন্ত্রাস বিরোধী আইন";
  if (normalized.includes("বৈদেশিক") || normalized.includes("foreign") || normalized.includes("citizen")) return "বৈদেশিক নাগরিক আইন";
  return "বিবিধ";

}

function normalizeTrialStatus(status: string | null): string {
  if (!status) return "উল্লেখ নাই";
  const normalized = status.toLowerCase().trim();
  if ((normalized.includes("অভিভাবক") || normalized.includes("guardian")) && normalized.includes("আটকাদেশ")) return "অভিভাবক মামলায় আটকাদেশ";
  if ((normalized.includes("অভিভাবক") || normalized.includes("guardian")) && (normalized.includes("বিচারাধীন") || normalized.includes("trial") || normalized.includes("pending") || normalized.includes("ongoing"))) return "অভিভাবক মামলায় বিচারাধীন";
  if (normalized.includes("বিচারাধীন") || normalized.includes("trial") || normalized.includes("pending") || normalized.includes("ongoing")) return "বিচারাধীন";
  if (normalized.includes("দোষী") || normalized.includes("convicted") || normalized.includes("guilty") || normalized.includes("sentenced")) return "বিচারে দোষী সাব্যস্ত";
  if (normalized.includes("আটকাদেশ") || normalized.includes("detention") || normalized.includes("detained")) return "আটকাদেশ";
  return "উল্লেখ নাই";
}

type ParsedHearingRow = {
  hearingDate: string | null;
  status: string;
  reason: string;
};

function normalizeHearingStatus(status: unknown): string {
  const value = String(status ?? "").trim().toLowerCase();
  if (value === "present" || value === "appeared" || value === "উপস্থিত") return "Appeared";
  if (value === "absent" || value === "অনুপস্থিত") return "Absent";
  if (value === "pending" || value === "মুলতবি" || value === "মুলতবী") return "Pending";
  return "";
}

function parseCourtHearingRows(court: {
  hearingDate?: string | Date | null;
  currentCaseStatus?: string | null;
  courtAttendanceDetails?: string | null;
}): ParsedHearingRow[] {
  const fallback: ParsedHearingRow[] = (court.hearingDate || court.currentCaseStatus)
    ? [{
      hearingDate: typeof court.hearingDate === "string" ? court.hearingDate.slice(0, 10) : null,
      status: normalizeHearingStatus(court.currentCaseStatus),
      reason: "",
    }]
    : [];

  const raw = court.courtAttendanceDetails;
  if (!raw || typeof raw !== "string") return fallback;

  try {
    const parsed = JSON.parse(raw);
    const history = Array.isArray(parsed?.history) ? parsed.history : (Array.isArray(parsed) ? parsed : null);
    if (!history) {
      const status = normalizeHearingStatus(
        (parsed as any)?.appearanceStatus
        ?? (parsed as any)?.status
        ?? (parsed as any)?.currentCaseStatus
        ?? court.currentCaseStatus,
      );
      const reason =
        typeof (parsed as any)?.reason === "string"
          ? (parsed as any).reason.trim()
          : (typeof (parsed as any)?.reasonForNonAppearance === "string"
            ? (parsed as any).reasonForNonAppearance.trim()
            : (typeof (parsed as any)?.absenceReason === "string"
              ? (parsed as any).absenceReason.trim()
              : ""));
      const hearingDate = typeof court.hearingDate === "string" ? court.hearingDate.slice(0, 10) : null;
      if (!hearingDate && !status && !reason) return fallback;
      return [{ hearingDate, status, reason }];
    }

    return history
      .map((row: any) => ({
        hearingDate: typeof row?.hearingDate === "string" ? row.hearingDate.slice(0, 10) : null,
        status: normalizeHearingStatus(row?.status),
        reason:
          typeof row?.reason === "string"
            ? row.reason.trim()
            : (typeof row?.reasonForNonAppearance === "string"
              ? row.reasonForNonAppearance.trim()
              : (typeof row?.absenceReason === "string" ? row.absenceReason.trim() : "")),
      }))
      .filter((row: ParsedHearingRow) => !!row.hearingDate || !!row.status || !!row.reason);
  } catch {
    return fallback;
  }
}

router.get("/chok01", async (req, res) => {
  console.log("Entering /chok01");
  try {
    const now = new Date();
    const month = Math.min(12, Math.max(1, Number(req.query.month) || (now.getMonth() + 1)));
    const year = Math.max(2000, Number(req.query.year) || now.getFullYear());
    const reportDate = new Date(year, month - 1, new Date(year, month, 0).getDate());
    const reportMonthStart = new Date(year, month - 1, 1);
    const previousMonthEnd = new Date(year, month - 1, 0);

    const centerId = await resolveCenter(req);

    const [childrenData, courtsData, admissionsData, releasesData, centers] = await Promise.all([
      db.select({
        id: childrenTable.id,
        childId: childrenTable.childId,
        centerId: childrenTable.centerId,
        centerName: centersTable.centerName,
        fullName: childrenTable.fullName,
        motherName: childrenTable.motherName,
        fatherName: childrenTable.fatherName,
        dateOfBirth: childrenTable.dateOfBirth,
        verifiedAge: childrenTable.verifiedAge,
        verifiedDob: childrenTable.verifiedDob,
        admissionDate: childrenTable.admissionDate,
        currentStatus: childrenTable.currentStatus,
        presentAddress: childrenTable.presentAddress,
        presentUpazila: childrenTable.presentUpazila,
        presentDistrict: childrenTable.presentDistrict,
        permanentAddress: childrenTable.permanentAddress,
        permanentUpazila: childrenTable.permanentUpazila,
        permanentDistrict: childrenTable.permanentDistrict,
      }).from(childrenTable).leftJoin(centersTable, eq(childrenTable.centerId, centersTable.id)),
      db.select({
        id: courtCasesTable.id,
        childId: courtCasesTable.childId,
        caseNo: courtCasesTable.caseNo,
        legalSection: courtCasesTable.legalSection,
        grNumber: courtCasesTable.grNumber,
        policeStationName: courtCasesTable.policeStationName,
        caseType: courtCasesTable.childCaseType,
        trialStatus: courtCasesTable.outcome,
        currentCaseStatus: courtCasesTable.currentCaseStatus,
        courtName: courtCasesTable.courtName,
        legalAidType: courtCasesTable.legalAidType,
        courtAttendanceDetails: courtCasesTable.courtAttendanceDetails,
        lastHearingDate: courtCasesTable.lastHearingDate,
        nextHearingDate: courtCasesTable.nextHearingDate,
        updatedAt: courtCasesTable.updatedAt,
      }).from(courtCasesTable),
      db.select({
        childId: admissionsTable.childId,
        approvalStatus: admissionsTable.approvalStatus,
        admissionDate: admissionsTable.admissionDate,
        admissionCenterId: admissionsTable.centerId,
      }).from(admissionsTable),
      db.select({
        childId: releaseRecordsTable.childId,
        releaseDate: releaseRecordsTable.releaseDate,
      }).from(releaseRecordsTable),
      db.select().from(centersTable),
    ]);

    const centerIdByName = new Map(
      centers
        .map((center) => [normalizeCenterName(center.centerName), center.id] as const)
        .filter((entry): entry is [string, number] => Boolean(entry[0])),
    );

    const latestAdmissionByChild = latestByChild(
      admissionsData?.filter((row) => isOnOrBefore(row.admissionDate, reportDate)) ?? [],
      (row) => row.admissionDate,
    );
    const latestReleaseByChild = latestByChild(
      releasesData?.filter((row) => isOnOrBefore(row.releaseDate, reportDate)) ?? [],
      (row) => row.releaseDate,
    );
    const latestCourtByChild = latestByChild(
      courtsData ?? [],
      (row) => row.updatedAt ?? row.lastHearingDate ?? row.nextHearingDate,
    );

    const childrenWithResolvedCenter = childrenData.map((child) => {
      const admission = latestAdmissionByChild.get(child.id);
      const resolvedCenterId = child.centerId ?? admission?.admissionCenterId ?? null;
      const resolvedCenterName = normalizeCenterName(child.centerName)
        ?? (admission?.admissionCenterId
          ? normalizeCenterName(centers.find(c => c.id === admission.admissionCenterId)?.centerName)
          : null)
        ?? null;
      return {
        ...child,
        resolvedCenterId,
        resolvedCenterName,
      };
    });

    function isInSelectedCenter(childCenterId: number | null) {
      return !centerId || childCenterId === centerId;
    }

    function isApprovedAsOf(childId: number, asOf: Date) {
      const latestAdmission = latestByChild(
        admissionsData?.filter((row) => row.childId === childId && isOnOrBefore(row.admissionDate, asOf)) ?? [],
        (row) => row.admissionDate,
      ).get(childId);
      return (latestAdmission?.approvalStatus ?? "Approved") === "Approved";
    }

    function isResidentAsOf(child: typeof childrenWithResolvedCenter[number], asOf: Date) {
      if (!isInSelectedCenter(child.resolvedCenterId)) return false;
      const admissionDate = parseDate(child.admissionDate);
      if (!admissionDate || admissionDate > asOf) return false;

      const release = latestReleaseByChild.get(child.id);
      const releaseDate = parseDate(release?.releaseDate);
      if (releaseDate && releaseDate.getTime() <= asOf.getTime()) return false;

      // Ensure only admitted children are counted, as requested by user.
      // We check currentStatus to match the "database" view the user expects.
      if (child.currentStatus !== "Admitted") return false;

      return true;
    }

    const filteredChildren = childrenWithResolvedCenter.filter((child) => isResidentAsOf(child, reportDate)) ?? [];

    const ageGroupCounts: Record<string, number> = {};
    const caseTypeCounts: Record<string, number> = {};
    const trialStatusCounts: Record<string, number> = {};
    const stayDurationCounts: Record<string, number> = {};
    const courtAppearanceCounts: Record<string, number> = {};
    const noShowReasonCounts: Record<string, number> = {};

    AGE_GROUPS.forEach(g => { ageGroupCounts[g.label] = 0; });
    CASE_TYPES.forEach(c => { caseTypeCounts[c] = 0; });
    TRIAL_STATUSES.forEach(t => { trialStatusCounts[t] = 0; });
    STAY_DURATIONS.forEach(s => { stayDurationCounts[s.label] = 0; });
    COURT_APPEARANCES.forEach(c => { courtAppearanceCounts[c] = 0; });
    const courtCasesByChild = new Map<number, typeof courtsData>();
    courtsData.forEach((court) => {
      if (!court.childId) return;
      const items = courtCasesByChild.get(court.childId) ?? [];
      items.push(court);
      courtCasesByChild.set(court.childId, items);
    });

    (filteredChildren ?? []).forEach(child => {
      const dob = parseDate(child.verifiedDob ?? child.dateOfBirth);
      const admissionDate = parseDate(child.admissionDate);
      if (!admissionDate) return;

      const age = child.verifiedAge ?? (dob ? calculateAge(dob, reportDate) : null);
      const ageGroup = getAgeGroup(age);
      ageGroupCounts[ageGroup] = (ageGroupCounts[ageGroup] || 0) + 1;

      const release = latestReleaseByChild.get(child.id);
      const stayEndDate = parseDate(release?.releaseDate) ?? reportDate;
      const stayDuration = getStayDuration(admissionDate, stayEndDate);
      stayDurationCounts[stayDuration] = (stayDurationCounts[stayDuration] || 0) + 1;

      const court = latestCourtByChild.get(child.id);
      if (court) {
        const caseType = normalizeCaseType(court.caseType);
        caseTypeCounts[caseType] = (caseTypeCounts[caseType] || 0) + 1;

        const trialStatus = normalizeTrialStatus(court.trialStatus ?? court.currentCaseStatus);
        trialStatusCounts[trialStatus] = (trialStatusCounts[trialStatus] || 0) + 1;
      }

      const hearingRows = (courtCasesByChild.get(child.id) ?? [])
        .flatMap((courtCase) => parseCourtHearingRows(courtCase))
        .filter((row) => {
          const hearingDate = parseDate(row.hearingDate);
          if (!hearingDate) return false;
          return hearingDate.getFullYear() === year && hearingDate.getMonth() === (month - 1);
        });

      const appearedCount = hearingRows.filter((row) => row.status === "Appeared").length;
      const appearanceLabel =
        appearedCount <= 0
          ? "০১ বারও কোর্টে যায়নি (চলতি মাস)"
          : appearedCount === 1
            ? "০১ বার (চলতি মাস)"
            : appearedCount === 2
              ? "০২ বার (চলতি মাস)"
              : "তলবমতে";
      courtAppearanceCounts[appearanceLabel] = (courtAppearanceCounts[appearanceLabel] || 0) + 1;

      hearingRows
        .filter((row) => row.status === "Absent" && row.reason)
        .forEach((row) => {
          const reason = row.reason.trim();
          if (!reason) return;
          noShowReasonCounts[reason] = (noShowReasonCounts[reason] || 0) + 1;
        });
    });

    const selectedCenter = centerId ? centers.find(c => c.id === centerId) : null;
    const previousMonthEndResidents = childrenWithResolvedCenter.filter((child) => isResidentAsOf(child, previousMonthEnd)).length;
    const arrivalsInMonth = childrenWithResolvedCenter.filter((child) => {
      if (!isInSelectedCenter(child.resolvedCenterId)) return false;
      const admissionDate = parseDate(child.admissionDate);
      if (!admissionDate) return false;
      if (admissionDate.getTime() < reportMonthStart.getTime() || admissionDate.getTime() > reportDate.getTime()) return false;
      return isApprovedAsOf(child.id, reportDate);
    }).length;
    const releasesInMonth = releasesData.filter((release) => {
      const child = childrenWithResolvedCenter.find((item) => item.id === release.childId);
      if (!child || !isInSelectedCenter(child.resolvedCenterId)) return false;
      const releaseDate = parseDate(release.releaseDate);
      if (!releaseDate) return false;
      return releaseDate.getTime() >= reportMonthStart.getTime() && releaseDate.getTime() <= reportDate.getTime();
    }).length;
    const attachedChildren = filteredChildren.length + releasesInMonth;

    res.json({
      month,
      year,
      centerId: centerId ?? null,
      centerName: normalizeCenterName(selectedCenter?.centerName) ?? filteredChildren[0]?.resolvedCenterName ?? null,
      reportDate: reportDate.toISOString(),
      totalResidents: filteredChildren?.length ?? 0,
      rows: [],
      ageGroups: Object.entries(ageGroupCounts || {}).map(([label, count]) => ({ label, count })),
      caseTypes: Object.entries(caseTypeCounts || {}).map(([label, count]) => ({ label, count })),
      trialStatuses: Object.entries(trialStatusCounts || {}).map(([label, count]) => ({ label, count })),
      stayDurations: Object.entries(stayDurationCounts || {}).map(([label, count]) => ({ label, count })),
      courtAppearances: Object.entries(courtAppearanceCounts || {}).map(([label, count]) => ({ label, count })),
      courtNoShowReasons: Object.entries(noShowReasonCounts || {})
        .sort((a, b) => b[1] - a[1])
        .map(([reason, count]) => ({ reason, count })),
      noteSummary: {
        previousMonthEndResidents,
        arrivalsInMonth,
        releasesInMonth,
        monthEndResidents: filteredChildren?.length ?? 0,
        attachedChildren,
      },
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
