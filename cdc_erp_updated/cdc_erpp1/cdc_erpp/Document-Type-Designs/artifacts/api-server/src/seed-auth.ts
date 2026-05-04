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
    { roleName: "Probation Officer", scope: "Center", accessType: "Review", description: "Third level review — forwards to Superintendent" },
    { roleName: "District Facilitator", scope: "Center", accessType: "Review", description: "Second level review — forwards to Probation Officer" },
    { roleName: "Case Worker", scope: "Center", accessType: "Submit", description: "Enters inhabitant data and submits to District Facilitator" },
    { roleName: "Data Entry Operator", scope: "Center", accessType: "Draft + Submit", description: "Initial entry for admission and child profile" },
    { roleName: "House Parent", scope: "Center", accessType: "Draft", description: "Can create drafts" },
    { roleName: "Worker", scope: "Center", accessType: "Draft", description: "Can create draft entries" },
  ]).onConflictDoNothing().returning();
  console.log(`  Inserted ${roles.length} roles`);

  console.log("Seeding centers...");
  const centers = await db.insert(centersTable).values([
    { centerName: "DSS Head Office Agargaon", centerNameBn: "ডিএসএস হেড অফিস আগারগাঁও", centerType: "HQ", location: "Dhaka", address: "Agargaon, Dhaka", isHq: "yes" },
    { centerName: "Child Development Center (Boys) Tongi", centerNameBn: "শিশু উন্নয়ন কেন্দ্র (বালক), টঙ্গী, গাজীপুর", centerType: "Boys", location: "Tongi", address: "Tongi, Gazipur" },
    { centerName: "Child Development Center (Girls) Konabari", centerNameBn: "শিশু উন্নয়ন কেন্দ্র (বালিকা), কোনাবাড়ী, গাজীপুর", centerType: "Girls", location: "Konabari", address: "Konabari, Gazipur" },
    { centerName: "Child Development Center (Boys) Fulerhat", centerNameBn: "শিশু উন্নয়ন কেন্দ্র (বালক), ফুলেরহাট, যশোর", centerType: "Boys", location: "Jashore", address: "Fulerhat, Jashore" },
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
  }).onConflictDoNothing().returning();

  if (hq.length > 0) {
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
  }
  console.log("  Administrative units seeded");

  const allRoles = await db.select().from(rolesTable);
  const getRoleId = (name: string) => allRoles.find(r => r.roleName === name)?.id;

  const allCentersNow = await db.select().from(centersTable);
  const getTongiId = () => allCentersNow.find(c => c.location === "Tongi")?.id;
  const getKonabariId = () => allCentersNow.find(c => c.location === "Konabari")?.id;
  const getJashoreId = () => allCentersNow.find(c => c.location === "Jashore")?.id;

  const defaultPassword = await bcryptjs.hash("Admin@1234", 12);

  console.log("Seeding users...");
  const users = await db.insert(usersTable).values([
    // ── Global / Head Office ──────────────────────────────────────
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

    // ── CDC Boys Tongi ────────────────────────────────────────────
    {
      username: "centeradmin_tongi",
      fullName: "Center Admin — Tongi",
      email: "centeradmin.tongi@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Center Admin"),
      centerId: getTongiId(),
      isActive: true,
    },
    {
      username: "supt_tongi",
      fullName: "Superintendent — Tongi",
      email: "superintendent.tongi@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Superintendent"),
      centerId: getTongiId(),
      isActive: true,
    },
    {
      username: "po_tongi",
      fullName: "Probation Officer — Tongi",
      email: "probation.tongi@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Probation Officer"),
      centerId: getTongiId(),
      isActive: true,
    },
    {
      username: "df_tongi",
      fullName: "District Facilitator — Tongi",
      email: "df.tongi@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("District Facilitator"),
      centerId: getTongiId(),
      isActive: true,
    },
    {
      username: "cw_tongi",
      fullName: "Case Worker — Tongi",
      email: "caseworker.tongi@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Case Worker"),
      centerId: getTongiId(),
      isActive: true,
    },
    {
      username: "deo_tongi",
      fullName: "Data Entry Operator — Tongi",
      email: "deo.tongi@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Data Entry Operator"),
      centerId: getTongiId(),
      isActive: true,
    },
    {
      username: "houseparent_tongi",
      fullName: "House Parent — Tongi",
      email: "houseparent.tongi@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("House Parent"),
      centerId: getTongiId(),
      isActive: true,
    },

    // ── CDC Girls Konabari ────────────────────────────────────────
    {
      username: "centeradmin_konabari",
      fullName: "Center Admin — Konabari",
      email: "centeradmin.konabari@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Center Admin"),
      centerId: getKonabariId(),
      isActive: true,
    },
    {
      username: "supt_konabari",
      fullName: "Superintendent — Konabari",
      email: "superintendent.konabari@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Superintendent"),
      centerId: getKonabariId(),
      isActive: true,
    },
    {
      username: "po_konabari",
      fullName: "Probation Officer — Konabari",
      email: "probation.konabari@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Probation Officer"),
      centerId: getKonabariId(),
      isActive: true,
    },
    {
      username: "df_konabari",
      fullName: "District Facilitator — Konabari",
      email: "df.konabari@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("District Facilitator"),
      centerId: getKonabariId(),
      isActive: true,
    },
    {
      username: "cw_konabari",
      fullName: "Case Worker — Konabari",
      email: "caseworker.konabari@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Case Worker"),
      centerId: getKonabariId(),
      isActive: true,
    },
    {
      username: "deo_konabari",
      fullName: "Data Entry Operator — Konabari",
      email: "deo.konabari@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Data Entry Operator"),
      centerId: getKonabariId(),
      isActive: true,
    },
    {
      username: "houseparent_konabari",
      fullName: "House Parent — Konabari",
      email: "houseparent.konabari@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("House Parent"),
      centerId: getKonabariId(),
      isActive: true,
    },

    // ── CDC Boys Fulerhat / Jashore ───────────────────────────────
    {
      username: "centeradmin_fulerhat",
      fullName: "Center Admin — Fulerhat",
      email: "centeradmin.fulerhat@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Center Admin"),
      centerId: getJashoreId(),
      isActive: true,
    },
    {
      username: "supt_fulerhat",
      fullName: "Superintendent — Fulerhat",
      email: "superintendent.fulerhat@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Superintendent"),
      centerId: getJashoreId(),
      isActive: true,
    },
    {
      username: "po_fulerhat",
      fullName: "Probation Officer — Fulerhat",
      email: "probation.fulerhat@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Probation Officer"),
      centerId: getJashoreId(),
      isActive: true,
    },
    {
      username: "df_fulerhat",
      fullName: "District Facilitator — Fulerhat",
      email: "df.fulerhat@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("District Facilitator"),
      centerId: getJashoreId(),
      isActive: true,
    },
    {
      username: "cw_fulerhat",
      fullName: "Case Worker — Fulerhat",
      email: "caseworker.fulerhat@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Case Worker"),
      centerId: getJashoreId(),
      isActive: true,
    },
    {
      username: "deo_fulerhat",
      fullName: "Data Entry Operator — Fulerhat",
      email: "deo.fulerhat@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("Data Entry Operator"),
      centerId: getJashoreId(),
      isActive: true,
    },
    {
      username: "houseparent_fulerhat",
      fullName: "House Parent — Fulerhat",
      email: "houseparent.fulerhat@dss.gov.bd",
      passwordHash: defaultPassword,
      roleId: getRoleId("House Parent"),
      centerId: getJashoreId(),
      isActive: true,
    },
  ]).onConflictDoNothing().returning();
  console.log(`  Inserted ${users.length} users`);

  console.log("\n=== Default credentials (all use password: Admin@1234) ===");
  console.log("GLOBAL:");
  console.log("  superadmin         — Super Admin (all centers)");
  console.log("  headoffice         — Head Office (read-only, all centers)");
  console.log("\nTONGI (CDC Boys):");
  console.log("  cw_tongi           — Case Worker");
  console.log("  df_tongi           — District Facilitator");
  console.log("  po_tongi           — Probation Officer");
  console.log("  supt_tongi         — Superintendent");
  console.log("  centeradmin_tongi  — Center Admin");
  console.log("  deo_tongi          — Data Entry Operator");
  console.log("  houseparent_tongi  — House Parent");
  console.log("\nKONABARI (CDC Girls):");
  console.log("  cw_konabari        — Case Worker");
  console.log("  df_konabari        — District Facilitator");
  console.log("  po_konabari        — Probation Officer");
  console.log("  supt_konabari      — Superintendent");
  console.log("  centeradmin_konabari — Center Admin");
  console.log("  deo_konabari       — Data Entry Operator");
  console.log("  houseparent_konabari — House Parent");
  console.log("\nFULERHAT (CDC Boys, Jashore):");
  console.log("  cw_fulerhat        — Case Worker");
  console.log("  df_fulerhat        — District Facilitator");
  console.log("  po_fulerhat        — Probation Officer");
  console.log("  supt_fulerhat      — Superintendent");
  console.log("  centeradmin_fulerhat — Center Admin");
  console.log("  deo_fulerhat       — Data Entry Operator");
  console.log("  houseparent_fulerhat — House Parent");
}

seed().catch(console.error).finally(() => process.exit(0));
