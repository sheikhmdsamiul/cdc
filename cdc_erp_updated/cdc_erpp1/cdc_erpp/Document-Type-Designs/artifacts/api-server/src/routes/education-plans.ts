import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { educationPlansTable, childrenTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser, moduleGuard } from "../middlewares/auth";

const router: IRouter = Router();

router.use(moduleGuard("education-skills"));

function generatePlanId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `EDU-${year}-${rand}`;
}

router.get("/", async (req, res) => {
  try {
    const { childId } = req.query as Record<string, string>;

    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const isGlobal = user.roleName === "Super Admin" || user.roleName === "Head Office";
    const userCenterId = user.centerId;

    if (!isGlobal && !userCenterId) return res.json([]);

    let query = db
      .select({
        id: educationPlansTable.id,
        planId: educationPlansTable.planId,
        childId: educationPlansTable.childId,
        childName: childrenTable.fullName,
        programType: educationPlansTable.programType,
        admissionEligibleFor: educationPlansTable.admissionEligibleFor,
        caseDetails: educationPlansTable.caseDetails,
        recommenderCaseWorkerName: educationPlansTable.recommenderCaseWorkerName,
        recordTitle: educationPlansTable.recordTitle,
        status: educationPlansTable.status,
        institutionName: educationPlansTable.institutionName,
        startDate: educationPlansTable.startDate,
        endDate: educationPlansTable.endDate,
        educationLevel: educationPlansTable.educationLevel,
        boardOrCurriculum: educationPlansTable.boardOrCurriculum,
        learningGoals: educationPlansTable.learningGoals,
        tradeName: educationPlansTable.tradeName,
        certificationName: educationPlansTable.certificationName,
        weeklyHours: educationPlansTable.weeklyHours,
        assessmentDate: educationPlansTable.assessmentDate,
        assessorName: educationPlansTable.assessorName,
        literacyLevel: educationPlansTable.literacyLevel,
        numeracyLevel: educationPlansTable.numeracyLevel,
        digitalLiteracyLevel: educationPlansTable.digitalLiteracyLevel,
        interestAreas: educationPlansTable.interestAreas,
        strengths: educationPlansTable.strengths,
        supportNeeds: educationPlansTable.supportNeeds,
        progressNotes: educationPlansTable.progressNotes,
        recommendations: educationPlansTable.recommendations,
        createdAt: educationPlansTable.createdAt,
      })
      .from(educationPlansTable)
      .leftJoin(childrenTable, eq(educationPlansTable.childId, childrenTable.id));

    if (!isGlobal) {
      query = query.where(eq(childrenTable.centerId, userCenterId!)) as any;
    }

    const rows = await query.orderBy(desc(educationPlansTable.createdAt));

    let filtered = rows;
    if (childId) filtered = filtered.filter(r => r.childId === parseInt(childId));
    res.json(filtered);
  } catch (err) {
    req.log.error({ err }, "Failed to list education plans");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const [plan] = await db.insert(educationPlansTable).values({
      ...req.body,
      planId: generatePlanId(),
    }).returning();
    const [child] = await db.select().from(childrenTable).where(eq(childrenTable.id, plan.childId));
    res.status(201).json({ ...plan, childName: child?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to create education plan");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db
      .select({
        id: educationPlansTable.id,
        planId: educationPlansTable.planId,
        childId: educationPlansTable.childId,
        childName: childrenTable.fullName,
        programType: educationPlansTable.programType,
        admissionEligibleFor: educationPlansTable.admissionEligibleFor,
        caseDetails: educationPlansTable.caseDetails,
        recommenderCaseWorkerName: educationPlansTable.recommenderCaseWorkerName,
        recordTitle: educationPlansTable.recordTitle,
        status: educationPlansTable.status,
        institutionName: educationPlansTable.institutionName,
        startDate: educationPlansTable.startDate,
        endDate: educationPlansTable.endDate,
        educationLevel: educationPlansTable.educationLevel,
        boardOrCurriculum: educationPlansTable.boardOrCurriculum,
        learningGoals: educationPlansTable.learningGoals,
        tradeName: educationPlansTable.tradeName,
        certificationName: educationPlansTable.certificationName,
        weeklyHours: educationPlansTable.weeklyHours,
        assessmentDate: educationPlansTable.assessmentDate,
        assessorName: educationPlansTable.assessorName,
        literacyLevel: educationPlansTable.literacyLevel,
        numeracyLevel: educationPlansTable.numeracyLevel,
        digitalLiteracyLevel: educationPlansTable.digitalLiteracyLevel,
        interestAreas: educationPlansTable.interestAreas,
        strengths: educationPlansTable.strengths,
        supportNeeds: educationPlansTable.supportNeeds,
        progressNotes: educationPlansTable.progressNotes,
        recommendations: educationPlansTable.recommendations,
        createdAt: educationPlansTable.createdAt,
      })
      .from(educationPlansTable)
      .leftJoin(childrenTable, eq(educationPlansTable.childId, childrenTable.id))
      .where(eq(educationPlansTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found", message: "Education plan not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get education plan");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [plan] = await db.update(educationPlansTable).set(req.body).where(eq(educationPlansTable.id, id)).returning();
    if (!plan) return res.status(404).json({ error: "Not found", message: "Education plan not found" });
    const [child] = await db.select().from(childrenTable).where(eq(childrenTable.id, plan.childId));
    res.json({ ...plan, childName: child?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to update education plan");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(educationPlansTable).where(eq(educationPlansTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete education plan");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
