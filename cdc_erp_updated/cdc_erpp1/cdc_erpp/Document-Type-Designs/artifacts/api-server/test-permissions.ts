import { db } from "@workspace/db";
import { rolePermissionsTable } from "@workspace/db/schema";

async function run() {
  try {
    await db.insert(rolePermissionsTable).values({
      roleId: 2, // Assuming role 2 exists
      module: "dashboard",
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    }).onConflictDoUpdate({
      target: [rolePermissionsTable.roleId, rolePermissionsTable.module],
      set: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        updatedAt: new Date(),
      },
    });
    console.log("Success");
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
