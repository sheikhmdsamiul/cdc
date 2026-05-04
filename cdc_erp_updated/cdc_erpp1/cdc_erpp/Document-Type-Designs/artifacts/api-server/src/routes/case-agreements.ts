import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { caseAgreementsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const { caseId } = req.query as Record<string, string>;
    let query = db.select().from(caseAgreementsTable).$dynamic();
    if (caseId) query = query.where(eq(caseAgreementsTable.caseId, parseInt(caseId)));
    const rows = await query.orderBy(desc(caseAgreementsTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list case agreements");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const [row] = await db.insert(caseAgreementsTable).values(req.body).returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to create case agreement");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(caseAgreementsTable).where(eq(caseAgreementsTable.id, parseInt(req.params.id)));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get case agreement");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const [row] = await db.update(caseAgreementsTable).set(req.body).where(eq(caseAgreementsTable.id, parseInt(req.params.id))).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to update case agreement");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
