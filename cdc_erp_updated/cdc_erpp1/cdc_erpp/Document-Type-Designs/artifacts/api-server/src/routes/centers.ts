import { Router } from "express";
import { db } from "@workspace/db";
import { centersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/", async (req, res) => {
  const centers = await db.select().from(centersTable).orderBy(centersTable.id);
  res.json({ centers, total: centers.length });
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const rows = await db.select().from(centersTable).where(eq(centersTable.id, id)).limit(1);
  if (!rows[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json(rows[0]);
});

router.post("/", requireAuth, async (req, res) => {
  const { centerName, centerNameBn, centerType, location, address, isHq } = req.body;
  if (!centerName || !centerType) {
    res.status(400).json({ error: "centerName and centerType required" });
    return;
  }
  const inserted = await db.insert(centersTable).values({
    centerName, centerNameBn, centerType, location, address, isHq: isHq ?? "no",
  }).returning();
  res.status(201).json(inserted[0]);
});

router.put("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { centerName, centerNameBn, centerType, location, address, isHq } = req.body;
  await db.update(centersTable).set({ centerName, centerNameBn, centerType, location, address, isHq }).where(eq(centersTable.id, id));
  const updated = await db.select().from(centersTable).where(eq(centersTable.id, id)).limit(1);
  res.json(updated[0]);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(centersTable).where(eq(centersTable.id, id));
  res.json({ ok: true });
});

export default router;
