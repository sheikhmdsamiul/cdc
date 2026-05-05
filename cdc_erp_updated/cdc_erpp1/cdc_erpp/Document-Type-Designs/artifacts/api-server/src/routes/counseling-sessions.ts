import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { counselingSessionsTable, childrenTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { checkManageAccess, getCurrentUser, moduleGuard } from "../middlewares/auth";

const router: IRouter = Router();

router.use(moduleGuard("counseling"));

function generateSessionId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `CNSL-${year}-${rand}`;
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
        id: counselingSessionsTable.id,
        sessionId: counselingSessionsTable.sessionId,
        childId: counselingSessionsTable.childId,
        childName: childrenTable.fullName,
        sessionDate: counselingSessionsTable.sessionDate,
        counselor: counselingSessionsTable.counselor,
        sessionType: counselingSessionsTable.sessionType,
        issuesDiscussed: counselingSessionsTable.issuesDiscussed,
        observations: counselingSessionsTable.observations,
        outcome: counselingSessionsTable.outcome,
        nextSessionDate: counselingSessionsTable.nextSessionDate,
        createdAt: counselingSessionsTable.createdAt,
      })
      .from(counselingSessionsTable)
      .leftJoin(childrenTable, eq(counselingSessionsTable.childId, childrenTable.id));

    if (!isGlobal) {
      query = query.where(eq(childrenTable.centerId, userCenterId!)) as any;
    }

    const rows = await query.orderBy(desc(counselingSessionsTable.createdAt));

    let filtered = rows;
    if (childId) filtered = filtered.filter(r => r.childId === parseInt(childId));
    res.json(filtered);
  } catch (err) {
    req.log.error({ err }, "Failed to list counseling sessions");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, parseInt(req.body.childId)));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    const [session] = await db.insert(counselingSessionsTable).values({
      ...req.body,
      sessionId: generateSessionId(),
    }).returning();
    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, session.childId));
    res.status(201).json({ ...session, childName: childFull?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to create counseling session");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db
      .select({
        id: counselingSessionsTable.id,
        sessionId: counselingSessionsTable.sessionId,
        childId: counselingSessionsTable.childId,
        childName: childrenTable.fullName,
        sessionDate: counselingSessionsTable.sessionDate,
        counselor: counselingSessionsTable.counselor,
        sessionType: counselingSessionsTable.sessionType,
        issuesDiscussed: counselingSessionsTable.issuesDiscussed,
        observations: counselingSessionsTable.observations,
        outcome: counselingSessionsTable.outcome,
        nextSessionDate: counselingSessionsTable.nextSessionDate,
        createdAt: counselingSessionsTable.createdAt,
      })
      .from(counselingSessionsTable)
      .leftJoin(childrenTable, eq(counselingSessionsTable.childId, childrenTable.id))
      .where(eq(counselingSessionsTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found", message: "Session not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get counseling session");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select({ childId: counselingSessionsTable.childId }).from(counselingSessionsTable).where(eq(counselingSessionsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    const [session] = await db.update(counselingSessionsTable).set(req.body).where(eq(counselingSessionsTable.id, id)).returning();
    if (!session) return res.status(404).json({ error: "Not found", message: "Session not found" });
    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, session.childId));
    res.json({ ...session, childName: childFull?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to update counseling session");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select({ childId: counselingSessionsTable.childId }).from(counselingSessionsTable).where(eq(counselingSessionsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    await db.delete(counselingSessionsTable).where(eq(counselingSessionsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete counseling session");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
