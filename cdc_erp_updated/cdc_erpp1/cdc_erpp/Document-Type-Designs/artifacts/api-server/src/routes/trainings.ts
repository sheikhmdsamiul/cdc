import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { trainingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: trainingsTable.id,
        nameBn: trainingsTable.nameBn,
        nameEn: trainingsTable.nameEn,
        isActive: trainingsTable.isActive,
      })
      .from(trainingsTable)
      .orderBy(trainingsTable.id);

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list trainings");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nameBn, nameEn, isActive } = req.body;
    const [newTraining] = await db
      .insert(trainingsTable)
      .values({ nameBn, nameEn, isActive: isActive ?? true })
      .returning();
    res.status(201).json(newTraining);
  } catch (err) {
    req.log.error({ err }, "Failed to create training");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nameBn, nameEn, isActive } = req.body;
    const [updated] = await db
      .update(trainingsTable)
      .set({ nameBn, nameEn, isActive })
      .where(eq(trainingsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Training not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update training");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [deleted] = await db
      .delete(trainingsTable)
      .where(eq(trainingsTable.id, id))
      .returning();
    if (!deleted) return res.status(404).json({ error: "Training not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete training");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
