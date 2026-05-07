/**
 * Seed default permissions matrix for all roles × all modules.
 * Run with: DATABASE_URL=... npx tsx src/scripts/seed-permissions.ts
 * This script is idempotent — it uses ON CONFLICT DO UPDATE to refresh defaults.
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { rolePermissionsTable, rolesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool);

// ─── Modules ────────────────────────────────────────────────────────────────
const MODULES = [
  "dashboard",
  "admissions",
  "children",
  "cases",
  "family-socioeconomic",
  "health",
  "counseling",
  "education-skills",
  "guardians",
  "court-cases",
  "police-requisitions",
  "risk-assessments",
  "release-records",
  "follow-ups",
  "reports",
];

// ─── Default Permission Matrix ───────────────────────────────────────────────
// Format: { roleName: { canView, canCreate, canEdit, canDelete } }
const DEFAULTS: Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }> = {
  "Super Admin":        { canView: true,  canCreate: true,  canEdit: true,  canDelete: true  },
  "Head Office":        { canView: true,  canCreate: true,  canEdit: true,  canDelete: true  },
  "DD Division":        { canView: true,  canCreate: false, canEdit: false, canDelete: false },
  "DD District":        { canView: true,  canCreate: false, canEdit: false, canDelete: false },
  "Center Admin":       { canView: true,  canCreate: true,  canEdit: true,  canDelete: false },
  "Data Entry Operator":{ canView: true,  canCreate: true,  canEdit: true,  canDelete: false },
  "Case Worker":        { canView: true,  canCreate: true,  canEdit: true,  canDelete: false },
  "District Facilitator":{ canView: true,  canCreate: false, canEdit: true,  canDelete: false },
  "Probation Officer":  { canView: true,  canCreate: false, canEdit: true,  canDelete: false },
  "Superintendent":     { canView: true,  canCreate: false, canEdit: true,  canDelete: false },
  "Worker":             { canView: true,  canCreate: false, canEdit: false, canDelete: false },
  "House Parent":       { canView: true,  canCreate: false, canEdit: false, canDelete: false },
};

// Module-specific overrides: [roleName][module] = { ... }
const OVERRIDES: Record<string, Record<string, Partial<{ canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }>>> = {
  "Data Entry Operator": {
    "admissions": { canView: true, canCreate: true, canEdit: true, canDelete: true },
    "children":   { canView: true, canCreate: false, canEdit: false, canDelete: false },
    "reports":    { canView: false },
  },
  "Case Worker": {
    "admissions":   { canEdit: true },
    "cases":        { canCreate: true, canEdit: true },
    "health":       { canCreate: true, canEdit: true },
    "counseling":   { canCreate: true, canEdit: true },
    "education-skills": { canCreate: true, canEdit: true },
    "guardians":    { canCreate: true, canEdit: true },
    "court-cases":  { canCreate: true, canEdit: true },
    "risk-assessments": { canCreate: true, canEdit: true },
    "follow-ups":   { canCreate: true, canEdit: true },
  },
  "District Facilitator": {
    "admissions":      { canView: true, canEdit: true },
    "cases":           { canView: true, canEdit: true },
    "court-cases":     { canView: true, canEdit: true },
    "release-records": { canView: true, canEdit: true },
  },
  "Probation Officer": {
    "admissions":      { canView: true, canEdit: true },
    "cases":           { canView: true, canEdit: true },
    "court-cases":     { canView: true, canEdit: true },
    "release-records": { canView: true, canEdit: true },
  },
  "Superintendent": {
    "admissions":      { canView: true, canEdit: true },
    "release-records": { canView: true, canEdit: true },
    "reports":         { canView: true },
  },
};

async function main() {
  console.log("🔑 Seeding role permissions...");

  const roles = await db.select().from(rolesTable);
  if (roles.length === 0) {
    console.error("❌ No roles found in DB. Run seed-auth.ts first.");
    process.exit(1);
  }

  let seeded = 0;
  for (const role of roles) {
    const defaults = DEFAULTS[role.roleName] ?? { canView: false, canCreate: false, canEdit: false, canDelete: false };
    const overrides = OVERRIDES[role.roleName] ?? {};

    for (const module of MODULES) {
      const moduleOverride = overrides[module] ?? {};
      const perm = {
        roleId:    role.id,
        module,
        canView:   moduleOverride.canView   !== undefined ? moduleOverride.canView   : defaults.canView,
        canCreate: moduleOverride.canCreate !== undefined ? moduleOverride.canCreate : defaults.canCreate,
        canEdit:   moduleOverride.canEdit   !== undefined ? moduleOverride.canEdit   : defaults.canEdit,
        canDelete: moduleOverride.canDelete !== undefined ? moduleOverride.canDelete : defaults.canDelete,
      };

      await db
        .insert(rolePermissionsTable)
        .values(perm)
        .onConflictDoUpdate({
          target: [rolePermissionsTable.roleId, rolePermissionsTable.module],
          set: {
            canView:   perm.canView,
            canCreate: perm.canCreate,
            canEdit:   perm.canEdit,
            canDelete: perm.canDelete,
            updatedAt: new Date(),
          },
        });

      seeded++;
    }
    console.log(`  ✅ ${role.roleName} — ${MODULES.length} modules`);
  }

  console.log(`\n✨ Done! Seeded ${seeded} permission rows for ${roles.length} roles.\n`);
  await pool.end();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
