import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  rolePermissionsTable,
  roleCenterAccessTable,
  rolesTable,
  centersTable,
  usersTable,
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "../middlewares/auth";

const router: IRouter = Router();

// ─── Module definitions ─────────────────────────────────────────────────────
export const MODULES = [
  { key: "dashboard",             labelBn: "ড্যাশবোর্ড",            labelEn: "Dashboard" },
  { key: "admissions",            labelBn: "ভর্তি",                  labelEn: "Admissions" },
  { key: "children",              labelBn: "শিশু প্রোফাইল",           labelEn: "Children" },
  { key: "cases",                 labelBn: "মামলা ফাইল",              labelEn: "Cases" },
  { key: "family-socioeconomic",  labelBn: "পারিবারিক আর্থ-সামাজিক", labelEn: "Family Socioeconomic" },
  { key: "health",                labelBn: "স্বাস্থ্য রেকর্ড",         labelEn: "Health Records" },
  { key: "counseling",            labelBn: "পরামর্শ",                 labelEn: "Counseling" },
  { key: "education-skills",      labelBn: "শিক্ষা ও দক্ষতা",         labelEn: "Education & Skills" },
  { key: "guardians",             labelBn: "অভিভাবক",                labelEn: "Guardians" },
  { key: "court-cases",           labelBn: "আদালত মামলা",             labelEn: "Court Cases" },
  { key: "police-requisitions",   labelBn: "পুলিশ তলব",              labelEn: "Police Requisitions" },
  { key: "risk-assessments",      labelBn: "ঝুঁকি মূল্যায়ন",          labelEn: "Risk Assessments" },
  { key: "release-records",       labelBn: "মুক্তি রেকর্ড",            labelEn: "Release Records" },
  { key: "follow-ups",            labelBn: "ফলো-আপ",                 labelEn: "Follow-ups" },
  { key: "reports",               labelBn: "প্রতিবেদন",               labelEn: "Reports" },
  { key: "measurement-surveys",   labelBn: "পরিমাপ জরিপ",             labelEn: "Measurement Surveys" },
];

// ─── GET /api/permissions?userId=X  OR  ?roleId=X ───────────────────────────
router.get("/", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    let roleId: number | null = null;

    if (req.query.userId) {
      // Resolve roleId from user
      const userId = parseInt(req.query.userId as string, 10);
      const [targetUser] = await db.select({ roleId: usersTable.roleId })
        .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!targetUser) return res.status(404).json({ error: "User not found" });
      roleId = targetUser.roleId ?? null;
    } else if (req.query.roleId) {
      roleId = parseInt(req.query.roleId as string, 10);
    }

    if (!roleId) return res.status(400).json({ error: "userId or roleId is required" });

    // Fetch existing permissions for this role
    const existing = await db
      .select()
      .from(rolePermissionsTable)
      .where(eq(rolePermissionsTable.roleId, roleId));

    const existingMap = new Map(existing.map((r) => [r.module, r]));

    // Return all modules, filling in defaults for any not yet in DB
    const matrix = MODULES.map((m) => {
      const row = existingMap.get(m.key);
      return {
        module: m.key,
        labelBn: m.labelBn,
        labelEn: m.labelEn,
        canView:   row?.canView   ?? false,
        canCreate: row?.canCreate ?? false,
        canEdit:   row?.canEdit   ?? false,
        canDelete: row?.canDelete ?? false,
      };
    });

    res.json({ roleId, matrix });
  } catch (err) {
    req.log.error({ err }, "Failed to get permissions");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

// ─── PUT /api/permissions ────────────────────────────────────────────────────
router.put("/", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (user.roleName !== "Super Admin") return res.status(403).json({ error: "Forbidden: only Super Admin can modify permissions" });

    let { roleId, userId, permissions } = req.body as {
      roleId?: number;
      userId?: number;
      permissions: Array<{ module: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }>;
    };

    // Resolve roleId from userId if not directly given
    if (!roleId && userId) {
      const [targetUser] = await db.select({ roleId: usersTable.roleId })
        .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (!targetUser?.roleId) return res.status(400).json({ error: "User has no role assigned" });
      roleId = targetUser.roleId;
    }

    if (!roleId || !Array.isArray(permissions)) {
      return res.status(400).json({ error: "roleId (or userId) and permissions[] are required" });
    }

    // Upsert each module permission
    for (const perm of permissions) {
      await db
        .insert(rolePermissionsTable)
        .values({
          roleId,
          module: perm.module,
          canView: perm.canView,
          canCreate: perm.canCreate,
          canEdit: perm.canEdit,
          canDelete: perm.canDelete,
        })
        .onConflictDoUpdate({
          target: [rolePermissionsTable.roleId, rolePermissionsTable.module],
          set: {
            canView: perm.canView,
            canCreate: perm.canCreate,
            canEdit: perm.canEdit,
            canDelete: perm.canDelete,
            updatedAt: new Date(),
          },
        });
    }

    res.json({ ok: true, roleId, updated: permissions.length });
  } catch (err) {
    req.log.error({ err }, "Failed to update permissions");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

// ─── GET /api/permissions/center-access?roleId=X ────────────────────────────
router.get("/center-access", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const roleId = req.query.roleId ? parseInt(req.query.roleId as string, 10) : null;
    if (!roleId) return res.status(400).json({ error: "roleId is required" });

    const rows = await db
      .select({ centerId: roleCenterAccessTable.centerId })
      .from(roleCenterAccessTable)
      .where(eq(roleCenterAccessTable.roleId, roleId));

    res.json({ roleId, centerIds: rows.map((r) => r.centerId) });
  } catch (err) {
    req.log.error({ err }, "Failed to get center access");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

// ─── PUT /api/permissions/center-access ──────────────────────────────────────
router.put("/center-access", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (user.roleName !== "Super Admin") return res.status(403).json({ error: "Forbidden: only Super Admin can modify center access" });

    const { roleId, centerIds } = req.body as { roleId: number; centerIds: number[] };

    if (!roleId || !Array.isArray(centerIds)) {
      return res.status(400).json({ error: "roleId and centerIds[] are required" });
    }

    // Replace all center access entries for this role
    await db.delete(roleCenterAccessTable).where(eq(roleCenterAccessTable.roleId, roleId));

    if (centerIds.length > 0) {
      await db.insert(roleCenterAccessTable).values(
        centerIds.map((centerId) => ({ roleId, centerId }))
      );
    }

    res.json({ ok: true, roleId, centerIds });
  } catch (err) {
    req.log.error({ err }, "Failed to update center access");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

// ─── GET /api/permissions/my-permissions ─────────────────────────────────────
// Returns the current user's full permission matrix + allowed center IDs.
// Called by the frontend at login to cache permissions.
router.get("/my-permissions", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const roleId = user.roleId;

    // Super Admin & Head Office get full access regardless of DB rows
    if (user.roleName === "Super Admin" || user.roleName === "Head Office") {
      const matrix: Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }> = {};
      for (const m of MODULES) {
        matrix[m.key] = { canView: true, canCreate: true, canEdit: true, canDelete: true };
      }
      return res.json({ matrix, centerIds: [] }); // empty = all centers
    }

    if (!roleId) {
      // No role = no access
      const matrix: Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }> = {};
      for (const m of MODULES) matrix[m.key] = { canView: false, canCreate: false, canEdit: false, canDelete: false };
      return res.json({ matrix, centerIds: [] });
    }

    const [perms, centerRows] = await Promise.all([
      db.select().from(rolePermissionsTable).where(eq(rolePermissionsTable.roleId, roleId)),
      db.select({ centerId: roleCenterAccessTable.centerId }).from(roleCenterAccessTable).where(eq(roleCenterAccessTable.roleId, roleId)),
    ]);

    const permMap = new Map(perms.map((p) => [p.module, p]));
    const matrix: Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }> = {};
    for (const m of MODULES) {
      const p = permMap.get(m.key);
      matrix[m.key] = {
        canView:   p?.canView   ?? false,
        canCreate: p?.canCreate ?? false,
        canEdit:   p?.canEdit   ?? false,
        canDelete: p?.canDelete ?? false,
      };
    }

    res.json({ matrix, centerIds: centerRows.map((r) => r.centerId) });
  } catch (err) {
    req.log.error({ err }, "Failed to get my permissions");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
