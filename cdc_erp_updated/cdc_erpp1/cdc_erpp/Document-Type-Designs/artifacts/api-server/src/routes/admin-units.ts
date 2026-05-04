import { Router } from "express";
import { db } from "@workspace/db";
import { administrativeUnitsTable, centersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/", async (req, res) => {
  const units = await db
    .select({
      id: administrativeUnitsTable.id,
      unitName: administrativeUnitsTable.unitName,
      unitNameBn: administrativeUnitsTable.unitNameBn,
      unitNameEn: administrativeUnitsTable.unitNameEn,
      unitType: administrativeUnitsTable.unitType,
      parentUnitId: administrativeUnitsTable.parentUnitId,
      linkedCenterId: administrativeUnitsTable.linkedCenterId,
      centerName: centersTable.centerName,
      createdAt: administrativeUnitsTable.createdAt,
    })
    .from(administrativeUnitsTable)
    .leftJoin(centersTable, eq(administrativeUnitsTable.linkedCenterId, centersTable.id))
    .orderBy(administrativeUnitsTable.id);
  res.json({ units, total: units.length });
});

router.get("/tree", async (req, res) => {
  const allUnits = await db
    .select()
    .from(administrativeUnitsTable)
    .orderBy(administrativeUnitsTable.id);

  const divisions = allUnits.filter((u) => u.unitType === "division");
  const districts = allUnits.filter((u) => u.unitType === "district");
  const upazilas = allUnits.filter((u) => u.unitType === "upazila");

  const tree = divisions.map((div) => {
    const divDistricts = districts.filter((d) => d.parentUnitId === div.id);
    return {
      id: div.id,
      en: div.unitNameEn || div.unitName,
      bn: div.unitNameBn || div.unitName,
      districts: divDistricts.map((dist) => {
        const distUpazilas = upazilas.filter((u) => u.parentUnitId === dist.id);
        return {
          id: dist.id,
          en: dist.unitNameEn || dist.unitName,
          bn: dist.unitNameBn || dist.unitName,
          upazilas: distUpazilas.map((u) => ({
            id: u.id,
            en: u.unitNameEn || u.unitName,
            bn: u.unitNameBn || u.unitName,
          })),
        };
      }),
    };
  });

  res.json(tree);
});

router.post("/", requireAuth, async (req, res) => {
  const { unitName, unitNameBn, unitNameEn, unitType, parentUnitId, linkedCenterId } = req.body;
  if (!unitName || !unitType) {
    res.status(400).json({ error: "unitName and unitType required" });
    return;
  }
  const inserted = await db.insert(administrativeUnitsTable).values({
    unitName, 
    unitNameBn: unitNameBn || null,
    unitNameEn: unitNameEn || null,
    unitType,
    parentUnitId: parentUnitId ? Number(parentUnitId) : null,
    linkedCenterId: linkedCenterId ? Number(linkedCenterId) : null,
  }).returning();
  res.status(201).json(inserted[0]);
});

router.put("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { unitName, unitType, parentUnitId, linkedCenterId } = req.body;
  await db.update(administrativeUnitsTable).set({
    unitName, unitType,
    parentUnitId: parentUnitId ? Number(parentUnitId) : null,
    linkedCenterId: linkedCenterId ? Number(linkedCenterId) : null,
  }).where(eq(administrativeUnitsTable.id, id));
  const updated = await db.select().from(administrativeUnitsTable).where(eq(administrativeUnitsTable.id, id)).limit(1);
  res.json(updated[0]);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(administrativeUnitsTable).where(eq(administrativeUnitsTable.id, id));
  res.json({ ok: true });
});

export default router;
