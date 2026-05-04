import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  childrenTable,
  casesTable,
  courtCasesTable,
  admissionsTable,
  followUpsTable,
  riskAssessmentsTable,
} from "@workspace/db";
import { eq, desc, inArray } from "drizzle-orm";
import { getCurrentUser } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/stats", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    const isGlobal = user?.roleName === "Super Admin" || user?.roleName === "Head Office";
    const centerId = user?.centerId;

    const children = isGlobal
      ? await db.select().from(childrenTable)
      : await db.select().from(childrenTable).where(eq(childrenTable.centerId, centerId!));

    const childIds = children.map(c => c.id);

    const [cases, admissions, riskAssessments, followUps, courtCases] = await Promise.all([
      childIds.length
        ? db.select().from(casesTable).where(isGlobal ? undefined : inArray(casesTable.childId, childIds))
        : [],
      childIds.length
        ? db.select().from(admissionsTable).where(isGlobal ? undefined : inArray(admissionsTable.childId, childIds))
        : [],
      childIds.length
        ? db.select().from(riskAssessmentsTable).where(isGlobal ? undefined : inArray(riskAssessmentsTable.childId, childIds))
        : [],
      childIds.length
        ? db.select().from(followUpsTable).where(isGlobal ? undefined : inArray(followUpsTable.childId, childIds))
        : [],
      childIds.length
        ? db.select().from(courtCasesTable).where(isGlobal ? undefined : inArray(courtCasesTable.childId, childIds))
        : [],
    ]);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalChildren = children.length;
    const admittedChildren = children.filter(c => c.currentStatus === "Admitted" || c.currentStatus === "Under Care").length;
    const releasedChildren = children.filter(c => c.currentStatus === "Released").length;
    const openCases = (cases as any[]).filter((c: any) => c.caseStatus === "Open" || c.caseStatus === "Active").length;
    const upcomingHearings = (courtCases as any[]).filter((c: any) => c.nextHearingDate && new Date(c.nextHearingDate) >= now).length;
    const recentAdmissions = (admissions as any[]).filter((a: any) => new Date(a.createdAt) >= thirtyDaysAgo).length;
    const highRiskChildren = (riskAssessments as any[]).filter((r: any) => r.overallRiskLevel === "High").length;
    const pendingFollowUps = (followUps as any[]).filter((f: any) => new Date(f.followUpDate) >= now).length;

    res.json({
      totalChildren,
      admittedChildren,
      releasedChildren,
      openCases,
      upcomingHearings,
      recentAdmissions,
      highRiskChildren,
      pendingFollowUps,
      centerName: isGlobal ? null : user?.centerName,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/recent-activity", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    const isGlobal = user?.roleName === "Super Admin" || user?.roleName === "Head Office";
    const centerId = user?.centerId;

    const centerFilter = isGlobal ? undefined : eq(childrenTable.centerId, centerId!);

    const recentChildren = await db.select().from(childrenTable)
      .where(centerFilter)
      .orderBy(desc(childrenTable.createdAt))
      .limit(5);

    const recentCases = await db
      .select({ id: casesTable.id, childId: casesTable.childId, caseStatus: casesTable.caseStatus, createdAt: casesTable.createdAt, childName: childrenTable.fullName })
      .from(casesTable)
      .leftJoin(childrenTable, eq(casesTable.childId, childrenTable.id))
      .where(centerFilter)
      .orderBy(desc(casesTable.createdAt))
      .limit(5);

    const recentAdmissions = await db
      .select({ id: admissionsTable.id, childId: admissionsTable.childId, admissionSource: admissionsTable.admissionSource, createdAt: admissionsTable.createdAt, childName: childrenTable.fullName })
      .from(admissionsTable)
      .leftJoin(childrenTable, eq(admissionsTable.childId, childrenTable.id))
      .where(centerFilter)
      .orderBy(desc(admissionsTable.createdAt))
      .limit(5);

    const activities: Array<{ id: number; type: string; description: string; childName?: string | null; timestamp: Date }> = [];

    recentChildren.forEach(c => activities.push({
      id: c.id,
      type: "child_admitted",
      description: `New child profile created`,
      childName: c.fullName,
      timestamp: c.createdAt,
    }));

    recentCases.forEach(c => activities.push({
      id: c.id + 1000,
      type: "case_opened",
      description: `Case opened (${c.caseStatus})`,
      childName: c.childName,
      timestamp: c.createdAt,
    }));

    recentAdmissions.forEach(a => activities.push({
      id: a.id + 2000,
      type: "admission_record",
      description: `Admission via ${a.admissionSource}`,
      childName: a.childName,
      timestamp: a.createdAt,
    }));

    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    res.json(activities.slice(0, 10));
  } catch (err) {
    req.log.error({ err }, "Failed to get recent activity");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/children-by-status", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    const isGlobal = user?.roleName === "Super Admin" || user?.roleName === "Head Office";
    const centerId = user?.centerId;

    const children = isGlobal
      ? await db.select().from(childrenTable)
      : await db.select().from(childrenTable).where(eq(childrenTable.centerId, centerId!));

    const statusMap: Record<string, number> = {};
    children.forEach(c => {
      const status = c.currentStatus || "Unknown";
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    res.json(Object.entries(statusMap).map(([status, count]) => ({ status, count })));
  } catch (err) {
    req.log.error({ err }, "Failed to get children by status");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
