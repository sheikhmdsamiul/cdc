import { Router } from "express";
import { db } from "@workspace/db";
import { casesTable, courtCasesTable, workflowLogsTable, usersTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "../middlewares/auth";

const router = Router();

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
        userRole: usersTable.roleId, // We might just want roleName, let's fetch it via a join or just username
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
    const { action, message, hearingDate } = req.body;
    
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

    switch (action) {
      case "submit_to_df":
        newState = "submitted_to_df";
        updates.submittedById = user.id;
        break;
      case "send_back_to_cw_by_df":
        newState = "sent_back_to_cw_by_df";
        updates.reviewedByDfId = user.id;
        updates.sentBackNotes = message;
        break;
      case "send_back_to_cw_by_po":
        newState = "sent_back_to_cw_by_po";
        updates.reviewedByProbationId = user.id;
        updates.sentBackNotes = message;
        break;
      case "submit_to_po":
        newState = "submitted_to_po";
        updates.reviewedByDfId = user.id;
        if (recordType === "court_case" && hearingDate) {
          updates.hearingDate = new Date(hearingDate);
        }
        break;
      case "submit_to_supt":
        newState = "submitted_to_supt";
        updates.reviewedByProbationId = user.id;
        break;
      case "approve":
        newState = "approved";
        updates.approvedById = user.id;
        break;
      case "reject":
        newState = "rejected";
        updates.approvedById = user.id;
        updates.workflowNotes = message;
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    updates.workflowState = newState;

    // Additional handling for CW submitting court case hearing date
    if (action === "submit_to_df" && recordType === "court_case" && hearingDate) {
      updates.hearingDate = new Date(hearingDate);
    }

    await db.update(table).set(updates).where(eq(table.id, parsedId));

    await db.insert(workflowLogsTable).values({
      recordType,
      recordId: parsedId,
      userId: user.id,
      action,
      message: message || null,
    });

    res.json({ ok: true, workflowState: newState });
  } catch (err) {
    req.log.error({ err }, "Failed to transition workflow");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
