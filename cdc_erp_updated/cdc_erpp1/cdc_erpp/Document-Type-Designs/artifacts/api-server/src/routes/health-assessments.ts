import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { healthAssessmentsTable, childrenTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { checkManageAccess, getCurrentUser, moduleGuard } from "../middlewares/auth";

const router: IRouter = Router();

router.use(moduleGuard("health"));

function generateAssessmentId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `HEALTH-${year}-${rand}`;
}

function calcBMI(height?: number, weight?: number): number | null {
  if (!height || !weight || height === 0) return null;
  return parseFloat((weight / ((height / 100) ** 2)).toFixed(2));
}

const SELECT_FIELDS = {
  id: healthAssessmentsTable.id,
  assessmentId: healthAssessmentsTable.assessmentId,
  childId: healthAssessmentsTable.childId,
  childName: childrenTable.fullName,
  assessmentDate: healthAssessmentsTable.assessmentDate,
  height: healthAssessmentsTable.height,
  weight: healthAssessmentsTable.weight,
  bmi: healthAssessmentsTable.bmi,
  physicalCondition: healthAssessmentsTable.physicalCondition,
  mentalCondition: healthAssessmentsTable.mentalCondition,
  doctorName: healthAssessmentsTable.doctorName,
  visibleInjury: healthAssessmentsTable.visibleInjury,
  injuryDescription: healthAssessmentsTable.injuryDescription,
  chronicDisease: healthAssessmentsTable.chronicDisease,
  congenitalDiseaseInfo: healthAssessmentsTable.congenitalDiseaseInfo,
  hasHereditaryDiseaseHistory: healthAssessmentsTable.hasHereditaryDiseaseHistory,
  hereditaryDiseaseDetails: healthAssessmentsTable.hereditaryDiseaseDetails,
  hasDisability: healthAssessmentsTable.hasDisability,
  disability: healthAssessmentsTable.disability,
  substanceAbuse: healthAssessmentsTable.substanceAbuse,
  gbvSurvivor: healthAssessmentsTable.gbvSurvivor,
  ongoingMedication: healthAssessmentsTable.ongoingMedication,
  immeditateTreatmentRequired: healthAssessmentsTable.immeditateTreatmentRequired,
  hospitalReferralNeeded: healthAssessmentsTable.hospitalReferralNeeded,
  recommendation: healthAssessmentsTable.recommendation,
  createdAt: healthAssessmentsTable.createdAt,
};

router.get("/", async (req, res) => {
  try {
    const { childId } = req.query as Record<string, string>;

    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const isGlobal = user.roleName === "Super Admin" || user.roleName === "Head Office";
    const userCenterId = user.centerId;

    if (!isGlobal && !userCenterId) return res.json([]);

    let query = db.select(SELECT_FIELDS).from(healthAssessmentsTable)
      .leftJoin(childrenTable, eq(healthAssessmentsTable.childId, childrenTable.id));

    if (!isGlobal) {
      query = query.where(eq(childrenTable.centerId, userCenterId)) as any;
    }

    const rows = await query.orderBy(desc(healthAssessmentsTable.createdAt));
    let filtered = rows;
    if (childId) filtered = filtered.filter(r => r.childId === parseInt(childId));
    res.json(filtered);
  } catch (err) {
    req.log.error({ err }, "Failed to list health assessments");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, parseInt(req.body.childId)));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    const body = req.body;
    const bmi = calcBMI(body.height, body.weight);
    const [assessment] = await db.insert(healthAssessmentsTable).values({ ...body, bmi, assessmentId: generateAssessmentId() }).returning();
    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, assessment.childId));
    res.status(201).json({ ...assessment, childName: childFull?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to create health assessment");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db.select(SELECT_FIELDS).from(healthAssessmentsTable)
      .leftJoin(childrenTable, eq(healthAssessmentsTable.childId, childrenTable.id))
      .where(eq(healthAssessmentsTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found", message: "Assessment not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get health assessment");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select({ childId: healthAssessmentsTable.childId }).from(healthAssessmentsTable).where(eq(healthAssessmentsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    const body = req.body;
    const bmi = calcBMI(body.height, body.weight);
    const [assessment] = await db.update(healthAssessmentsTable).set({ ...body, bmi }).where(eq(healthAssessmentsTable.id, id)).returning();
    if (!assessment) return res.status(404).json({ error: "Not found" });
    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, assessment.childId));
    res.json({ ...assessment, childName: childFull?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to update health assessment");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select({ childId: healthAssessmentsTable.childId }).from(healthAssessmentsTable).where(eq(healthAssessmentsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    await db.delete(healthAssessmentsTable).where(eq(healthAssessmentsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete health assessment");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
