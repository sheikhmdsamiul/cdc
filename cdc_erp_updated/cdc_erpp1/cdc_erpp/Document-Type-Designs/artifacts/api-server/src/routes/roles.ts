import { Router } from "express";
import { db } from "@workspace/db";
import { rolesTable } from "@workspace/db/schema";
import { requireAuth, getCurrentUser } from "../middlewares/auth";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const roles = await db.select().from(rolesTable).orderBy(rolesTable.id);
  res.json({ roles, total: roles.length });
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (user?.roleName !== "Super Admin") {
      return res.status(403).json({ error: "Forbidden: only Super Admin can add roles" });
    }

    const { roleName, scope = "Center", accessType = "Filtered", description = "" } = req.body;
    if (!roleName) return res.status(400).json({ error: "roleName is required" });

    const [newRole] = await db.insert(rolesTable).values({
      roleName,
      scope,
      accessType,
      description
    }).returning();

    res.status(201).json({ role: newRole });
  } catch (err: any) {
    if (err.code === "23505") { // Unique violation
      return res.status(400).json({ error: "Role name already exists" });
    }
    res.status(500).json({ error: "Failed to create role", details: String(err) });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (user?.roleName !== "Super Admin") {
      return res.status(403).json({ error: "Forbidden: only Super Admin can delete roles" });
    }

    const id = parseInt(req.params.id, 10);
    const [deleted] = await db.delete(rolesTable).where(eq(rolesTable.id, id)).returning();
    
    if (!deleted) return res.status(404).json({ error: "Role not found" });
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete role", details: String(err) });
  }
});

export default router;
