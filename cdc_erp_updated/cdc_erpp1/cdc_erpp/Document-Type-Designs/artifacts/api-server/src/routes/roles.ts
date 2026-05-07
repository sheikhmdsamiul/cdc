import { Router } from "express";
import { db } from "@workspace/db";
import { rolesTable, rolePermissionsTable, roleCenterAccessTable, centersTable } from "@workspace/db/schema";
import { requireAuth, getCurrentUser } from "../middlewares/auth";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const roles = await db.select().from(rolesTable).orderBy(rolesTable.id);
  res.json({ roles, total: roles.length });
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, id)).limit(1);
    if (!role) return res.status(404).json({ error: "Role not found" });

    const permissions = await db.select().from(rolePermissionsTable).where(eq(rolePermissionsTable.roleId, id));
    const centerAccess = await db.select().from(roleCenterAccessTable).where(eq(roleCenterAccessTable.roleId, id));
    
    let centerName = null;
    if (role.centerId) {
      const [center] = await db.select({ centerName: centersTable.centerName, centerNameBn: centersTable.centerNameBn })
        .from(centersTable).where(eq(centersTable.id, role.centerId)).limit(1);
      centerName = center;
    }

    res.json({ role, permissions, centerAccess, centerName });
  } catch (err) {
    res.status(500).json({ error: "Failed to get role", details: String(err) });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (user?.roleName !== "Super Admin") {
      return res.status(403).json({ error: "Forbidden: only Super Admin can update roles" });
    }

    const id = parseInt(req.params.id, 10);
    const { roleName, scope, accessType, centerId, description, permissions } = req.body;

    const [existing] = await db.select().from(rolesTable).where(eq(rolesTable.id, id)).limit(1);
    if (!existing) return res.status(404).json({ error: "Role not found" });

    // Protect Super Admin role from being renamed or changed in a way that breaks system access
    if (existing.roleName === "Super Admin") {
      if (roleName && roleName !== "Super Admin") {
        return res.status(400).json({ error: "The 'Super Admin' role name cannot be changed." });
      }
      // If updating Super Admin, we should be very careful. 
      // For now, let's just allow updating description but keep the name and scope locked.
    }

    const updates: any = {};
    if (roleName) {
       // Only allow changing name if it's NOT Super Admin
       if (existing.roleName !== "Super Admin") {
         updates.roleName = roleName;
       }
    }
    
    if (scope) {
      if (existing.roleName !== "Super Admin") {
        updates.scope = scope;
      }
    }

    if (accessType) updates.accessType = accessType;
    if (centerId !== undefined) updates.centerId = centerId ? Number(centerId) : null;
    if (description !== undefined) updates.description = description;

    const [updatedRole] = await db.update(rolesTable).set(updates).where(eq(rolesTable.id, id)).returning();

    if (permissions && Array.isArray(permissions)) {
      await db.delete(rolePermissionsTable).where(eq(rolePermissionsTable.roleId, id));
      if (permissions.length > 0) {
        await db.insert(rolePermissionsTable).values(
          permissions.map((perm: { module: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }) => ({
            roleId: id,
            module: perm.module,
            canView: perm.canView ?? false,
            canCreate: perm.canCreate ?? false,
            canEdit: perm.canEdit ?? false,
            canDelete: perm.canDelete ?? false,
          }))
        );
      }
    }

    res.json({ role: updatedRole });
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Role name already exists" });
    }
    res.status(500).json({ error: "Failed to update role", details: String(err) });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (user?.roleName !== "Super Admin") {
      return res.status(403).json({ error: "Forbidden: only Super Admin can add roles" });
    }

    const { roleName, scope = "Center", accessType = "Filtered", centerId, description = "", permissions = [] } = req.body;
    if (!roleName) return res.status(400).json({ error: "roleName is required" });

    if (scope === "Center" && !centerId) {
      return res.status(400).json({ error: "centerId is required for center-based roles" });
    }

    const [newRole] = await db.insert(rolesTable).values({
      roleName,
      scope,
      accessType,
      centerId: centerId ? Number(centerId) : null,
      description
    }).returning();

    // Insert permissions if provided
    if (permissions.length > 0) {
      await db.insert(rolePermissionsTable).values(
        permissions.map((perm: { module: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }) => ({
          roleId: newRole.id,
          module: perm.module,
          canView: perm.canView ?? false,
          canCreate: perm.canCreate ?? false,
          canEdit: perm.canEdit ?? false,
          canDelete: perm.canDelete ?? false,
        }))
      );
    }

    // Auto-assign center access for center-based roles
    if (scope === "Center" && centerId) {
      await db.insert(roleCenterAccessTable).values({
        roleId: newRole.id,
        centerId: Number(centerId),
      });
    }

    res.status(201).json({ role: newRole });
  } catch (err: any) {
    if (err.code === "23505") {
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

    const [existing] = await db.select().from(rolesTable).where(eq(rolesTable.id, id)).limit(1);
    if (!existing) return res.status(404).json({ error: "Role not found" });

    if (existing.roleName === "Super Admin") {
      return res.status(400).json({ error: "The 'Super Admin' role cannot be deleted." });
    }

    const [deleted] = await db.delete(rolesTable).where(eq(rolesTable.id, id)).returning();
    
    res.json({ success: true, deleted });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete role", details: String(err) });
  }
});

export default router;
