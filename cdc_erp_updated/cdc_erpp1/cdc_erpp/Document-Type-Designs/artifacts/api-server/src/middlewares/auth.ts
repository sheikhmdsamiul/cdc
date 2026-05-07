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
      workflowRole: usersTable.workflowRole,
      isActive: usersTable.isActive,
    })
    .from(usersTable)
    .leftJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
    .leftJoin(centersTable, eq(usersTable.centerId, centersTable.id))
    .where(eq(usersTable.id, req.session.userId))
    .limit(1);
  return rows[0] ?? null;
}

const ALL_MODULES = [
  "dashboard", "admissions", "children", "cases", "family-socioeconomic",
  "health", "counseling", "education-skills", "guardians", "court-cases",
  "police-requisitions", "risk-assessments", "release-records", "follow-ups", "reports",
  "measurement-surveys"
];

const VIEW_ONLY = { view: true, create: false, edit: false, delete: false };
const FULL_ACCESS = { view: true, create: true, edit: true, delete: true };
const NO_ACCESS = { view: false, create: false, edit: false, delete: false };

/**
 * Hardcoded permissions for specific workflow roles to ensure system stability.
 * These bypass the dynamic database check.
 */
const WORKFLOW_PERMISSIONS: Record<string, Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>> = {
  DEO: {
    ...ALL_MODULES.reduce((acc, m) => ({ ...acc, [m]: NO_ACCESS }), {}),
    admissions: FULL_ACCESS,
    children: FULL_ACCESS,
  },
  CW: {
    ...ALL_MODULES.reduce((acc, m) => ({ ...acc, [m]: FULL_ACCESS }), {}),
  },
  PO: {
    ...ALL_MODULES.reduce((acc, m) => ({ ...acc, [m]: VIEW_ONLY }), {}),
    "court-cases": FULL_ACCESS,
    cases: FULL_ACCESS,
    reports: VIEW_ONLY,
  },
  SUPT: {
    ...ALL_MODULES.reduce((acc, m) => ({ ...acc, [m]: VIEW_ONLY }), {}),
    reports: VIEW_ONLY,
  },
};

/**
 * Middleware factory that enforces module-level permissions based on HTTP method:
 * GET → canView, POST → canCreate, PUT/PATCH → canEdit, DELETE → canDelete
 * Super Admin and Head Office always bypass.
 */
export function moduleGuard(module: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // 1. Super Admin & Head Office bypass
    if (user.roleName === "Super Admin" || user.roleName === "Head Office") return next();

    // 2. Hardcoded Workflow Role bypass
    const wfRole = user.workflowRole;
    let perm = null;

    if (wfRole && WORKFLOW_PERMISSIONS[wfRole]) {
      const wfPerms = WORKFLOW_PERMISSIONS[wfRole][module];
      if (wfPerms) {
        perm = {
          canView: wfPerms.view,
          canCreate: wfPerms.create,
          canEdit: wfPerms.edit,
          canDelete: wfPerms.delete,
        };
      }
    }

    // 3. Dynamic DB check (if no hardcoded match)
    if (!perm) {
      if (!user.roleId) return res.status(403).json({ error: "Forbidden: no role assigned" });

      const [dbPerm] = await db
        .select()
        .from(rolePermissionsTable)
        .where(and(eq(rolePermissionsTable.roleId, user.roleId), eq(rolePermissionsTable.module, module)))
        .limit(1);

      if (!dbPerm) return res.status(403).json({ error: `Access denied for module: ${module}` });
      perm = dbPerm;
    }

    const method = req.method.toUpperCase();
    let action: "view" | "create" | "edit" | "delete";

    if (method === "GET") {
      action = "view";
    } else if (method === "POST") {
      // Heuristic: POST to root is "create", POST to sub-path is "edit"
      // This allows workflow actions like /:id/action to be treated as edits.
      const path = req.path || "/";
      action = (path === "/" || path === "") ? "create" : "edit";
    } else if (method === "PUT" || method === "PATCH") {
      action = "edit";
    } else if (method === "DELETE") {
      action = "delete";
    } else {
      action = "view";
    }

    const denied =
      (action === "view"   && !perm.canView)   ||
      (action === "create" && !perm.canCreate) ||
      (action === "edit"   && !perm.canEdit)   ||
      (action === "delete" && !perm.canDelete);

    if (denied) {
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

  // Check scope-based access instead of hardcoded names
  if (user.roleScope === "Center") {
    if (recordCenterId == null || user.centerId === recordCenterId) return true;
    res.status(403).json({ error: "Forbidden: you can only manage your own center's records" });
    return false;
  }

  // Global roles (Super Admin / Head Office) were already handled above.
  // If we reach here, it's a role with no scope or no permission.
  res.status(403).json({ error: "Forbidden: insufficient permissions to manage records" });
  return false;
}
