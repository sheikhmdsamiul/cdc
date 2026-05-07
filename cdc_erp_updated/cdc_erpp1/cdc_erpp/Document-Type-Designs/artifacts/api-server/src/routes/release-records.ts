import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { releaseRecordsTable, childrenTable } from "@workspace/db";
import { and, eq, desc } from "drizzle-orm";
import { checkManageAccess, getCurrentUser, moduleGuard } from "../middlewares/auth";

const router: IRouter = Router();

router.use(moduleGuard("release-records"));

const WORKFLOW = {
  DRAFT: "Draft",
  SUBMITTED_TO_PO: "Submitted to PO",
  UPDATE_NEEDED_BY_CW: "Update Needed by CW",
  SUBMITTED_TO_SUPT: "Submitted to SUPT",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const RELEASE_TRANSITIONS: Record<string, Record<string, { roles: string[]; next: string }>> = {
  [WORKFLOW.DRAFT]: {
    submit_to_po: { roles: ["CW"], next: WORKFLOW.SUBMITTED_TO_PO },
  },
  [WORKFLOW.UPDATE_NEEDED_BY_CW]: {
    submit_to_po: { roles: ["CW"], next: WORKFLOW.SUBMITTED_TO_PO },
  },
  // Map "Pending" to "Submitted to PO" for legacy records
  Pending: {
    forward_to_supt: { roles: ["PO"], next: WORKFLOW.SUBMITTED_TO_SUPT },
    update_needed_po: { roles: ["PO"], next: WORKFLOW.UPDATE_NEEDED_BY_CW },
  },
  [WORKFLOW.SUBMITTED_TO_PO]: {
    forward_to_supt: { roles: ["PO"], next: WORKFLOW.SUBMITTED_TO_SUPT },
    update_needed_po: { roles: ["PO"], next: WORKFLOW.UPDATE_NEEDED_BY_CW },
  },
  [WORKFLOW.SUBMITTED_TO_SUPT]: {
    approve: { roles: ["SUPT"], next: WORKFLOW.APPROVED },
    reject: { roles: ["SUPT"], next: WORKFLOW.REJECTED },
  },
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
  cwFeedback: releaseRecordsTable.cwFeedback,
  poFeedback: releaseRecordsTable.poFeedback,
  approvedByName: releaseRecordsTable.approvedByName,
  rejectedByName: releaseRecordsTable.rejectedByName,
  rejectionNote: releaseRecordsTable.rejectionNote,
  createdAt: releaseRecordsTable.createdAt,
};

// GET /api/release-records
router.get("/", async (req, res) => {
  try {
    const { childId, status } = req.query as Record<string, string>;

    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const isGlobal = user.roleName === "Super Admin" || user.roleName === "Head Office";
    const userCenterId = user.centerId;

    if (!isGlobal && !userCenterId) return res.json([]);

    let query = db.select(SELECT_FIELDS).from(releaseRecordsTable)
      .leftJoin(childrenTable, eq(releaseRecordsTable.childId, childrenTable.id));

    if (!isGlobal) {
      query = query.where(eq(childrenTable.centerId, userCenterId!)) as any;
    }

    let rows = await query.orderBy(desc(releaseRecordsTable.createdAt));
    if (childId) rows = rows.filter((r: any) => r.childId === parseInt(childId));
    if (status) rows = rows.filter((r: any) => r.approvalStatus === status);
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

    // Only allow editing Draft or Update Needed records
    const editableStatuses = [WORKFLOW.DRAFT, WORKFLOW.UPDATE_NEEDED_BY_CW];
    if (!editableStatuses.includes(existing.approvalStatus)) {
      return res.status(400).json({ error: "Cannot edit a record that is currently under review or finalized" });
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
    const workflowRole = user.workflowRole ?? "";
    const state = existing.approvalStatus ?? WORKFLOW.DRAFT;
    const isAdmin = role === "Super Admin" || role === "Head Office" || role === "Center Admin";
    
    const transition = RELEASE_TRANSITIONS[state]?.[action!];
    if (!transition) {
      return res.status(403).json({ error: "Invalid action for current state", state, action });
    }

    if (!isAdmin && !transition.roles.includes(workflowRole)) {
      return res.status(403).json({ error: `Action '${action}' requires one of these workflow roles: ${transition.roles.join(", ")}` });
    }

    const nextState = transition.next;
    const updates: Record<string, any> = {};
    const feedback = req.body.feedback?.trim();

    // Apply specific field updates based on action
    if (action === "submit_to_po") {
      updates.submittedBy = user.fullName ?? user.username;
      updates.cwFeedback = null;
      updates.poFeedback = null;
      updates.rejectionNote = null;
    } else if (action === "update_needed_po") {
      if (!feedback) return res.status(400).json({ error: "Feedback is required" });
      updates.poFeedback = feedback;
    } else if (action === "forward_to_supt") {
      updates.poFeedback = feedback || null;
    } else if (action === "approve") {
      updates.authorityApproval = "Yes";
      updates.approvedByName = user.fullName ?? user.username;
      updates.rejectionNote = null;
      await db.update(childrenTable).set({ currentStatus: "Released" }).where(eq(childrenTable.id, existing.childId!));
    } else if (action === "reject") {
      if (!feedback) return res.status(400).json({ error: "Rejection note is required" });
      updates.rejectionNote = feedback;
      updates.rejectedByName = user.fullName ?? user.username;
      updates.authorityApproval = "Reject";
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
