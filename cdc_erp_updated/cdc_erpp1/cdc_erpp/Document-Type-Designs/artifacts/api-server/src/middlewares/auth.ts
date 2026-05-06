import { type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable, rolesTable, centersTable, rolePermissionsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export async function getCurrentUser(req: Request) {
  if (!req.session.userId) return null;
  const rows = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      fullName: usersTable.fullName,
      email: usersTable.email,
      roleId: usersTable.roleId,
      roleName: rolesTable.roleName,
      roleScope: rolesTable.scope,
      roleAccess: rolesTable.accessType,
      centerId: usersTable.centerId,
      centerName: centersTable.centerName,
      administrativeUnitId: usersTable.administrativeUnitId,
      isActive: usersTable.isActive,
    })
    .from(usersTable)
    .leftJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
    .leftJoin(centersTable, eq(usersTable.centerId, centersTable.id))
    .where(eq(usersTable.id, req.session.userId))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Middleware factory that enforces module-level permissions based on HTTP method:
 * GET → canView, POST → canCreate, PUT/PATCH → canEdit, DELETE → canDelete
 * Super Admin and Head Office always bypass.
 */
export function moduleGuard(module: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Super Admin & Head Office bypass all module checks
    if (user.roleName === "Super Admin" || user.roleName === "Head Office") return next();

    if (!user.roleId) return res.status(403).json({ error: "Forbidden: no role assigned" });

    const [perm] = await db
      .select()
      .from(rolePermissionsTable)
      .where(and(eq(rolePermissionsTable.roleId, user.roleId), eq(rolePermissionsTable.module, module)))
      .limit(1);

    if (!perm) return res.status(403).json({ error: `Access denied for module: ${module}` });

    const method = req.method.toUpperCase();
    const denied =
      (method === "GET"                    && !perm.canView)   ||
      (method === "POST"                   && !perm.canCreate) ||
      ((method === "PUT" || method === "PATCH") && !perm.canEdit) ||
      (method === "DELETE"                 && !perm.canDelete);

    if (denied) {
      const action = method === "GET" ? "view" : method === "POST" ? "create" : method === "DELETE" ? "delete" : "edit";
      return res.status(403).json({ error: `Forbidden: no ${action} permission for module "${module}"` });
    }

    next();
  };
}

/**
 * Check if the current user can manage (create/update/delete) a record
 * belonging to the given centerId.
 */
export async function checkManageAccess(req: Request, res: Response, recordCenterId: number | null): Promise<boolean> {
  const user = await getCurrentUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  if (user.roleName === "Super Admin" || user.roleName === "Head Office") return true;

  // Roles that can manage records within their own center
  const centerBoundRoles = [
    "Center Admin", "DEO", "Superintendent",
    "Case Worker", "District Facilitator", "Probation Officer",
  ];

  if (centerBoundRoles.includes(user.roleName ?? "")) {
    if (recordCenterId == null || user.centerId === recordCenterId) return true;
    res.status(403).json({ error: "Forbidden: you can only manage your own center's records" });
    return false;
  }

  res.status(403).json({ error: "Forbidden: insufficient permissions to manage records" });
  return false;
}
