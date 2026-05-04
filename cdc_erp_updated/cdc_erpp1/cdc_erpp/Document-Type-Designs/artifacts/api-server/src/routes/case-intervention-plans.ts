import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { caseInterventionPlansTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const { caseId } = req.query as Record<string, string>;
    let query = db.select().from(caseInterventionPlansTable).$dynamic();
    if (caseId) query = query.where(eq(caseInterventionPlansTable.caseId, parseInt(caseId)));
    const rows = await query.orderBy(desc(caseInterventionPlansTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list intervention plans");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const [row] = await db.insert(caseInterventionPlansTable).values(req.body).returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to create intervention plan");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(caseInterventionPlansTable).where(eq(caseInterventionPlansTable.id, parseInt(req.params.id)));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get intervention plan");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const [row] = await db.update(caseInterventionPlansTable).set(req.body).where(eq(caseInterventionPlansTable.id, parseInt(req.params.id))).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to update intervention plan");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
