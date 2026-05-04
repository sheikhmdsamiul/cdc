import { db } from "@workspace/db";
import { rolesTable, centersTable, administrativeUnitsTable, usersTable } from "@workspace/db/schema";
import bcryptjs from "bcryptjs";

async function seed() {
  console.log("Seeding roles...");
  const roles = await db.insert(rolesTable).values([
    { roleName: "Super Admin", scope: "All", accessType: "Full Control", description: "Full system access" },
    { roleName: "Head Office", scope: "All Centers", accessType: "Global", description: "National-level visibility" },
    { roleName: "DD Division", scope: "Division", accessType: "Filtered", description: "Division-level access" },
    { roleName: "DD District", scope: "District", accessType: "Filtered", description: "District-level access" },
    { roleName: "Center Admin", scope: "Center", accessType: "Full Control", description: "Full center control" },
    { roleName: "Superintendent", scope: "Center", accessType: "Full + Approval", description: "Final approval authority" },
    { roleName: "Probation Officer", scope: "Center", accessType: "Review", description: "Second level review" },
    { roleName: "Case Worker", scope: "Center", accessType: "Review", description: "First level review" },
    { roleName: "House Parent", scope: "Center", accessType: "Draft", description: "Can create drafts" },
    { roleName: "Worker", scope: "Center", accessType: "Draft", description: "Can create draft entries" },
  ]).onConflictDoNothing().returning();
  console.log(`  Inserted ${roles.length} roles`);

  console.log("Seeding centers...");
  const centers = await db.insert(centersTable).values([
    { centerName: "DSS Head Office Agargaon", centerType: "HQ", location: "Dhaka", address: "Agargaon, Dhaka", isHq: "yes" },
    { centerName: "Child Development Center (Boys) Tongi", centerType: "Boys", location: "Tongi", address: "Tongi, Gazipur" },
    { centerName: "Child Development Center (Girls) Konabari", centerType: "Girls", location: "Konabari", address: "Konabari, Gazipur" },
    { centerName: "Child Development Center (Boys) Fulerhat", centerType: "Boys", location: "Jashore", address: "Fulerhat, Jashore" },
  ]).onConflictDoNothing().returning();
  console.log(`  Inserted ${centers.length} centers`);

  const allCenters = await db.select().from(centersTable);
  const tongiCenter = allCenters.find(c => c.location === "Tongi");
  const konabariCenter = allCenters.find(c => c.location === "Konabari");
  const jashoreCenter = allCenters.find(c => c.location === "Jashore");

  console.log("Seeding administrative units...");
  const hq = await db.insert(administrativeUnitsTable).values({
    unitName: "DSS Head Office",
    unitType: "HQ",
    parentUnitId: null,
    linkedCenterId: null,
  }).returning();

  const divA = await db.insert(administrativeUnitsTable).values({
    unitName: "Dhaka Division",
    unitType: "Division",
    parentUnitId: hq[0].id,
    linkedCenterId: null,
  }).returning();

  const divB = await db.insert(administrativeUnitsTable).values({
    unitName: "Khulna Division",
    unitType: "Division",
    parentUnitId: hq[0].id,
    linkedCenterId: null,
  }).returning();

  const districtGazipur = await db.insert(administrativeUnitsTable).values({
    unitName: "Gazipur District",
    unitType: "District",
    parentUnitId: divA[0].id,
    linkedCenterId: null,
  }).returning();

  const districtJashore = await db.insert(administrativeUnitsTable).values({
    unitName: "Jashore District",
    unitType: "District",
    parentUnitId: divB[0].id,
    linkedCenterId: null,
  }).returning();

  if (tongiCenter) {
    await db.insert(administrativeUnitsTable).values({
      unitName: "CDC Boys Tongi Unit",
      unitType: "Center",
      parentUnitId: districtGazipur[0].id,
      linkedCenterId: tongiCenter.id,
    });
  }
  if (konabariCenter) {
    await db.insert(administrativeUnitsTable).values({
      unitName: "CDC Girls Konabari Unit",
      unitType: "Center",
      parentUnitId: districtGazipur[0].id,
      linkedCenterId: konabariCenter.id,
    });
  }
  if (jashoreCenter) {
    await db.insert(administrativeUnitsTable).values({
      unitName: "CDC Boys Jashore Unit",
      unitType: "Center",
      parentUnitId: districtJashore[0].id,
      linkedCenterId: jashoreCenter.id,
    });
  }
  console.log("  Administrative units seeded");

  const allRoles = await db.select().from(rolesTable);
  const getRoleId = (name: string) => allRoles.find(r => r.roleName === name)?.id;

  const allCentersNow = await db.select().from(centersTable);
  const getTongiId = () => allCentersNow.find(c => c.location === "Tongi")?.id;

  const defaultPassword = await bcryptjs.hash("Admin@1234", 12);

  console.log("Seeding default users...");
  const users = await db.insert(usersTable).values([
    {
      username: "superadmin",
      fullName: "Super Administrator",
      email: "superadmin@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Super Admin"),
      centerId: null,
      isActive: true,
    },
    {
      username: "headoffice",
      fullName: "Head Office Director",
      email: "headoffice@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Head Office"),
      centerId: null,
      isActive: true,
    },
    {
      username: "superintendent",
      fullName: "Superintendent (Tongi)",
      email: "superintendent@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Superintendent"),
      centerId: getTongiId(),
      isActive: true,
    },
    {
      username: "probation",
      fullName: "Probation Officer (Tongi)",
      email: "probation@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Probation Officer"),
      centerId: getTongiId(),
      isActive: true,
    },
    {
      username: "caseworker",
      fullName: "Case Worker (Tongi)",
      email: "caseworker@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Case Worker"),
      centerId: getTongiId(),
      isActive: true,
    },
    {
      username: "houseparent",
      fullName: "House Parent (Tongi)",
      email: "houseparent@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("House Parent"),
      centerId: getTongiId(),
      isActive: true,
    },
    {
      username: "worker",
      fullName: "Worker (Tongi)",
      email: "worker@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Worker"),
      centerId: getTongiId(),
      isActive: true,
    },
    {
      username: "centeradmin",
      fullName: "Center Admin (Tongi)",
      email: "centeradmin@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Center Admin"),
      centerId: getTongiId(),
      isActive: true,
    },
  ]).onConflictDoNothing().returning();
  console.log(`  Inserted ${users.length} users`);

  console.log("\nDefault credentials (all use password: Admin@1234):");
  console.log("  superadmin / Admin@1234");
  console.log("  headoffice / Admin@1234");
  console.log("  superintendent / Admin@1234");
  console.log("  probation / Admin@1234");
  console.log("  caseworker / Admin@1234");
  console.log("  houseparent / Admin@1234");
  console.log("  worker / Admin@1234");
  console.log("  centeradmin / Admin@1234");
}

seed().catch(console.error).finally(() => process.exit(0));
