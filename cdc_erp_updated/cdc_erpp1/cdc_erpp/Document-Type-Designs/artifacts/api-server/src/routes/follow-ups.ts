import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { followUpsTable, childrenTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { checkManageAccess, getCurrentUser, moduleGuard } from "../middlewares/auth";

const router: IRouter = Router();

router.use(moduleGuard("follow-ups"));

function generateFollowUpId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `FLW-${year}-${rand}`;
}

const SELECT_FIELDS = {
  id: followUpsTable.id,
  followUpId: followUpsTable.followUpId,
  childId: followUpsTable.childId,
  childName: childrenTable.fullName,
  followUpDate: followUpsTable.followUpDate,
  visitType: followUpsTable.visitType,
  observation: followUpsTable.observation,
  nextAction: followUpsTable.nextAction,
  createdAt: followUpsTable.createdAt,
};

router.get("/", async (req, res) => {
  try {
    const { childId } = req.query as Record<string, string>;

    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const isGlobal = user.roleName === "Super Admin" || user.roleName === "Head Office";
    const userCenterId = user.centerId;

    if (!isGlobal && !userCenterId) return res.json([]);

    let query = db.select(SELECT_FIELDS).from(followUpsTable)
      .leftJoin(childrenTable, eq(followUpsTable.childId, childrenTable.id));

    if (!isGlobal) {
      query = query.where(eq(childrenTable.centerId, userCenterId!)) as any;
    }

    const rows = await query.orderBy(desc(followUpsTable.createdAt));
    let filtered = rows;
    if (childId) filtered = filtered.filter(r => r.childId === parseInt(childId));
    res.json(filtered);
  } catch (err) {
    req.log.error({ err }, "Failed to list follow-ups");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, parseInt(req.body.childId)));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    const [followUp] = await db.insert(followUpsTable).values({ ...req.body, followUpId: generateFollowUpId() }).returning();
    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, followUp.childId));
    res.status(201).json({ ...followUp, childName: childFull?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to create follow-up");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db.select(SELECT_FIELDS).from(followUpsTable)
      .leftJoin(childrenTable, eq(followUpsTable.childId, childrenTable.id))
      .where(eq(followUpsTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found", message: "Follow-up not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get follow-up");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select({ childId: followUpsTable.childId }).from(followUpsTable).where(eq(followUpsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    const [followUp] = await db.update(followUpsTable).set(req.body).where(eq(followUpsTable.id, id)).returning();
    if (!followUp) return res.status(404).json({ error: "Not found" });
    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, followUp.childId));
    res.json({ ...followUp, childName: childFull?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to update follow-up");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select({ childId: followUpsTable.childId }).from(followUpsTable).where(eq(followUpsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    await db.delete(followUpsTable).where(eq(followUpsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete follow-up");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
