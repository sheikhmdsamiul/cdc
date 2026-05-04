// @ts-nocheck
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  childrenTable,
  casesTable,
  healthAssessmentsTable,
  counselingSessionsTable,
  guardianVisitsTable,
  courtCasesTable,
  educationPlansTable,
  riskAssessmentsTable,
  admissionsTable,
  centersTable,
  releaseRecordsTable,
  followUpsTable,
  familySocioeconomicRecordsTable,
  measurementSurveysTable,
  policeAcquisitionsTable,
  guardiansTable,
  caseRiskAssessmentsTable,
  caseDetailAssessmentsTable,
  caseInterventionPlansTable,
  caseAgreementsTable,
} from "@workspace/db";
import { eq, ilike, or, count, desc, and, ne, inArray } from "drizzle-orm";
import { getCurrentUser } from "../middlewares/auth";
import multer from "multer";
import { parse } from "csv-parse/sync";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

function generateChildId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `CHILD-${year}-${rand}`;
}

function generateCaseId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `CASE-${year}-${rand}`;
}

function generateCourtCaseId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `CC-${year}-${rand}`;
}

function generateAdmissionId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `ADM-${year}-${rand}`;
}

function normalizeText(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function toAsciiDigits(value: string): string {
  const bn = "০১২৩৪৫৬৭৮৯";
  return value.replace(/[০-৯]/g, (d) => String(bn.indexOf(d)));
}

function normalizeKey(value: unknown): string {
  return normalizeText(value).toLowerCase().replace(/\s+/g, "");
}

function pickField(record: Record<string, unknown>, aliases: string[]): string {
  const keyMap = new Map<string, string>();
  for (const [key, value] of Object.entries(record)) {
    keyMap.set(normalizeKey(key), normalizeText(value));
  }
  for (const alias of aliases) {
    const found = keyMap.get(normalizeKey(alias));
    if (found != null && found !== "") return found;
  }
  return "";
}

function parseDateInput(value: string): string | null {
  const raw = toAsciiDigits(normalizeText(value));
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const slash = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (slash) {
    const [, d, m, y] = slash;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

function parsePositiveInt(value: string): number | null {
  const raw = toAsciiDigits(normalizeText(value));
  if (!raw) return null;
  const normalized = raw.replace(/[^\d]/g, "");
  if (!normalized) return null;
  const num = parseInt(normalized, 10);
  return Number.isNaN(num) ? null : num;
}

function normalizeGender(value: string): "Boy" | "Girl" | "Others" | null {
  const raw = normalizeText(value).toLowerCase();
  if (!raw) return null;
  if (["boy", "male", "ছেলে", "বালক"].includes(raw)) return "Boy";
  if (["girl", "female", "মেয়ে", "মেয়ে", "বালিকা"].includes(raw)) return "Girl";
  if (["others", "other", "অন্যান্য"].includes(raw)) return "Others";
  return null;
}

function normalizeAdmissionSource(value: string): "Court" | "Police" | "Guardian" | null {
  const raw = normalizeText(value).toLowerCase();
  if (!raw) return null;
  if (["court", "আদালত"].includes(raw)) return "Court";
  if (["police", "পুলিশ"].includes(raw)) return "Police";
  if (["guardian", "অভিভাবক"].includes(raw)) return "Guardian";
  return null;
}

function normalizeChildStatus(value: string): "Admitted" | "Under Care" | "Released" | "Transferred" | null {
  const raw = normalizeText(value).toLowerCase();
  if (!raw) return null;
  if (["admitted", "ভর্তি"].includes(raw)) return "Admitted";
  if (["under care", "যত্নাধীন"].includes(raw)) return "Under Care";
  if (["released", "মুক্তিপ্রাপ্ত"].includes(raw)) return "Released";
  if (["transferred", "স্থানান্তরিত"].includes(raw)) return "Transferred";
  return null;
}

function normalizeRiskLevel(value: string): "Low" | "Medium" | "High" | null {
  const raw = normalizeText(value).toLowerCase();
  if (!raw) return null;
  if (["low", "কম"].includes(raw)) return "Low";
  if (["medium", "মাঝারি"].includes(raw)) return "Medium";
  if (["high", "উচ্চ"].includes(raw)) return "High";
  return null;
}

function normalizeCaseStatus(value: string): "Open" | "Active" | "Review" | "Closed" | null {
  const raw = normalizeText(value).toLowerCase();
  if (!raw) return null;
  if (["open", "খোলা"].includes(raw)) return "Open";
  if (["active", "সক্রিয়"].includes(raw)) return "Active";
  if (["review", "পর্যালোচনা"].includes(raw)) return "Review";
  if (["closed", "বন্ধ"].includes(raw)) return "Closed";
  return null;
}

function parseBooleanLike(value: string): boolean | null {
  const raw = normalizeText(value).toLowerCase();
  if (!raw) return null;
  if (["yes", "true", "1", "y", "হ্যাঁ", "জি"].includes(raw)) return true;
  if (["no", "false", "0", "n", "না"].includes(raw)) return false;
  return null;
}

function hasReleaseKeyword(value: unknown): boolean {
  const raw = normalizeText(value).toLowerCase();
  if (!raw) return false;
  return raw.includes("জামিনে মুক্তি")
    || raw.includes("bail")
    || raw.includes("released");
}

function yearsDiff(from: string | Date, to: Date = new Date()): number {
  const f = new Date(from);
  let years = to.getFullYear() - f.getFullYear();
  const m = to.getMonth() - f.getMonth();
  if (m < 0 || (m === 0 && to.getDate() < f.getDate())) years--;
  return years;
}

/** Returns the best-known DoB string (YYYY-MM-DD) for a child, or null. */
function bestDob(child: any): string | null {
  if (child.verifiedDob) return child.verifiedDob;
  if (child.dateOfBirth) return child.dateOfBirth;
  return null;
}

/** Compute age at a specific reference date (e.g. admission date) */
function computeAgeAtDate(child: any, refDate: string | Date): number | null {
  const dob = bestDob(child);
  if (dob) return yearsDiff(dob, new Date(refDate));
  if (child.ageAtAdmission != null) return child.ageAtAdmission;
  return null;
}

function computeCurrentAge(child: any): number | null {
  const dob = bestDob(child);
  if (dob) return yearsDiff(dob);
  // Verified age + elapsed time since verification date
  if (child.verifiedAge != null && child.verifiedAgeDate) {
    return child.verifiedAge + yearsDiff(child.verifiedAgeDate);
  }
  // Age at admission + elapsed time since admission
  if (child.ageAtAdmission != null && child.admissionDate) {
    return child.ageAtAdmission + yearsDiff(child.admissionDate);
  }
  // Last resort: just return the age values directly (approximate, no elapsed time)
  if (child.verifiedAge != null) return child.verifiedAge;
  if (child.ageAtAdmission != null) return child.ageAtAdmission;
  return null;
}

function computeTentativeDoB(child: any): string | null {
  if (bestDob(child)) return null;
  // Use reference date if available, otherwise fall back to today
  const refAge = child.verifiedAge != null
    ? { age: child.verifiedAge, refDate: child.verifiedAgeDate ?? new Date().toISOString().split("T")[0] }
    : child.ageAtAdmission != null
      ? { age: child.ageAtAdmission, refDate: child.admissionDate ?? new Date().toISOString().split("T")[0] }
      : null;
  if (!refAge) return null;
  const ref = new Date(refAge.refDate);
  ref.setFullYear(ref.getFullYear() - refAge.age);
  return ref.toISOString().split("T")[0];
}

function enrichChild(child: any) {
  const currentAge = computeCurrentAge(child);
  const ageAtAdmissionCalculated = child.admissionDate
    ? computeAgeAtDate(child, child.admissionDate)
    : null;
  return {
    ...child,
    currentAge,
    ageAtAdmissionCalculated,
    tentativeDoB: computeTentativeDoB(child),
  };
}

function normalizeChildPayload(body: Record<string, any>) {
  const normalized = { ...body };

  const nullableDateFields = [
    "dateOfBirth",
    "verifiedDob",
    "verifiedAgeDate",
  ];

  const nullableNumberFields = [
    "ageAtAdmission",
    "verifiedAge",
    "parentsMonthlyIncome",
    "childrenCount",
  ];

  for (const field of nullableDateFields) {
    if (normalized[field] === "") normalized[field] = null;
  }

  for (const field of nullableNumberFields) {
    if (normalized[field] === "" || Number.isNaN(normalized[field])) {
      normalized[field] = null;
    }
  }

  return normalized;
}

router.get("/age-alerts", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    const userCenterId = user?.centerId ?? null;
    const isGlobal = !userCenterId;

    const children = await db.select().from(childrenTable)
      .where(isGlobal ? undefined : eq(childrenTable.centerId, userCenterId!));
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const over18: any[] = [];
    const turning18Soon: any[] = [];

    for (const child of children) {
      const dob = bestDob(child as any);
      if (!dob) continue;

      const dobDate = new Date(dob);
      const turns18 = new Date(dobDate);
      turns18.setFullYear(dobDate.getFullYear() + 18);

      const currentAge = yearsDiff(dobDate);

      if (turns18 <= now) {
        // Show ALL children who are 18+ regardless of current status
        over18.push({
          id: child.id,
          childId: child.childId,
          fullName: child.fullName,
          currentAge,
          dob,
          turns18Date: turns18.toISOString().split("T")[0],
          currentStatus: child.currentStatus,
        });
      } else if (turns18 <= in90Days) {
        // For "turning 18 soon" — show all active (non-released) children
        if (child.currentStatus !== "Released") {
          const daysUntil18 = Math.floor((turns18.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          turning18Soon.push({
            id: child.id,
            childId: child.childId,
            fullName: child.fullName,
            currentAge,
            dob,
            turns18Date: turns18.toISOString().split("T")[0],
            daysUntil18,
            currentStatus: child.currentStatus,
          });
        }
      }
    }

    over18.sort((a, b) => b.currentAge - a.currentAge);
    turning18Soon.sort((a, b) => a.daysUntil18 - b.daysUntil18);
    res.json({ over18, turning18Soon });
  } catch (err) {
    req.log.error({ err }, "Failed to get age alerts");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/", async (req, res) => {
  try {
    const { status, search, page = "1", limit = "20" } = req.query as Record<string, string>;
    req.log.info({ status, search, page, limit }, "Listing children");
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    const user = await getCurrentUser(req);
    const userCenterId = user?.centerId ?? null;
    const isGlobal = !userCenterId;

    // Build where conditions
    const conditions: any[] = [];
    if (!isGlobal) conditions.push(eq(childrenTable.centerId, userCenterId!));
    if (status && status !== "all") {
      conditions.push(eq(childrenTable.currentStatus, status));
    } else if (!status && !search) {
      // By default (no status filter and no search), hide admission drafts.
      // If there IS a search query, we show all statuses including Draft to help find records.
      conditions.push(ne(childrenTable.currentStatus, "Draft"));
    }
    if (search) conditions.push(or(
      ilike(childrenTable.fullName, `%${search}%`),
      ilike(childrenTable.childId, `%${search}%`)
    ));

    const whereClause = conditions.length > 0
      ? (conditions.length === 1 ? conditions[0] : and(...conditions))
      : undefined;

    const [allRows, data] = await Promise.all([
      db.select({ c: count() }).from(childrenTable).where(whereClause),
      db.select({
        child: childrenTable,
        centerName: centersTable.centerName,
        centerNameBn: centersTable.centerNameBn,
      }).from(childrenTable)
        .leftJoin(centersTable, eq(childrenTable.centerId, centersTable.id))
        .where(whereClause)
        .limit(limitNum).offset(offset).orderBy(desc(childrenTable.createdAt)),
    ]);

    res.json({
      data: data.map((row) => enrichChild({ ...row.child, centerName: row.centerName ?? null, centerNameBn: row.centerNameBn ?? null })),
      total: allRows[0]?.c ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list children");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    console.log("Creating child with payload:", req.body);
    const body = normalizeChildPayload(req.body);
    const childId = generateChildId();
    const user = await getCurrentUser(req);

    const requestedCenterId = body.centerId != null && body.centerId !== ""
      ? Number(body.centerId)
      : null;
    const resolvedCenterId = user?.roleName === "Super Admin" || user?.roleName === "Head Office"
      ? requestedCenterId
      : (user?.centerId ?? requestedCenterId);

    // Legacy verifiedAge support
    if (body.verifiedAge != null && !body.verifiedAgeDate) {
      body.verifiedAgeDate = new Date().toISOString().split("T")[0];
    }

    const [child] = await db.insert(childrenTable).values({
      ...body,
      centerId: resolvedCenterId,
      childId,
    }).returning();

    res.status(201).json(enrichChild(child));
  } catch (err) {
    req.log.error({ err }, "Failed to create child");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/bulk-import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const isGlobalRole = ["Super Admin", "Head Office"].includes(user.roleName ?? "");
    if (!isGlobalRole && !user.centerId) {
      return res.status(403).json({ error: "Forbidden: user center is required for center-wise import" });
    }

    const csvData = req.file.buffer.toString("utf-8");
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    }) as Array<Record<string, unknown>>;

    const centers = await db.select().from(centersTable);
    const centerLookup = new Map<string, number>();
    const centerNameById = new Map<number, string>();
    for (const center of centers) {
      const id = center.id;
      centerNameById.set(id, center.centerName);
      const keys = [
        center.centerName,
        center.location ?? "",
        `${center.centerType} ${center.location ?? ""}`,
      ];
      for (const key of keys) {
        const normalized = normalizeKey(key);
        if (normalized) centerLookup.set(normalized, id);
      }
      if ((center.location ?? "").toLowerCase() === "tongi") {
        centerLookup.set(normalizeKey("টঙ্গী"), id);
        centerLookup.set(normalizeKey("টঙ্গি"), id);
      }
      if ((center.location ?? "").toLowerCase() === "konabari") {
        centerLookup.set(normalizeKey("কোনাবাড়ী"), id);
        centerLookup.set(normalizeKey("কোনাবাড়ী"), id);
      }
      if ((center.location ?? "").toLowerCase() === "fulerhat") {
        centerLookup.set(normalizeKey("ফুলেরহাট"), id);
      }
    }

    const results: {
      success: number;
      total: number;
      childCreated: number;
      admissionCreated: number;
      caseCreated: number;
      courtCaseCreated: number;
      errors: Array<{ row: number; field: string; message: string; value?: string }>;
    } = {
      success: 0,
      total: records.length,
      childCreated: 0,
      admissionCreated: 0,
      caseCreated: 0,
      courtCaseCreated: 0,
      errors: [],
    };

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNo = i + 2;
      try {
        const centerInput = pickField(row, ["কেন্দ্র", "center", "center_name", "centername"]);
        const fullNameInput = pickField(row, ["পূর্ণ নাম", "শিশুর নাম", "full_name", "fullname", "child_name"]);
        const motherName = pickField(row, ["মায়ের নাম", "মায়ের নাম", "mother_name", "mothername"]);
        const fatherName = pickField(row, ["পিতার নাম", "father_name", "fathername"]);
        const genderRaw = pickField(row, ["লিঙ্গ", "gender"]);
        const admissionDateRaw = pickField(row, ["ভর্তি তারিখ", "ভর্তির তারিখ", "admission_date", "admissiondate"]);
        const admissionSourceRaw = pickField(row, ["ভর্তি উৎস", "ভর্তির উৎস", "admission_source", "admissionsource"]);
        const currentStatusRaw = pickField(row, ["বর্তমান অবস্থা", "current_status", "status"]);
        const dateOfBirthRaw = pickField(row, ["জন্ম তারিখ", "date_of_birth", "dob"]);
        const verifiedDobRaw = pickField(row, ["যাচাইকৃত জন্ম তারিখ", "verified_dob"]);
        const verifiedAgeRaw = pickField(row, ["যাচাইকৃত বয়স", "যাচাইকৃত বয়স", "verified_age"]);
        const religion = pickField(row, ["ধর্ম", "religion"]);
        const nationality = pickField(row, ["জাতীয়তা", "জাতীয়তা", "nationality"]);
        const presentDistrict = pickField(row, ["বর্তমান জেলা", "present_district"]);
        const presentUpazila = pickField(row, ["বর্তমান উপজেলা", "present_upazila"]);
        const presentVillage = pickField(row, ["বর্তমান গ্রাম", "present_village"]);
        const permanentDistrict = pickField(row, ["স্থায়ী জেলা", "স্থায়ী জেলা", "permanent_district"]);
        const permanentUpazila = pickField(row, ["স্থায়ী উপজেলা", "স্থায়ী উপজেলা", "permanent_upazila"]);
        const permanentVillage = pickField(row, ["স্থায়ী গ্রাম", "স্থায়ী গ্রাম", "permanent_village"]);
        const caseType = pickField(row, ["মামলার ধরন", "case_type"]);
        const courtReferenceNo = pickField(row, ["আদালতের রেফারেন্স নং", "আদালত রেফারেন্স", "court_reference_no"]);

        const caseOpeningDateRaw = pickField(row, ["কেস ফাইল খোলার তারিখ", "মামলা খোলার তারিখ", "case_opening_date"]);
        const assignedCaseWorker = pickField(row, ["কেস কর্মী", "মামলা কর্মী", "assigned_case_worker"]);
        const caseRiskRaw = pickField(row, ["কেস ঝুঁকির মাত্রা", "ঝুঁকির মাত্রা", "risk_level"]);
        const caseStatusRaw = pickField(row, ["কেস অবস্থা", "কেস স্ট্যাটাস", "case_status"]);
        const caseSummary = pickField(row, ["কেস সারসংক্ষেপ", "মামলার সারসংক্ষেপ", "case_summary"]);
        const investigationNotes = pickField(row, ["তদন্ত নোট", "investigation_notes"]);
        const recommendation = pickField(row, ["সুপারিশ", "recommendation"]);

        // Court cases (আদালতের মামলা)
        const courtName = pickField(row, ["আদালত/প্রতিষ্ঠানের নাম", "আদালতের নাম", "court_name"]);
        const courtCaseNo = pickField(row, ["আদালত মামলা নম্বর", "মামলা নম্বর", "case_no"]);
        const policeStationName = pickField(row, ["থানা", "পুলিশ স্টেশন", "police_station_name"]);
        const grNumber = pickField(row, ["জিআর নম্বর", "gr_number"]);
        const legalSection = pickField(row, ["আইনের ধারা", "legal_section"]);
        const legalAidType = pickField(row, ["আইনগত সহায়তার ধরন", "legal_aid_type"]);
        const hearingDateRaw = pickField(row, ["শুনানির তারিখ", "hearing_date"]);
        const lastHearingDateRaw = pickField(row, ["সর্বশেষ হাজিরার তারিখ", "last_hearing_date"]);
        const nextHearingDateRaw = pickField(row, ["পরবর্তী হাজিরার তারিখ", "next_hearing_date"]);
        const lawyerName = pickField(row, ["আইনজীবীর নাম", "lawyer_name"]);
        const childCaseType = pickField(row, ["শিশুর মামলার ধরন", "child_case_type"]);
        const previousCaseInvolvementRaw = pickField(row, ["পূর্বে অন্য কোন মামলায় জড়িত", "previous_case_involvement"]);
        const outcome = pickField(row, ["মামলার ফলাফল", "outcome"]);
        const firNumber = pickField(row, ["এফআইআর নম্বর", "থানা/কেস নং", "fir_number"]);
        const firDateRaw = pickField(row, ["এফআইআর তারিখ", "fir_date"]);
        const currentCaseStatus = pickField(row, ["মামলার বর্তমান অবস্থা", "current_case_status"]);
        const courtAttendanceDetails = pickField(row, ["আদালতে হাজিরির বিবরণ", "court_attendance_details"]);
        const courtAttendanceDates = pickField(row, ["আদালতে হাজিরির তারিখ", "court_attendance_dates"]);
        const guardianCommunication = pickField(row, ["অভিভাবকের সাথে যোগাযোগ", "guardian_communication"]);
        const educationTraining = pickField(row, ["শিক্ষা ও প্রশিক্ষণ", "education_training"]);
        const centerFacilities = pickField(row, ["কেন্দ্র থেকে প্রদত্ত সুযোগ সুবিধা", "center_facilities"]);
        const caseComments = pickField(row, ["মন্তব্য", "case_comments"]);

        const fullName = fullNameInput || `Unknown Child ${rowNo}`;
        const admissionDate = parseDateInput(admissionDateRaw) ?? new Date().toISOString().split("T")[0];
        const admissionSource = normalizeAdmissionSource(admissionSourceRaw || "Court") ?? "Court";

        let resolvedCenterId: number | null = null;
        if (!isGlobalRole) {
          resolvedCenterId = user.centerId ?? null;
        } else {
          if (centerInput) {
            resolvedCenterId = centerLookup.get(normalizeKey(centerInput)) ?? null;
          } else {
            resolvedCenterId = user.centerId ?? null;
          }
        }

        const gender = normalizeGender(genderRaw ?? "");

        const rowReleaseFlag = Object.values(row).some((v) => hasReleaseKeyword(v));
        const currentStatus = rowReleaseFlag
          ? "Released"
          : (normalizeChildStatus(currentStatusRaw || "Admitted") ?? "Admitted");

        const dateOfBirth = parseDateInput(dateOfBirthRaw);

        const verifiedDob = parseDateInput(verifiedDobRaw);

        const verifiedAge = parsePositiveInt(verifiedAgeRaw);

        const caseOpeningDate = parseDateInput(caseOpeningDateRaw);

        const caseRiskLevel = normalizeRiskLevel(caseRiskRaw);

        const caseStatus = normalizeCaseStatus(caseStatusRaw);

        const hearingDate = parseDateInput(hearingDateRaw);

        const lastHearingDate = parseDateInput(lastHearingDateRaw);

        const nextHearingDate = parseDateInput(nextHearingDateRaw);

        const firDate = parseDateInput(firDateRaw);

        const previousCaseInvolvement = parseBooleanLike(previousCaseInvolvementRaw);

        const [child] = await db.insert(childrenTable).values({
          childId: generateChildId(),
          centerId: resolvedCenterId,
          fullName,
          motherName: motherName || null,
          fatherName: fatherName || null,
          gender,
          admissionDate,
          admissionSource,
          currentStatus: currentStatus ?? "Admitted",
          dateOfBirth,
          verifiedDob,
          verifiedAge,
          verifiedAgeDate: verifiedDob ? new Date().toISOString().split("T")[0] : null,
          religion: religion || null,
          nationality: nationality || null,
          presentDistrict: presentDistrict || null,
          presentUpazila: presentUpazila || null,
          presentVillage: presentVillage || null,
          permanentDistrict: permanentDistrict || null,
          permanentUpazila: permanentUpazila || null,
          permanentVillage: permanentVillage || null,
          courtReferenceNo: courtReferenceNo || null,
          caseType: caseType || null,
        }).returning({ id: childrenTable.id });
        results.childCreated++;

        await db.insert(admissionsTable).values({
          admissionId: generateAdmissionId(),
          childId: child.id,
          admissionDate,
          admissionSource,
          receivingCenter: resolvedCenterId ? (centerNameById.get(resolvedCenterId) ?? null) : null,
          documentsVerified: true,
          verifiedBy: user.fullName ?? "System Import",
          verificationDate: new Date().toISOString().split("T")[0],
          approvalStatus: "Approved",
          approvedByName: user.fullName ?? "System Import",
          authorityRemarks: rowReleaseFlag ? "জামিনে মুক্তি" : null,
        });
        results.admissionCreated++;

        const hasCaseData = Boolean(
          caseOpeningDate ||
          assignedCaseWorker ||
          caseRiskLevel ||
          caseStatus ||
          caseSummary ||
          investigationNotes ||
          recommendation,
        );

        if (hasCaseData) {
          await db.insert(casesTable).values({
            caseId: generateCaseId(),
            childId: child.id,
            centerId: resolvedCenterId,
            caseOpeningDate,
            assignedCaseWorker: assignedCaseWorker || null,
            riskLevel: caseRiskLevel,
            caseStatus: caseStatus ?? "Open",
            caseSummary: caseSummary || null,
            investigationNotes: investigationNotes || null,
            recommendation: recommendation || null,
          });
          results.caseCreated++;
        }

        const hasCourtCaseData = Boolean(
          courtName ||
          courtCaseNo ||
          policeStationName ||
          grNumber ||
          legalSection ||
          legalAidType ||
          hearingDate ||
          lastHearingDate ||
          nextHearingDate ||
          lawyerName ||
          childCaseType ||
          previousCaseInvolvement != null ||
          outcome ||
          firNumber ||
          firDate ||
          currentCaseStatus ||
          courtAttendanceDetails ||
          courtAttendanceDates ||
          guardianCommunication ||
          educationTraining ||
          centerFacilities ||
          caseComments,
        );

        if (hasCourtCaseData) {
          const courtNameForInsert = courtName || "Unknown Court";
          const caseNoForInsert = courtCaseNo || `AUTO-${new Date().getFullYear()}-${String(rowNo).padStart(4, "0")}`;

          await db.insert(courtCasesTable).values({
            courtCaseId: generateCourtCaseId(),
            childId: child.id,
            courtName: courtNameForInsert,
            policeStationName: policeStationName || null,
            grNumber: grNumber || null,
            caseNo: caseNoForInsert,
            legalSection: legalSection || null,
            legalAidType: legalAidType || null,
            hearingDate,
            lastHearingDate,
            lawyerName: lawyerName || null,
            childCaseType: childCaseType || null,
            previousCaseInvolvement: previousCaseInvolvement ?? false,
            outcome: outcome || null,
            nextHearingDate,
            firNumber: firNumber || null,
            firDate,
            currentCaseStatus: currentCaseStatus || null,
            courtAttendanceDetails: courtAttendanceDetails || null,
            courtAttendanceDates: courtAttendanceDates || null,
            guardianCommunication: guardianCommunication || null,
            educationTraining: educationTraining || null,
            centerFacilities: centerFacilities || null,
            caseComments: caseComments || null,
          });
          results.courtCaseCreated++;
        }

        results.success++;
      } catch (err: any) {
        results.errors.push({
          row: rowNo,
          field: "row",
          message: err?.message ?? "Unexpected error",
        });
      }
    }

    res.json(results);
  } catch (err) {
    req.log.error({ err }, "Failed to bulk import children");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db.select({
      child: childrenTable,
      centerName: centersTable.centerName,
      centerNameBn: centersTable.centerNameBn,
    }).from(childrenTable)
      .leftJoin(centersTable, eq(childrenTable.centerId, centersTable.id))
      .where(eq(childrenTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found", message: "Child not found" });
    res.json(enrichChild({ ...row.child, centerName: row.centerName ?? null, centerNameBn: row.centerNameBn ?? null }));
  } catch (err) {
    req.log.error({ err }, "Failed to get child");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = normalizeChildPayload(req.body);

    // Legacy verifiedAge support
    if (body.verifiedAge != null && !body.verifiedAgeDate) {
      body.verifiedAgeDate = new Date().toISOString().split("T")[0];
    }

    if (body.currentStatus === "Released") {
      const [approvedRelease] = await db
        .select({ id: releaseRecordsTable.id })
        .from(releaseRecordsTable)
        .where(and(eq(releaseRecordsTable.childId, id), eq(releaseRecordsTable.authorityApproval, true)))
        .limit(1);

      if (!approvedRelease) {
        return res.status(400).json({
          error: "Invalid status",
          message: "Cannot set child status to Released without an approved release record.",
        });
      }
    }

    const [child] = await db.update(childrenTable).set(body).where(eq(childrenTable.id, id)).returning();
    if (!child) return res.status(404).json({ error: "Not found", message: "Child not found" });
    res.json(enrichChild(child));
  } catch (err) {
    req.log.error({ err }, "Failed to update child");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    // Step 1: Get all case IDs belonging to this child (needed for case sub-table cascade)
    const childCases = await db
      .select({ id: casesTable.id })
      .from(casesTable)
      .where(eq(casesTable.childId, id));
    const caseIds = childCases.map((c) => c.id);

    // Step 2: Delete case sub-tables that reference casesTable.id (not childrenTable.id)
    if (caseIds.length > 0) {
      await db.delete(caseAgreementsTable).where(inArray(caseAgreementsTable.caseId, caseIds));
      await db.delete(caseInterventionPlansTable).where(inArray(caseInterventionPlansTable.caseId, caseIds));
      await db.delete(caseDetailAssessmentsTable).where(inArray(caseDetailAssessmentsTable.caseId, caseIds));
      await db.delete(caseRiskAssessmentsTable).where(inArray(caseRiskAssessmentsTable.caseId, caseIds));
    }

    // Step 3: Delete all tables that reference childrenTable.id directly
    await db.delete(releaseRecordsTable).where(eq(releaseRecordsTable.childId, id));
    await db.delete(admissionsTable).where(eq(admissionsTable.childId, id));
    await db.delete(courtCasesTable).where(eq(courtCasesTable.childId, id));
    await db.delete(policeAcquisitionsTable).where(eq(policeAcquisitionsTable.childId, id));
    await db.delete(followUpsTable).where(eq(followUpsTable.childId, id));
    await db.delete(educationPlansTable).where(eq(educationPlansTable.childId, id));
    await db.delete(riskAssessmentsTable).where(eq(riskAssessmentsTable.childId, id));
    await db.delete(guardianVisitsTable).where(eq(guardianVisitsTable.childId, id));
    await db.delete(guardiansTable).where(eq(guardiansTable.childId, id));
    await db.delete(counselingSessionsTable).where(eq(counselingSessionsTable.childId, id));
    await db.delete(healthAssessmentsTable).where(eq(healthAssessmentsTable.childId, id));
    await db.delete(familySocioeconomicRecordsTable).where(eq(familySocioeconomicRecordsTable.childId, id));
    await db.delete(measurementSurveysTable).where(eq(measurementSurveysTable.childId, id));
    await db.delete(casesTable).where(eq(casesTable.childId, id));

    // Step 4: Finally delete the child
    await db.delete(childrenTable).where(eq(childrenTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete child");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
