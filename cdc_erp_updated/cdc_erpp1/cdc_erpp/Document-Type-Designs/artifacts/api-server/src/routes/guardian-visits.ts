import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { guardianVisitsTable, guardiansTable, childrenTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { checkManageAccess } from "../middlewares/auth";

const router: IRouter = Router();

function generateVisitId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `GVIS-${year}-${rand}`;
}

const SELECT_FIELDS = {
  id: guardianVisitsTable.id,
  visitId: guardianVisitsTable.visitId,
  childId: guardianVisitsTable.childId,
  childName: childrenTable.fullName,
  guardianId: guardianVisitsTable.guardianId,
  guardianName: guardiansTable.guardianName,
  visitDate: guardianVisitsTable.visitDate,
  purposeOfVisit: guardianVisitsTable.purposeOfVisit,
  observations: guardianVisitsTable.observations,
  createdAt: guardianVisitsTable.createdAt,
};

router.get("/", async (req, res) => {
  try {
    const { childId, guardianId } = req.query as Record<string, string>;
    const rows = await db.select(SELECT_FIELDS).from(guardianVisitsTable)
      .leftJoin(childrenTable, eq(guardianVisitsTable.childId, childrenTable.id))
      .leftJoin(guardiansTable, eq(guardianVisitsTable.guardianId, guardiansTable.id))
      .orderBy(desc(guardianVisitsTable.createdAt));
    let filtered = rows;
    if (childId) filtered = filtered.filter(r => r.childId === parseInt(childId));
    if (guardianId) filtered = filtered.filter(r => r.guardianId === parseInt(guardianId));
    res.json(filtered);
  } catch (err) {
    req.log.error({ err }, "Failed to list guardian visits");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, parseInt(req.body.childId)));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    const [visit] = await db.insert(guardianVisitsTable).values({ ...req.body, visitId: generateVisitId() }).returning();
    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, visit.childId));
    const [guardian] = await db.select().from(guardiansTable).where(eq(guardiansTable.id, visit.guardianId));
    res.status(201).json({ ...visit, childName: childFull?.fullName, guardianName: guardian?.guardianName });
  } catch (err) {
    req.log.error({ err }, "Failed to create guardian visit");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db.select(SELECT_FIELDS).from(guardianVisitsTable)
      .leftJoin(childrenTable, eq(guardianVisitsTable.childId, childrenTable.id))
      .leftJoin(guardiansTable, eq(guardianVisitsTable.guardianId, guardiansTable.id))
      .where(eq(guardianVisitsTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found", message: "Visit not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get guardian visit");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select({ childId: guardianVisitsTable.childId }).from(guardianVisitsTable).where(eq(guardianVisitsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    const [visit] = await db.update(guardianVisitsTable).set(req.body).where(eq(guardianVisitsTable.id, id)).returning();
    if (!visit) return res.status(404).json({ error: "Not found" });
    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, visit.childId));
    const [guardian] = await db.select().from(guardiansTable).where(eq(guardiansTable.id, visit.guardianId));
    res.json({ ...visit, childName: childFull?.fullName, guardianName: guardian?.guardianName });
  } catch (err) {
    req.log.error({ err }, "Failed to update guardian visit");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select({ childId: guardianVisitsTable.childId }).from(guardianVisitsTable).where(eq(guardianVisitsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    await db.delete(guardianVisitsTable).where(eq(guardianVisitsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete guardian visit");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
