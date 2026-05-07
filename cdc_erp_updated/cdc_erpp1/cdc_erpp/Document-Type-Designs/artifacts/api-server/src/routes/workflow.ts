import { Router } from "express";
import { db } from "@workspace/db";
import { casesTable, courtCasesTable, workflowLogsTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "../middlewares/auth";

const router = Router();

const WORKFLOW_STATES = {
  DRAFT: "Draft",
  SUBMITTED_TO_PO: "submitted_to_po",
  REVIEWED_BY_PO: "reviewed_by_po",
  SUBMITTED_TO_SUPT: "submitted_to_supt",
  APPROVED: "approved",
  REJECTED: "rejected",
  SENT_BACK_TO_CW: "sent_back_to_cw",
};

router.get("/:recordType/:recordId/logs", async (req, res) => {
  try {
    const { recordType, recordId } = req.params;
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const logs = await db
      .select({
        id: workflowLogsTable.id,
        action: workflowLogsTable.action,
        message: workflowLogsTable.message,
        createdAt: workflowLogsTable.createdAt,
        userName: usersTable.username,
        fullName: usersTable.fullName,
      })
      .from(workflowLogsTable)
      .leftJoin(usersTable, eq(workflowLogsTable.userId, usersTable.id))
      .where(eq(workflowLogsTable.recordType, recordType))
      .where(eq(workflowLogsTable.recordId, parseInt(recordId)))
      .orderBy(workflowLogsTable.createdAt);

    res.json(logs);
  } catch (err) {
    req.log.error({ err }, "Failed to get workflow logs");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/:recordType/:recordId/transition", async (req, res) => {
  try {
    const { recordType, recordId } = req.params;
    const { action, message, feedback } = req.body;
    
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const parsedId = parseInt(recordId);
    let table: any;
    let existing: any;

    if (recordType === "case") {
      table = casesTable;
      const [row] = await db.select().from(casesTable).where(eq(casesTable.id, parsedId));
      existing = row;
    } else if (recordType === "court_case") {
      table = courtCasesTable;
      const [row] = await db.select().from(courtCasesTable).where(eq(courtCasesTable.id, parsedId));
      existing = row;
    } else {
      return res.status(400).json({ error: "Invalid record type" });
    }

    if (!existing) return res.status(404).json({ error: "Record not found" });

    let newState = existing.workflowState;
    const updates: any = {};

    // Role-based actions (no separate actions needed - role determines what user can do)
    const userRole = user.roleName;

    switch (action) {
      // CW submits to PO
      case "submit_to_po":
        newState = WORKFLOW_STATES.SUBMITTED_TO_PO;
        updates.submittedById = user.id;
        break;
      
      // PO reviews and sends to Supt
      case "submit_to_supt":
        newState = WORKFLOW_STATES.SUBMITTED_TO_SUPT;
        updates.reviewedByProbationId = user.id;
        break;
      
      // PO sends back to CW with feedback
      case "send_back_to_cw":
        newState = WORKFLOW_STATES.SENT_BACK_TO_CW;
        updates.reviewedByProbationId = user.id;
        updates.sentBackNotes = feedback || message;
        break;
      
      // PO has reviewed (intermediate state)
      case "mark_reviewed":
        newState = WORKFLOW_STATES.REVIEWED_BY_PO;
        updates.reviewedByProbationId = user.id;
        break;
      
      // Supt approves
      case "approve":
        newState = WORKFLOW_STATES.APPROVED;
        updates.approvedById = user.id;
        break;
      
      // Supt rejects
      case "reject":
        newState = WORKFLOW_STATES.REJECTED;
        updates.approvedById = user.id;
        updates.workflowNotes = message || feedback;
        break;
      
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    updates.workflowState = newState;

    await db.update(table).set(updates).where(eq(table.id, parsedId));

    await db.insert(workflowLogsTable).values({
      recordType,
      recordId: parsedId,
      userId: user.id,
      action,
      message: feedback || message || null,
    });

    res.json({ ok: true, workflowState: newState });
  } catch (err) {
    req.log.error({ err }, "Failed to transition workflow");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;