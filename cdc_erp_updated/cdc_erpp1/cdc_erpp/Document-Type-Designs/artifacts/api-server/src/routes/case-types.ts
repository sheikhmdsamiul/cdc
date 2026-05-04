import { Router } from "express";
import { db } from "@workspace/db";
import { caseTypesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const rows = await db.select().from(caseTypesTable).orderBy(caseTypesTable.id);
    res.json({ caseTypes: rows, total: rows.length });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const rows = await db.select().from(caseTypesTable).where(eq(caseTypesTable.id, id)).limit(1);
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json(rows[0]);
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { nameBn, nameEn, isActive } = req.body;
    if (!nameBn || !nameEn) {
      res.status(400).json({ error: "nameBn and nameEn are required" });
      return;
    }
    const inserted = await db.insert(caseTypesTable).values({
      nameBn, nameEn, isActive: isActive ?? true,
    }).returning();
    res.status(201).json(inserted[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nameBn, nameEn, isActive } = req.body;
    const updated = await db.update(caseTypesTable)
      .set({ nameBn, nameEn, isActive })
      .where(eq(caseTypesTable.id, id))
      .returning();
    if (!updated[0]) { res.status(404).json({ error: "Not found" }); return; }
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(caseTypesTable).where(eq(caseTypesTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
