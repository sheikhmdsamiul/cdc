import { Router } from "express";
import bcryptjs from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, rolesTable, centersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

const userQuery = () =>
  db.select({
    id: usersTable.id,
    username: usersTable.username,
    fullName: usersTable.fullName,
    email: usersTable.email,
    roleId: usersTable.roleId,
    roleName: rolesTable.roleName,
    centerId: usersTable.centerId,
    centerName: centersTable.centerName,
    centerNameBn: centersTable.centerNameBn,
    administrativeUnitId: usersTable.administrativeUnitId,
    isActive: usersTable.isActive,
    createdAt: usersTable.createdAt,
  })
  .from(usersTable)
  .leftJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
  .leftJoin(centersTable, eq(usersTable.centerId, centersTable.id));

router.get("/", requireAuth, async (req, res) => {
  const users = await userQuery();
  res.json({ users, total: users.length });
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const users = await userQuery().where(eq(usersTable.id, id)).limit(1);
  if (!users[0]) { res.status(404).json({ error: "Not found" }); return; }
  res.json(users[0]);
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { username, fullName, email, password, roleId, centerId, administrativeUnitId } = req.body;
    if (!username || !fullName || !password) {
      res.status(400).json({ error: "username, fullName, and password required" });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (existing.length > 0) {
      if (!existing[0].isActive) {
        res.status(400).json({ error: "এই ব্যবহারকারীর নাম (username) আগে থেকেই আছে কিন্তু মুছে ফেলা হয়েছে। নতুন করে তৈরি করার বদলে এটি পুনরায় সক্রিয় (reactivate) করুন।" });
        return;
      }
      res.status(400).json({ error: "Username already exists." });
      return;
    }

    const passwordHash = await bcryptjs.hash(password, 12);
    const inserted = await db.insert(usersTable).values({
      username, fullName, email, passwordHash,
      roleId: roleId ? Number(roleId) : null,
      centerId: centerId ? Number(centerId) : null,
      administrativeUnitId: administrativeUnitId ? Number(administrativeUnitId) : null,
      isActive: true,
    }).returning({ id: usersTable.id });
    const newUser = await userQuery().where(eq(usersTable.id, inserted[0].id)).limit(1);
    res.status(201).json(newUser[0]);
  } catch (err: any) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { fullName, email, password, roleId, centerId, administrativeUnitId, isActive } = req.body;
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (fullName !== undefined) updates.fullName = fullName;
  if (email !== undefined) updates.email = email;
  if (roleId !== undefined) updates.roleId = roleId ? Number(roleId) : null;
  if (centerId !== undefined) updates.centerId = centerId ? Number(centerId) : null;
  if (administrativeUnitId !== undefined) updates.administrativeUnitId = administrativeUnitId ? Number(administrativeUnitId) : null;
  if (isActive !== undefined) updates.isActive = isActive;
  if (password) updates.passwordHash = await bcryptjs.hash(password, 12);
  await db.update(usersTable).set(updates).where(eq(usersTable.id, id));
  const updated = await userQuery().where(eq(usersTable.id, id)).limit(1);
  res.json(updated[0]);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  await db.update(usersTable).set({ isActive: false }).where(eq(usersTable.id, id));
  res.json({ ok: true });
});

export default router;
