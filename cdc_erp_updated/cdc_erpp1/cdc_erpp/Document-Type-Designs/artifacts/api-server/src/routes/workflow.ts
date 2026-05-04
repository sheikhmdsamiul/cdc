import { Router } from "express";
import { db } from "@workspace/db";
import { casesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { getCurrentUser } from "../middlewares/auth";

const router = Router();

export const WORKFLOW_STATES = {
  DRAFT: "Draft",
  SUBMITTED_TO_DF: "Submitted to DF",
  REVIEWED_BY_DF: "Reviewed by DF",
  REVIEWED_BY_PO: "Reviewed by PO",
  SENT_BACK_TO_PO: "Sent Back to PO",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

type RolePerms = {
  canSubmitToDf: boolean;
  canReviewAsDf: boolean;
  canReviewAsPo: boolean;
  canResubmit: boolean;
  canFinalApprove: boolean;
  canSendBack: boolean;
  canReject: boolean;
  canReopen: boolean;
};

const ROLE_PERMS: Record<string, RolePerms> = {
  "Case Worker": {
    canSubmitToDf: true,
    canReviewAsDf: false,
    canReviewAsPo: false,
    canResubmit: false,
    canFinalApprove: false,
    canSendBack: false,
    canReject: false,
    canReopen: false,
  },
  "District Facilitator": {
    canSubmitToDf: false,
    canReviewAsDf: true,
    canReviewAsPo: false,
    canResubmit: false,
    canFinalApprove: false,
    canSendBack: false,
    canReject: true,
    canReopen: false,
  },
  "Probation Officer": {
    canSubmitToDf: false,
    canReviewAsDf: false,
    canReviewAsPo: true,
    canResubmit: true,
    canFinalApprove: false,
    canSendBack: false,
    canReject: true,
    canReopen: false,
  },
  "Superintendent": {
    canSubmitToDf: false,
    canReviewAsDf: false,
    canReviewAsPo: false,
    canResubmit: false,
    canFinalApprove: true,
    canSendBack: true,
    canReject: true,
    canReopen: true,
  },
  "Center Admin": {
    canSubmitToDf: true,
    canReviewAsDf: true,
    canReviewAsPo: true,
    canResubmit: true,
    canFinalApprove: true,
    canSendBack: true,
    canReject: true,
    canReopen: true,
  },
  "Super Admin": {
    canSubmitToDf: true,
    canReviewAsDf: true,
    canReviewAsPo: true,
    canResubmit: true,
    canFinalApprove: true,
    canSendBack: true,
    canReject: true,
    canReopen: true,
  },
  "Head Office": {
    canSubmitToDf: true,
    canReviewAsDf: true,
    canReviewAsPo: true,
    canResubmit: true,
    canFinalApprove: true,
    canSendBack: true,
    canReject: true,
    canReopen: true,
  },
  "Worker": {
    canSubmitToDf: false,
    canReviewAsDf: false,
    canReviewAsPo: false,
    canResubmit: false,
    canFinalApprove: false,
    canSendBack: false,
    canReject: false,
    canReopen: false,
  },
  "House Parent": {
    canSubmitToDf: false,
    canReviewAsDf: false,
    canReviewAsPo: false,
    canResubmit: false,
    canFinalApprove: false,
    canSendBack: false,
    canReject: false,
    canReopen: false,
  },
};

router.post("/cases/:id/action", requireAuth, async (req, res) => {
  const caseId = Number(req.params.id);
  const { action, notes } = req.body;
  const user = await getCurrentUser(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const cases = await db.select().from(casesTable).where(eq(casesTable.id, caseId)).limit(1);
  const caseRecord = cases[0];
  if (!caseRecord) { res.status(404).json({ error: "Case not found" }); return; }

  const roleName = user.roleName ?? "";
  const perms = ROLE_PERMS[roleName] ?? {
    canSubmitToDf: false, canReviewAsDf: false, canReviewAsPo: false,
    canResubmit: false, canFinalApprove: false, canSendBack: false,
    canReject: false, canReopen: false,
  };
  const current = caseRecord.workflowState;
  const S = WORKFLOW_STATES;

  let newState: string | null = null;
  const updates: Partial<typeof casesTable.$inferInsert> = {};

  if (action === "submit_to_df" && perms.canSubmitToDf && current === S.DRAFT) {
    newState = S.SUBMITTED_TO_DF;
    updates.submittedById = user.id;
  } else if (action === "review_by_df" && perms.canReviewAsDf && current === S.SUBMITTED_TO_DF) {
    newState = S.REVIEWED_BY_DF;
    updates.reviewedByDfId = user.id;
  } else if (action === "review_by_po" && perms.canReviewAsPo && current === S.REVIEWED_BY_DF) {
    newState = S.REVIEWED_BY_PO;
    updates.reviewedByProbationId = user.id;
  } else if (action === "resubmit" && perms.canResubmit && current === S.SENT_BACK_TO_PO) {
    newState = S.REVIEWED_BY_PO;
    updates.reviewedByProbationId = user.id;
    updates.sentBackNotes = null;
  } else if (action === "final_approve" && perms.canFinalApprove && current === S.REVIEWED_BY_PO) {
    newState = S.APPROVED;
    updates.approvedById = user.id;
    updates.caseStatus = "Closed";
  } else if (action === "send_back" && perms.canSendBack && current === S.REVIEWED_BY_PO) {
    newState = S.SENT_BACK_TO_PO;
    updates.sentBackNotes = notes || null;
  } else if (action === "reject" && perms.canReject) {
    newState = S.REJECTED;
    updates.caseStatus = "Closed";
  } else if (action === "reopen" && perms.canReopen) {
    newState = S.DRAFT;
    updates.caseStatus = "Open";
    updates.submittedById = null;
    updates.reviewedByDfId = null;
    updates.reviewedByProbationId = null;
    updates.approvedById = null;
    updates.sentBackNotes = null;
  } else {
    res.status(403).json({ error: "Action not permitted in current state" });
    return;
  }

  updates.workflowState = newState;
  if (notes && action !== "send_back") updates.workflowNotes = notes;

  await db.update(casesTable).set(updates).where(eq(casesTable.id, caseId));
  const updated = await db.select().from(casesTable).where(eq(casesTable.id, caseId)).limit(1);
  res.json(updated[0]);
});

router.get("/cases/:id/history", requireAuth, async (req, res) => {
  const caseId = Number(req.params.id);
  const cases = await db.select().from(casesTable).where(eq(casesTable.id, caseId)).limit(1);
  const caseRecord = cases[0];
  if (!caseRecord) { res.status(404).json({ error: "Not found" }); return; }
  res.json({
    workflowState: caseRecord.workflowState,
    workflowNotes: caseRecord.workflowNotes,
    sentBackNotes: caseRecord.sentBackNotes,
    submittedById: caseRecord.submittedById,
    reviewedByDfId: caseRecord.reviewedByDfId,
    reviewedByCaseworkerId: caseRecord.reviewedByCaseworkerId,
    reviewedByProbationId: caseRecord.reviewedByProbationId,
    approvedById: caseRecord.approvedById,
  });
});

export default router;
