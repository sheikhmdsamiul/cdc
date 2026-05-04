import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { caseRiskAssessmentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const { caseId } = req.query as Record<string, string>;
    let query = db.select().from(caseRiskAssessmentsTable).$dynamic();
    if (caseId) query = query.where(eq(caseRiskAssessmentsTable.caseId, parseInt(caseId)));
    const rows = await query.orderBy(desc(caseRiskAssessmentsTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list case risk assessments");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const [row] = await db.insert(caseRiskAssessmentsTable).values(req.body).returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to create case risk assessment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(caseRiskAssessmentsTable).where(eq(caseRiskAssessmentsTable.id, parseInt(req.params.id)));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get case risk assessment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const [row] = await db.update(caseRiskAssessmentsTable).set(req.body).where(eq(caseRiskAssessmentsTable.id, parseInt(req.params.id))).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to update case risk assessment");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
