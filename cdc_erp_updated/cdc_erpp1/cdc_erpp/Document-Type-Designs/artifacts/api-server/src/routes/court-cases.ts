// @ts-nocheck
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { courtCasesTable, childrenTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser, checkManageAccess } from "../middlewares/auth";
import multer from "multer";
import { parse } from "csv-parse/sync";

const router: IRouter = Router();

function generateCourtCaseId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `CC-${year}-${rand}`;
}

const SELECT_FIELDS = {
  id: courtCasesTable.id,
  courtCaseId: courtCasesTable.courtCaseId,
  childId: courtCasesTable.childId,
  childName: childrenTable.fullName,
  childCenterId: childrenTable.centerId,
  courtName: courtCasesTable.courtName,
  policeStationName: courtCasesTable.policeStationName,
  grNumber: courtCasesTable.grNumber,
  caseNo: courtCasesTable.caseNo,
  legalSection: courtCasesTable.legalSection,
  legalAidType: courtCasesTable.legalAidType,
  hearingDate: courtCasesTable.hearingDate,
  lastHearingDate: courtCasesTable.lastHearingDate,
  lawyerName: courtCasesTable.lawyerName,
  childCaseType: courtCasesTable.childCaseType,
  previousCaseInvolvement: courtCasesTable.previousCaseInvolvement,
  outcome: courtCasesTable.outcome,
  nextHearingDate: courtCasesTable.nextHearingDate,
  firNumber: courtCasesTable.firNumber,
  firDate: courtCasesTable.firDate,
  currentCaseStatus: courtCasesTable.currentCaseStatus,
  courtAttendanceDetails: courtCasesTable.courtAttendanceDetails,
  courtAttendanceDates: courtCasesTable.courtAttendanceDates,
  guardianCommunication: courtCasesTable.guardianCommunication,
  educationTraining: courtCasesTable.educationTraining,
  centerFacilities: courtCasesTable.centerFacilities,
  caseComments: courtCasesTable.caseComments,
  createdAt: courtCasesTable.createdAt,
  updatedAt: courtCasesTable.updatedAt,
};

router.get("/", async (req, res) => {
  try {
    const { childId } = req.query as Record<string, string>;
    const rows = await db.select(SELECT_FIELDS).from(courtCasesTable)
      .leftJoin(childrenTable, eq(courtCasesTable.childId, childrenTable.id))
      .orderBy(desc(courtCasesTable.createdAt));
    let filtered = rows;
    if (childId) filtered = filtered.filter(r => r.childId === parseInt(childId));
    res.json(filtered);
  } catch (err) {
    req.log.error({ err }, "Failed to list court cases");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/upcoming", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    const isGlobal = user?.roleName === "Super Admin" || user?.roleName === "Head Office";
    const rows = await db.select(SELECT_FIELDS).from(courtCasesTable)
      .leftJoin(childrenTable, eq(courtCasesTable.childId, childrenTable.id))
      .orderBy(courtCasesTable.nextHearingDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const withUrgency = rows
      .filter(r => {
        if (!r.nextHearingDate) return false;
        if (!isGlobal && r.childCenterId !== user?.centerId) return false;
        const d = new Date(r.nextHearingDate);
        d.setHours(0, 0, 0, 0);
        const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
        return diff >= 0 && diff <= 30;
      })
      .map(r => {
        const d = new Date(r.nextHearingDate!);
        d.setHours(0, 0, 0, 0);
        const daysUntil = Math.ceil((d.getTime() - today.getTime()) / 86400000);
        const urgency = daysUntil === 0 ? "today" : daysUntil <= 7 ? "thisWeek" : "upcoming";
        return { ...r, daysUntil, urgency };
      });

    res.json(withUrgency.slice(0, 10));
  } catch (err) {
    req.log.error({ err }, "Failed to list upcoming court cases");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, parseInt(req.body.childId)));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    const [courtCase] = await db.insert(courtCasesTable).values({ ...req.body, courtCaseId: generateCourtCaseId() }).returning();
    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, courtCase.childId));
    res.status(201).json({ ...courtCase, childName: childFull?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to create court case");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db.select(SELECT_FIELDS).from(courtCasesTable)
      .leftJoin(childrenTable, eq(courtCasesTable.childId, childrenTable.id))
      .where(eq(courtCasesTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found", message: "Court case not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get court case");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select({ childId: courtCasesTable.childId }).from(courtCasesTable).where(eq(courtCasesTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    const [courtCase] = await db.update(courtCasesTable).set(req.body).where(eq(courtCasesTable.id, id)).returning();
    if (!courtCase) return res.status(404).json({ error: "Not found" });
    const [childFull] = await db.select().from(childrenTable).where(eq(childrenTable.id, courtCase.childId));
    res.json({ ...courtCase, childName: childFull?.fullName });
  } catch (err) {
    req.log.error({ err }, "Failed to update court case");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [existing] = await db.select({ childId: courtCasesTable.childId }).from(courtCasesTable).where(eq(courtCasesTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });
    const [child] = await db.select({ centerId: childrenTable.centerId }).from(childrenTable).where(eq(childrenTable.id, existing.childId));
    const allowed = await checkManageAccess(req, res, child?.centerId ?? null);
    if (!allowed) return;

    await db.delete(courtCasesTable).where(eq(courtCasesTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete court case");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

const upload = multer({ storage: multer.memoryStorage() });

router.post("/bulk-import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const csvData = req.file.buffer.toString("utf-8");
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const results = {
      success: 0,
      errors: [] as string[],
      total: records.length,
    };

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      try {
        // Parse the child name and parent name
        const fullNameWithParent = record["বন্দির নাম (মাতা ও পিতার নাম)"] || "";
        const nameParts = fullNameWithParent.split(" / ");
        const childName = nameParts[0]?.trim() || "";
        const parentInfo = nameParts[1]?.replace("পিতা-", "").trim() || "";

        // Parse age
        const ageStr = record["বয়স"] || "";
        let age = 0;
        if (ageStr.includes("বছর")) {
          const match = ageStr.match(/(\d+)\s*বছর/);
          age = match ? parseInt(match[1]) : 0;
        }

        // Parse address
        const addressStr = record["ঠিকানা (গ্রাম, ইউনিয়ন, জেলা)"] || "";
        const addressParts = addressStr.split(",");
        const village = addressParts[0]?.replace("গ্রাম-", "").trim() || "";
        const union = addressParts[1]?.replace("ইউনিয়ন-", "").trim() || "";
        const district = addressParts[2]?.replace("জেলা-", "").trim() || "";

        // Parse police station and FIR details
        const policeInfo = record["থানা/কেস: নং ও আদমজির তারিখ"] || "";
        const policeParts = policeInfo.split(" / ");
        const firNumber = policeParts[0]?.trim() || "";
        const firDateStr = policeParts[1]?.trim() || "";
        let firDate: Date | null = null;
        if (firDateStr) {
          const dateParts = firDateStr.split("/");
          if (dateParts.length === 3) {
            firDate = new Date(`${dateParts[2]}-${dateParts[1].padStart(2, "0")}-${dateParts[0].padStart(2, "0")}`);
          }
        }

        // Parse case details
        const caseInfo = record["মামলা নং ও ধারা"] || "";
        const caseParts = caseInfo.split(" / ");
        const caseNo = caseParts[0]?.replace("মামলা নং-", "").trim() || "";
        const legalSection = caseParts[1]?.replace("ধারা -", "").trim() || "";

        // Create or find child
        let childId: number;
        const existingChildren = await db.select({ id: childrenTable.id })
          .from(childrenTable)
          .where(eq(childrenTable.fullName, childName))
          .limit(1);

        if (existingChildren.length > 0) {
          childId = existingChildren[0].id;
        } else {
          // Create new child
          const [newChild] = await db.insert(childrenTable).values({
            childId: `CHILD-${new Date().getFullYear()}-${Math.floor(Math.random() * 99999).toString().padStart(5, "0")}`,
            fullName: childName,
            fatherName: parentInfo,
            ageAtAdmission: age,
            verifiedAge: age,
            presentVillage: village,
            presentUpazila: union,
            presentDistrict: district,
            admissionDate: new Date(),
            currentStatus: "Admitted",
          }).returning({ id: childrenTable.id });
          childId = newChild.id;
        }

        // Create court case
        await db.insert(courtCasesTable).values({
          courtCaseId: generateCourtCaseId(),
          childId,
          courtName: record["আদালত/প্রতিষ্ঠানের নাম"] || "",
          policeStationName: policeInfo.split(" ")[0] || "",
          caseNo,
          legalSection,
          firNumber,
          firDate,
          currentCaseStatus: record["মামলার বর্তমান অবস্থা ও আইনগত সহায়তা"] || "",
          courtAttendanceDetails: record["আদালতে হাজিরির বিবরণ ও তারিখ"] || "",
          courtAttendanceDates: record["আদালতে হাজিরির বিবরণ ও তারিখ"] || "",
          guardianCommunication: record["অভিভাবকের সাথে যোগাযোগ"] || "",
          educationTraining: record["শিক্ষা ও প্রশিক্ষণ"] || "",
          centerFacilities: record["কেন্দ্র থেকে প্রদত্ত সুযোগ সুবিধা"] || "",
          caseComments: record["মন্তব্য"] || "",
        });

        results.success++;
      } catch (err) {
        results.errors.push(`Row ${i + 1}: ${String(err)}`);
      }
    }

    res.json(results);
  } catch (err) {
    req.log.error({ err }, "Failed to bulk import court cases");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
