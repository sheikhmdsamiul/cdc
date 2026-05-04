import { db } from "@workspace/db";
import { administrativeUnitsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { DIVISION_DATA } from "./lib/administrative-data.js";

async function main() {
  console.log("Seeding administrative units...");
  
  console.log(`Loaded ${DIVISION_DATA.length} divisions from source.`);
  
  for (const div of DIVISION_DATA) {
    const existingDiv = await db.select().from(administrativeUnitsTable)
      .where(eq(administrativeUnitsTable.unitName, div.en))
      .limit(1);
      
    let divId;
    if (existingDiv.length === 0) {
      const [newDiv] = await db.insert(administrativeUnitsTable).values({
        unitName: div.en,
        unitNameEn: div.en,
        unitNameBn: div.bn,
        unitType: "division",
        parentUnitId: null
      }).returning();
      divId = newDiv.id;
      console.log(`Inserted division: ${div.en}`);
    } else {
      divId = existingDiv[0].id;
      await db.update(administrativeUnitsTable)
        .set({ unitNameBn: div.bn, unitNameEn: div.en })
        .where(eq(administrativeUnitsTable.id, divId));
    }
    
    for (const dist of div.districts) {
      const existingDist = await db.select().from(administrativeUnitsTable)
        .where(eq(administrativeUnitsTable.unitName, dist.en))
        .limit(1);
        
      let distId;
      if (existingDist.length === 0) {
        const [newDist] = await db.insert(administrativeUnitsTable).values({
          unitName: dist.en,
          unitNameEn: dist.en,
          unitNameBn: dist.bn,
          unitType: "district",
          parentUnitId: divId
        }).returning();
        distId = newDist.id;
      } else {
        distId = existingDist[0].id;
        await db.update(administrativeUnitsTable)
          .set({ unitNameBn: dist.bn, unitNameEn: dist.en, parentUnitId: divId })
          .where(eq(administrativeUnitsTable.id, distId));
      }
      
      for (const upa of dist.upazilas) {
        const upaNameEn = typeof upa === 'string' ? upa : (upa as any).en;
        const upaNameBn = typeof upa === 'string' ? upa : (upa as any).bn;
        const upaName = upaNameEn || upaNameBn;
        
        const existingUpa = await db.select().from(administrativeUnitsTable)
          .where(eq(administrativeUnitsTable.unitName, upaName))
          .limit(1);
          
        if (existingUpa.length === 0) {
          await db.insert(administrativeUnitsTable).values({
            unitName: upaName,
            unitNameEn: upaNameEn,
            unitNameBn: upaNameBn,
            unitType: "upazila",
            parentUnitId: distId
          });
        } else {
          await db.update(administrativeUnitsTable)
            .set({ unitNameBn: upaNameBn, unitNameEn: upaNameEn, parentUnitId: distId })
            .where(eq(administrativeUnitsTable.id, existingUpa[0].id));
        }
      }
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

main().catch(console.error);
