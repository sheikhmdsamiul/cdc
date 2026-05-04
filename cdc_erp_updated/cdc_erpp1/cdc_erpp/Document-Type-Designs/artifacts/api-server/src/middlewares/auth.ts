import { type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable, rolesTable, centersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

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
 * Check if the current user can manage (create/update/delete) a record
 * belonging to the given centerId.
 * - Super Admin: always allowed
 * - Center Admin: only allowed for their own center (or if centerId is null)
 * - Others: forbidden
 * Returns true if allowed, false if not (response already sent).
 */
export async function checkManageAccess(req: Request, res: Response, recordCenterId: number | null): Promise<boolean> {
  const user = await getCurrentUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  if (user.roleName === "Super Admin" || user.roleName === "Head Office") return true;
  if (user.roleName === "Center Admin" || user.roleName === "DEO" || user.roleName === "Superintendent") {
    if (recordCenterId == null || user.centerId === recordCenterId) return true;
    res.status(403).json({ error: "Forbidden: you can only manage your own center's records" });
    return false;
  }
  res.status(403).json({ error: "Forbidden: insufficient permissions to manage records" });
  return false;
}
