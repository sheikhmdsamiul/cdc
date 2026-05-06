import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { casesTable, childrenTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { checkManageAccess, getCurrentUser, moduleGuard } from "../middlewares/auth";

const router: IRouter = Router();

router.use(moduleGuard("cases"));

function generateCaseId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `CASE-${year}-${rand}`;
}

router.get("/", async (req, res) => {
  try {
    const { childId, status } = req.query as Record<string, string>;

    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const isGlobal = user.roleName === "Super Admin" || user.roleName === "Head Office";
    const userCenterId = user.centerId;

    if (!isGlobal && !userCenterId) return res.json([]);

    let query = db
      .select({
        id: casesTable.id,
        caseId: casesTable.caseId,
        childId: casesTable.childId,
        childName: childrenTable.fullName,
        caseOpeningDate: casesTable.caseOpeningDate,
        assignedCaseWorker: casesTable.assignedCaseWorker,
        riskLevel: casesTable.riskLevel,
        caseStatus: casesTable.caseStatus,
        caseSummary: casesTable.caseSummary,
        investigationNotes: casesTable.investigationNotes,
        recommendation: casesTable.recommendation,
        workflowState: casesTable.workflowState,
        workflowNotes: casesTable.workflowNotes,
        sentBackNotes: casesTable.sentBackNotes,
        isSpecialCase: casesTable.isSpecialCase,
        isPriorityCase: casesTable.isPriorityCase,
        submittedById: casesTable.submittedById,
        centerId: casesTable.centerId,
        createdAt: casesTable.createdAt,
        updatedAt: casesTable.updatedAt,
      })
      .from(casesTable)
      .leftJoin(childrenTable, eq(casesTable.childId, childrenTable.id));

    if (!isGlobal) {
      query = query.where(eq(childrenTable.centerId, userCenterId)) as any;
    }

    const rows = await query.orderBy(desc(casesTable.createdAt));

    let filtered = rows;
    if (childId) filtered = filtered.filter(r => r.childId === parseInt(childId));
    if (status) filtered = filtered.filter(r => r.caseStatus === status);

    res.json(filtered);
  } catch (err) {
    req.log.error({ err }, "Failed to list cases");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const [caseFile] = await db.insert(casesTable).values({
      ...req.body,
      caseId: generateCaseId(),
    }).returning();

    const [child] = await db.select().from(childrenTable).where(eq(childrenTable.id, caseFile.childId));
    res.status(201).json({ ...caseFile, childName: child?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to create case");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db
      .select({
        id: casesTable.id,
        caseId: casesTable.caseId,
        childId: casesTable.childId,
        childName: childrenTable.fullName,
        caseOpeningDate: casesTable.caseOpeningDate,
        assignedCaseWorker: casesTable.assignedCaseWorker,
        riskLevel: casesTable.riskLevel,
        caseStatus: casesTable.caseStatus,
        caseSummary: casesTable.caseSummary,
        investigationNotes: casesTable.investigationNotes,
        recommendation: casesTable.recommendation,
        workflowState: casesTable.workflowState,
        workflowNotes: casesTable.workflowNotes,
        sentBackNotes: casesTable.sentBackNotes,
        isSpecialCase: casesTable.isSpecialCase,
        isPriorityCase: casesTable.isPriorityCase,
        submittedById: casesTable.submittedById,
        reviewedByDfId: casesTable.reviewedByDfId,
        reviewedByProbationId: casesTable.reviewedByProbationId,
        approvedById: casesTable.approvedById,
        centerId: casesTable.centerId,
        createdAt: casesTable.createdAt,
        updatedAt: casesTable.updatedAt,
      })
      .from(casesTable)
      .leftJoin(childrenTable, eq(casesTable.childId, childrenTable.id))
      .where(eq(casesTable.id, id));

    if (!row) return res.status(404).json({ error: "Not found", message: "Case not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get case");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select({ childId: casesTable.childId }).from(casesTable).where(eq(casesTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    // Strip workflow-controlled fields so regular edits cannot overwrite them
    const { workflowState, workflowNotes, sentBackNotes, submittedById, reviewedByDfId, reviewedByProbationId, approvedById, ...safeBody } = req.body;

    const [caseFile] = await db.update(casesTable).set(safeBody).where(eq(casesTable.id, id)).returning();
    if (!caseFile) return res.status(404).json({ error: "Not found", message: "Case not found" });
    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, caseFile.childId));
    res.json({ ...caseFile, childName: childFull?.fullName, _debug_reqBody: req.body, _debug_safeBody: safeBody });
  } catch (err) {
    req.log.error({ err }, "Failed to update case");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select({ childId: casesTable.childId }).from(casesTable).where(eq(casesTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    await db.delete(casesTable).where(eq(casesTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete case");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
