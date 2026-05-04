// @ts-nocheck
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { measurementSurveysTable, childrenTable, centersTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, getCurrentUser } from "../middlewares/auth";

const router: IRouter = Router();

function generateSurveyId(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `SVY-${year}${month}-${rand}`;
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    const { centerId: qCenter } = req.query as Record<string, string>;

    const rows = await db
      .select({
        id: measurementSurveysTable.id,
        surveyId: measurementSurveysTable.surveyId,
        childId: measurementSurveysTable.childId,
        childName: childrenTable.fullName,
        centerId: measurementSurveysTable.centerId,
        centerName: centersTable.centerName,
        centerNameBn: centersTable.centerNameBn,
        enumeratorName: measurementSurveysTable.enumeratorName,
        surveyDate: measurementSurveysTable.surveyDate,
        ageGroup: measurementSurveysTable.ageGroup,
        gender: measurementSurveysTable.gender,
        detentionLength: measurementSurveysTable.detentionLength,
        emotionalWellbeing: measurementSurveysTable.emotionalWellbeing,
        createdAt: measurementSurveysTable.createdAt,
      })
      .from(measurementSurveysTable)
      .leftJoin(childrenTable, eq(measurementSurveysTable.childId, childrenTable.id))
      .leftJoin(centersTable, eq(measurementSurveysTable.centerId, centersTable.id))
      .orderBy(desc(measurementSurveysTable.createdAt));

    let filtered = rows;
    if (user?.centerId && !["Super Admin", "Head Office"].includes(user.roleName || "")) {
      filtered = rows.filter(r => r.centerId === user.centerId);
    } else if (qCenter) {
      filtered = rows.filter(r => r.centerId === parseInt(qCenter));
    }

    res.json(filtered);
  } catch (err) {
    req.log.error({ err }, "Failed to list surveys");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const body = req.body;
    const surveyId = generateSurveyId();

    const [created] = await db
      .insert(measurementSurveysTable)
      .values({
        surveyId,
        centerId: body.centerId ? parseInt(body.centerId) : null,
        childId: body.childId ? parseInt(body.childId) : null,
        enumeratorName: body.enumeratorName || null,
        surveyDate: body.surveyDate || null,
        ageGroup: body.ageGroup || null,
        gender: body.gender || null,
        educationLevel: body.educationLevel || null,
        detentionLength: body.detentionLength || null,
        homeDistrict: body.homeDistrict || null,
        structuredRoutine: body.structuredRoutine || null,
        educationHours: body.educationHours || null,
        vocationalHours: body.vocationalHours || null,
        physicalActivity: body.physicalActivity || null,
        readingAccess: body.readingAccess != null ? Boolean(body.readingAccess) : null,
        lifeskillsParticipation: body.lifeskillsParticipation || null,
        productiveActivities: body.productiveActivities != null ? Boolean(body.productiveActivities) : null,
        complaintOpportunities: body.complaintOpportunities != null ? Boolean(body.complaintOpportunities) : null,
        familyContact: body.familyContact || null,
        safetyPerception: body.safetyPerception || null,
        physicalPunishment: body.physicalPunishment || null,
        rulesFairness: body.rulesFairness || null,
        captainSystem: body.captainSystem != null ? Boolean(body.captainSystem) : null,
        formalEducation: body.formalEducation != null ? Boolean(body.formalEducation) : null,
        vocationalAvailable: body.vocationalAvailable != null ? Boolean(body.vocationalAvailable) : null,
        tradesAvailable: body.tradesAvailable || null,
        vocationalSatisfaction: body.vocationalSatisfaction || null,
        selfHarm: body.selfHarm != null ? Boolean(body.selfHarm) : null,
        inmateConflicts: body.inmateConflicts || null,
        emotionalWellbeing: body.emotionalWellbeing || null,
        hopefulness: body.hopefulness || null,
        legalRightsInformed: body.legalRightsInformed != null ? Boolean(body.legalRightsInformed) : null,
        legalGuidance: body.legalGuidance || null,
        mainChallenges: body.mainChallenges || null,
        wishedChanges: body.wishedChanges || null,
      })
      .returning();

    res.status(201).json(created);
  } catch (err) {
    req.log.error({ err }, "Failed to create survey");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db
      .select()
      .from(measurementSurveysTable)
      .where(eq(measurementSurveysTable.id, id))
      .limit(1);

    if (!row) return res.status(404).json({ error: "Not found" });

    const [child] = row.childId
      ? await db.select({ fullName: childrenTable.fullName, childId: childrenTable.childId })
          .from(childrenTable).where(eq(childrenTable.id, row.childId)).limit(1)
      : [null];

    const [center] = row.centerId
      ? await db.select({ centerName: centersTable.centerName })
          .from(centersTable).where(eq(centersTable.id, row.centerId)).limit(1)
      : [null];

    res.json({ ...row, childName: child?.fullName, childCode: child?.childId, centerName: center?.centerName });
  } catch (err) {
    req.log.error({ err }, "Failed to get survey");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    const [updated] = await db
      .update(measurementSurveysTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(measurementSurveysTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(measurementSurveysTable).where(eq(measurementSurveysTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
