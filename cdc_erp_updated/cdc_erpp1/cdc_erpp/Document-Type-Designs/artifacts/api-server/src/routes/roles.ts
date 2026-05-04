import { Router } from "express";
import { db } from "@workspace/db";
import { rolesTable } from "@workspace/db/schema";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/", async (req, res) => {
  const roles = await db.select().from(rolesTable).orderBy(rolesTable.id);
  res.json({ roles, total: roles.length });
});

export default router;
