// @ts-nocheck
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { policeAcquisitionsTable, childrenTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser, moduleGuard, requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.use(moduleGuard("police-requisitions"));

function generateRequisitionId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `REQ-${year}-${rand}`;
}

const SELECT_FIELDS = {
  id: policeAcquisitionsTable.id,
  acquisitionId: policeAcquisitionsTable.acquisitionId,
  childId: policeAcquisitionsTable.childId,
  childName: childrenTable.fullName,
  hearingDate: policeAcquisitionsTable.hearingDate,
  courtName: policeAcquisitionsTable.courtName,
  caseNumber: policeAcquisitionsTable.caseNumber,
  policeStation: policeAcquisitionsTable.policeStation,
  officersRequired: policeAcquisitionsTable.officersRequired,
  escortDepartureTime: policeAcquisitionsTable.escortDepartureTime,
  requisitionDate: policeAcquisitionsTable.requisitionDate,
  status: policeAcquisitionsTable.status,
  requestedById: policeAcquisitionsTable.requestedById,
  centerId: policeAcquisitionsTable.centerId,
  policeOfficerName: policeAcquisitionsTable.policeOfficerName,
  acknowledgementRef: policeAcquisitionsTable.acknowledgementRef,
  remarks: policeAcquisitionsTable.remarks,
  reasonForTransfer: policeAcquisitionsTable.reasonForTransfer,
  receivingAuthority: policeAcquisitionsTable.receivingAuthority,
  createdAt: policeAcquisitionsTable.createdAt,
  updatedAt: policeAcquisitionsTable.updatedAt,
};

router.get("/", requireAuth, async (req, res) => {
  try {
    const { childId, status } = req.query as Record<string, string>;

    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const isGlobal = user.roleName === "Super Admin" || user.roleName === "Head Office";
    const userCenterId = user.centerId;

    if (!isGlobal && !userCenterId) return res.json([]);

    let query = db
      .select(SELECT_FIELDS)
      .from(policeAcquisitionsTable)
      .leftJoin(childrenTable, eq(policeAcquisitionsTable.childId, childrenTable.id));

    if (!isGlobal) {
      query = query.where(eq(childrenTable.centerId, userCenterId!)) as any;
    }

    const rows = await query.orderBy(desc(policeAcquisitionsTable.createdAt));

    let filtered = rows;
    if (childId) filtered = filtered.filter(r => r.childId === parseInt(childId));
    if (status) filtered = filtered.filter(r => r.status === status);
    res.json(filtered);
  } catch (err) {
    req.log.error({ err }, "Failed to list police requisitions");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    const [acquisition] = await db.insert(policeAcquisitionsTable).values({
      ...req.body,
      acquisitionId: generateRequisitionId(),
      requestedById: user?.id ?? null,
      status: "Draft",
    }).returning();
    const [child] = await db.select().from(childrenTable).where(eq(childrenTable.id, acquisition.childId));
    res.status(201).json({ ...acquisition, childName: child?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to create police requisition");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db
      .select(SELECT_FIELDS)
      .from(policeAcquisitionsTable)
      .leftJoin(childrenTable, eq(policeAcquisitionsTable.childId, childrenTable.id))
      .where(eq(policeAcquisitionsTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found", message: "Requisition not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get police requisition");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(policeAcquisitionsTable).set(req.body).where(eq(policeAcquisitionsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    const [child] = await db.select().from(childrenTable).where(eq(childrenTable.id, updated.childId));
    res.json({ ...updated, childName: child?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to update police requisition");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await getCurrentUser(req);
    const [existing] = await db.select({ childId: policeAcquisitionsTable.childId }).from(policeAcquisitionsTable).where(eq(policeAcquisitionsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (user?.roleName !== "Super Admin" && user?.roleName !== "Center Admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    await db.delete(policeAcquisitionsTable).where(eq(policeAcquisitionsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete police requisition");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, acknowledgementRef, policeOfficerName } = req.body;
    const [updated] = await db.update(policeAcquisitionsTable)
      .set({ status, ...(acknowledgementRef ? { acknowledgementRef } : {}), ...(policeOfficerName ? { policeOfficerName } : {}) })
      .where(eq(policeAcquisitionsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update status");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
