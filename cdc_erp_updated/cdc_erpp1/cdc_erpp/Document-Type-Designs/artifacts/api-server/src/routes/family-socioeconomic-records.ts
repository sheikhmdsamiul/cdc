import { Router, type IRouter } from "express";
import { db, familySocioeconomicRecordsTable, childrenTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { checkManageAccess } from "../middlewares/auth";

const router: IRouter = Router();

function generateRecordId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `FS-${year}-${rand}`;
}

router.get("/", async (req, res) => {
  try {
    const { childId } = req.query as Record<string, string>;
    const rows = await db
      .select({
        id: familySocioeconomicRecordsTable.id,
        recordId: familySocioeconomicRecordsTable.recordId,
        childId: familySocioeconomicRecordsTable.childId,
        childName: childrenTable.fullName,
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
        createdAt: familySocioeconomicRecordsTable.createdAt,
      })
      .from(familySocioeconomicRecordsTable)
      .leftJoin(childrenTable, eq(familySocioeconomicRecordsTable.childId, childrenTable.id))
      .orderBy(desc(familySocioeconomicRecordsTable.createdAt));

    let filtered = rows;
    if (childId) filtered = filtered.filter((row) => row.childId === parseInt(childId, 10));
    res.json(filtered);
  } catch (err) {
    req.log.error({ err }, "Failed to list family socioeconomic records");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, parseInt(req.body.childId, 10)));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    const [record] = await db.insert(familySocioeconomicRecordsTable).values({
      ...req.body,
      recordId: generateRecordId(),
    }).returning();
    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, record.childId));
    res.status(201).json({ ...record, childName: childFull?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to create family socioeconomic record");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [record] = await db
      .select({
        id: familySocioeconomicRecordsTable.id,
        recordId: familySocioeconomicRecordsTable.recordId,
        childId: familySocioeconomicRecordsTable.childId,
        childName: childrenTable.fullName,
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
        createdAt: familySocioeconomicRecordsTable.createdAt,
      })
      .from(familySocioeconomicRecordsTable)
      .leftJoin(childrenTable, eq(familySocioeconomicRecordsTable.childId, childrenTable.id))
      .where(eq(familySocioeconomicRecordsTable.id, id));

    if (!record) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(record);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch family socioeconomic record");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [existing] = await db.select({ childId: familySocioeconomicRecordsTable.childId }).from(familySocioeconomicRecordsTable).where(eq(familySocioeconomicRecordsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });

    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    const [record] = await db.update(familySocioeconomicRecordsTable).set(req.body).where(eq(familySocioeconomicRecordsTable.id, id)).returning();
    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, record.childId));
    res.json({ ...record, childName: childFull?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to update family socioeconomic record");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [existing] = await db.select({ childId: familySocioeconomicRecordsTable.childId }).from(familySocioeconomicRecordsTable).where(eq(familySocioeconomicRecordsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });

    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    await db.delete(familySocioeconomicRecordsTable).where(eq(familySocioeconomicRecordsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete family socioeconomic record");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
