import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { classesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: classesTable.id,
        nameBn: classesTable.nameBn,
        nameEn: classesTable.nameEn,
        isActive: classesTable.isActive,
      })
      .from(classesTable)
      .orderBy(classesTable.id);

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list classes");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nameBn, nameEn, isActive } = req.body;
    const [newClass] = await db
      .insert(classesTable)
      .values({ nameBn, nameEn, isActive: isActive ?? true })
      .returning();
    res.status(201).json(newClass);
  } catch (err) {
    req.log.error({ err }, "Failed to create class");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nameBn, nameEn, isActive } = req.body;
    const [updated] = await db
      .update(classesTable)
      .set({ nameBn, nameEn, isActive })
      .where(eq(classesTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Class not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update class");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [deleted] = await db
      .delete(classesTable)
      .where(eq(classesTable.id, id))
      .returning();
    if (!deleted) return res.status(404).json({ error: "Class not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete class");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
