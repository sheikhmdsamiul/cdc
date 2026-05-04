import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { releaseRecordsTable, childrenTable } from "@workspace/db";
import { and, eq, desc } from "drizzle-orm";
import { checkManageAccess, getCurrentUser } from "../middlewares/auth";

const router: IRouter = Router();

const WORKFLOW = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

function generateReleaseId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `RLS-${year}-${rand}`;
}

const SELECT_FIELDS = {
  id: releaseRecordsTable.id,
  releaseId: releaseRecordsTable.releaseId,
  childId: releaseRecordsTable.childId,
  childName: childrenTable.fullName,
  releaseDate: releaseRecordsTable.releaseDate,
  releaseType: releaseRecordsTable.releaseType,
  handedOverTo: releaseRecordsTable.handedOverTo,
  authorityApproval: releaseRecordsTable.authorityApproval,
  remarks: releaseRecordsTable.remarks,
  approvalStatus: releaseRecordsTable.approvalStatus,
  submittedBy: releaseRecordsTable.submittedBy,
  approvedByName: releaseRecordsTable.approvedByName,
  rejectionNote: releaseRecordsTable.rejectionNote,
  createdAt: releaseRecordsTable.createdAt,
};

// GET /api/release-records
router.get("/", async (req, res) => {
  try {
    const { childId, status } = req.query as Record<string, string>;
    let rows = await db.select(SELECT_FIELDS).from(releaseRecordsTable)
      .leftJoin(childrenTable, eq(releaseRecordsTable.childId, childrenTable.id))
      .orderBy(desc(releaseRecordsTable.createdAt));
    if (childId) rows = rows.filter(r => r.childId === parseInt(childId));
    if (status) rows = rows.filter(r => r.approvalStatus === status);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list release records");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

// POST /api/release-records — create as Draft
router.post("/", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const childIdNum = parseInt(req.body.childId);
    if (isNaN(childIdNum)) {
      return res.status(400).json({ error: "Invalid childId", message: "A valid child must be selected." });
    }

    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, childIdNum));
    if (!child) return res.status(404).json({ error: "Child not found" });

    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    const [record] = await db.insert(releaseRecordsTable).values({
      ...req.body,
      childId: childIdNum,
      releaseId: generateReleaseId(),
      approvalStatus: WORKFLOW.DRAFT,
      submittedBy: user.fullName ?? user.username,
      authorityApproval: false,
    }).returning();

    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, record.childId));
    res.status(201).json({ ...record, childName: childFull?.fullName });
  } catch (err: any) {
    req.log.error({ err }, "Failed to create release record");
    res.status(500).json({ error: "Internal server error", message: err?.message ?? String(err) });
  }
});

// GET /api/release-records/:id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db.select(SELECT_FIELDS).from(releaseRecordsTable)
      .leftJoin(childrenTable, eq(releaseRecordsTable.childId, childrenTable.id))
      .where(eq(releaseRecordsTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get release record");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

// PUT /api/release-records/:id — update draft fields (only allowed before submission)
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select().from(releaseRecordsTable).where(eq(releaseRecordsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });

    // Only allow editing Draft records
    if (existing.approvalStatus !== WORKFLOW.DRAFT) {
      return res.status(400).json({ error: "Cannot edit a record that has been submitted or approved" });
    }

    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    const [record] = await db.update(releaseRecordsTable).set({ ...req.body, authorityApproval: false }).where(eq(releaseRecordsTable.id, id)).returning();
    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, record.childId));
    res.json({ ...record, childName: childFull?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to update release record");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

// POST /api/release-records/:id/action — workflow actions: submit, approve, reject
router.post("/:id/action", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { action, note } = req.body as { action: string; note?: string };
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const [existing] = await db.select(SELECT_FIELDS).from(releaseRecordsTable)
      .leftJoin(childrenTable, eq(releaseRecordsTable.childId, childrenTable.id))
      .where(eq(releaseRecordsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });

    const role = user.roleName ?? "";
    const state = existing.approvalStatus;
    const updates: Record<string, any> = {};
    let nextState = state;

    // DEO or Center Admin submits Draft → Submitted
    if (action === "submit" && state === WORKFLOW.DRAFT) {
      nextState = WORKFLOW.SUBMITTED;
      updates.submittedBy = user.fullName ?? user.username;
    }
    // Superintendent or Super Admin approves Submitted → Approved
    else if (action === "approve" && state === WORKFLOW.SUBMITTED && ["Superintendent", "Super Admin", "Center Admin"].includes(role)) {
      nextState = WORKFLOW.APPROVED;
      updates.authorityApproval = true;
      updates.approvedByName = user.fullName ?? user.username;
      updates.rejectionNote = null;
      // Update child status to Released
      await db.update(childrenTable).set({ currentStatus: "Released" }).where(eq(childrenTable.id, existing.childId!));
    }
    // Reject Submitted → Draft (send back for revision)
    else if (action === "reject" && state === WORKFLOW.SUBMITTED && ["Superintendent", "Super Admin", "Center Admin"].includes(role)) {
      if (!note?.trim()) return res.status(400).json({ error: "Rejection note is required" });
      nextState = WORKFLOW.DRAFT;
      updates.rejectionNote = note.trim();
      updates.authorityApproval = false;
    }
    else {
      return res.status(403).json({ error: "Action not permitted in current workflow state or role" });
    }

    updates.approvalStatus = nextState;
    const [record] = await db.update(releaseRecordsTable).set(updates).where(eq(releaseRecordsTable.id, id)).returning();
    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, record.childId));
    res.json({ ...record, childName: childFull?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to process release record action");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

// DELETE /api/release-records/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select({ childId: releaseRecordsTable.childId }).from(releaseRecordsTable).where(eq(releaseRecordsTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;
    await db.delete(releaseRecordsTable).where(eq(releaseRecordsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete release record");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
