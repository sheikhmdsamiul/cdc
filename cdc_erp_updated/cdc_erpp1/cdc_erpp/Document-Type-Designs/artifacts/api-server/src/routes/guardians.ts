import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { guardiansTable, guardianVisitsTable, childrenTable } from "@workspace/db";
import { eq, desc, or, isNull } from "drizzle-orm";
import { checkManageAccess, getCurrentUser, moduleGuard } from "../middlewares/auth";

const router: IRouter = Router();

router.use(moduleGuard("guardians"));

function generateGuardianId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `GDN-${year}-${rand}`;
}

router.get("/", async (req, res) => {
  try {
    const { search } = req.query as Record<string, string>;

    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const isGlobal = user.roleName === "Super Admin" || user.roleName === "Head Office";
    const userCenterId = user.centerId;

    if (!isGlobal && !userCenterId) return res.json([]);

    let query = db.select({ guardian: guardiansTable }).from(guardiansTable)
      .leftJoin(childrenTable, eq(guardiansTable.childId, childrenTable.id));

    if (!isGlobal) {
      query = query.where(
        or(
          eq(childrenTable.centerId, userCenterId!),
          isNull(guardiansTable.childId)
        )
      ) as any;
    }

    const rowsRaw = await query.orderBy(desc(guardiansTable.createdAt));
    let rows = rowsRaw.map((r: any) => r.guardian);

    if (search) rows = rows.filter((r: any) => r.guardianName.toLowerCase().includes(search.toLowerCase()));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list guardians");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    req.log.info({ body: req.body }, "Creating guardian");
    const allowed = await checkManageAccess(req, res, null);
    if (!allowed) return;

    const { guardianName, relationship, nidNo, contactNumber, address, childId } = req.body;

    if (!guardianName || !relationship) {
      return res.status(400).json({ error: "Invalid data", message: "guardianName and relationship are required" });
    }

    const [guardian] = await db.insert(guardiansTable).values({
      guardianName,
      relationship,
      nidNo: nidNo || null,
      contactNumber: contactNumber || null,
      address: address || null,
      childId: (childId && childId !== "") ? Number(childId) : null,
      guardianId: generateGuardianId(),
    }).returning();
    res.status(201).json(guardian);
  } catch (err) {
    req.log.error({ err }, "Failed to create guardian");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [guardian] = await db.select().from(guardiansTable).where(eq(guardiansTable.id, id));
    if (!guardian) return res.status(404).json({ error: "Not found", message: "Guardian not found" });
    res.json(guardian);
  } catch (err) {
    req.log.error({ err }, "Failed to get guardian");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const allowed = await checkManageAccess(req, res, null);
    if (!allowed) return;

    const id = parseInt(req.params.id);
    const { guardianName, relationship, nidNo, contactNumber, address, childId } = req.body;

    const updates: Record<string, any> = {};
    if (guardianName !== undefined) updates.guardianName = guardianName;
    if (relationship !== undefined) updates.relationship = relationship;
    if (nidNo !== undefined) updates.nidNo = nidNo || null;
    if (contactNumber !== undefined) updates.contactNumber = contactNumber || null;
    if (address !== undefined) updates.address = address || null;
    if (childId !== undefined) updates.childId = (childId && childId !== "") ? Number(childId) : null;

    const [guardian] = await db.update(guardiansTable).set(updates).where(eq(guardiansTable.id, id)).returning();
    if (!guardian) return res.status(404).json({ error: "Not found", message: "Guardian not found" });
    res.json(guardian);
  } catch (err) {
    req.log.error({ err }, "Failed to update guardian");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const allowed = await checkManageAccess(req, res, null);
    if (!allowed) return;

    const id = parseInt(req.params.id);
    await db.delete(guardiansTable).where(eq(guardiansTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete guardian");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
