import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { riskAssessmentsTable, childrenTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { checkManageAccess, getCurrentUser, moduleGuard } from "../middlewares/auth";

const router: IRouter = Router();

router.use(moduleGuard("risk-assessments"));

function generateRiskId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `RISK-${year}-${rand}`;
}

const SELECT_FIELDS = {
  id: riskAssessmentsTable.id,
  riskId: riskAssessmentsTable.riskId,
  childId: riskAssessmentsTable.childId,
  childName: childrenTable.fullName,
  assessmentDate: riskAssessmentsTable.assessmentDate,
  assessedBy: riskAssessmentsTable.assessedBy,
  previousOccupation: riskAssessmentsTable.previousOccupation,
  childNature: riskAssessmentsTable.childNature,
  communicationSkill: riskAssessmentsTable.communicationSkill,
  communicationWithGuardian: riskAssessmentsTable.communicationWithGuardian,
  educationTrainingInfo: riskAssessmentsTable.educationTrainingInfo,
  childCounselingStatus: riskAssessmentsTable.childCounselingStatus,
  familyCounselingStatus: riskAssessmentsTable.familyCounselingStatus,
  recreationArrangement: riskAssessmentsTable.recreationArrangement,
  otherRehabilitationInfo: riskAssessmentsTable.otherRehabilitationInfo,
  abuseRisk: riskAssessmentsTable.abuseRisk,
  traffickingRisk: riskAssessmentsTable.traffickingRisk,
  reoffendingRisk: riskAssessmentsTable.reoffendingRisk,
  selfHarmRisk: riskAssessmentsTable.selfHarmRisk,
  overallRiskLevel: riskAssessmentsTable.overallRiskLevel,
  immediateActionRequired: riskAssessmentsTable.immediateActionRequired,
  protectionMeasures: riskAssessmentsTable.protectionMeasures,
  status: riskAssessmentsTable.status,
  createdAt: riskAssessmentsTable.createdAt,
  updatedAt: riskAssessmentsTable.updatedAt,
};

router.get("/", async (req, res) => {
  try {
    const { childId } = req.query as Record<string, string>;

    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const isGlobal = user.roleName === "Super Admin" || user.roleName === "Head Office";
    const userCenterId = user.centerId;

    if (!isGlobal && !userCenterId) return res.json([]);

    let query = db.select(SELECT_FIELDS).from(riskAssessmentsTable)
      .leftJoin(childrenTable, eq(riskAssessmentsTable.childId, childrenTable.id));

    if (!isGlobal) {
      query = query.where(eq(childrenTable.centerId, userCenterId!)) as any;
    }

    const rows = await query.orderBy(desc(riskAssessmentsTable.createdAt));
    let filtered = rows;
    if (childId) filtered = filtered.filter(r => r.childId === parseInt(childId));
    res.json(filtered);
  } catch (err) {
    req.log.error({ err }, "Failed to list risk assessments");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, parseInt(req.body.childId)));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    const [assessment] = await db.insert(riskAssessmentsTable).values({ ...req.body, riskId: generateRiskId() }).returning();
    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, assessment.childId));
    res.status(201).json({ ...assessment, childName: childFull?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to create risk assessment");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db.select(SELECT_FIELDS).from(riskAssessmentsTable)
      .leftJoin(childrenTable, eq(riskAssessmentsTable.childId, childrenTable.id))
      .where(eq(riskAssessmentsTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found", message: "Risk assessment not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get risk assessment");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select({ childId: riskAssessmentsTable.childId }).from(riskAssessmentsTable).where(eq(riskAssessmentsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    const [assessment] = await db.update(riskAssessmentsTable).set(req.body).where(eq(riskAssessmentsTable.id, id)).returning();
    if (!assessment) return res.status(404).json({ error: "Not found" });
    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, assessment.childId));
    res.json({ ...assessment, childName: childFull?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to update risk assessment");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select({ childId: riskAssessmentsTable.childId }).from(riskAssessmentsTable).where(eq(riskAssessmentsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    await db.delete(riskAssessmentsTable).where(eq(riskAssessmentsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete risk assessment");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
