import { db } from "./lib/db/src/index";
import { caseTypesTable } from "./lib/db/src/schema/case_types";

async function main() {
  try {
    const res = await db.insert(caseTypesTable).values({
      nameBn: "টেস্ট",
      nameEn: "Test",
      isActive: true,
    }).returning();
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}
main();
