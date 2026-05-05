import { db } from "@workspace/db";
import { administrativeUnitsTable } from "@workspace/db/schema";
import { eq, inArray } from "drizzle-orm";
import { DIVISION_DATA } from "./lib/administrative-data";

async function main() {
  console.log("Seeding administrative units...");
  
  console.log(`Loaded ${DIVISION_DATA.length} divisions from source.`);
  
  const unitTypesToClear = ["division", "Division", "district", "District", "upazila"];
  console.log(`Clearing existing units of types: ${unitTypesToClear.join(", ")}`);
  
  // We clear them one by one to avoid potential issues with cascading or large sets
  for (const type of unitTypesToClear) {
    await db.delete(administrativeUnitsTable).where(eq(administrativeUnitsTable.unitType, type));
  }

  for (const div of DIVISION_DATA) {
    const [newDiv] = await db.insert(administrativeUnitsTable).values({
      unitName: div.en,
      unitNameEn: div.en,
      unitNameBn: div.bn,
      unitType: "division",
      parentUnitId: null
    }).returning();
    
    const divId = newDiv.id;
    console.log(`Inserted division: ${div.bn} / ${div.en}`);
    
    for (const dist of div.districts) {
      const [newDist] = await db.insert(administrativeUnitsTable).values({
        unitName: dist.en,
        unitNameEn: dist.en,
        unitNameBn: dist.bn,
        unitType: "district",
        parentUnitId: divId
      }).returning();
      
      const distId = newDist.id;
      
      for (const upa of dist.upazilas) {
        await db.insert(administrativeUnitsTable).values({
          unitName: upa.en || upa.bn,
          unitNameEn: upa.en,
          unitNameBn: upa.bn,
          unitType: "upazila",
          parentUnitId: distId
        });
      }
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

main().catch(console.error);
