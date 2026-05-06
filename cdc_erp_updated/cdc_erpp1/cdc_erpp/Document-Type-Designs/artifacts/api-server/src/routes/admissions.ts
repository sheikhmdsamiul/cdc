// @ts-nocheck
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  admissionsTable,
  caseAgreementsTable,
  caseDetailAssessmentsTable,
  caseInterventionPlansTable,
  caseRiskAssessmentsTable,
  casesTable,
  childrenTable,
  counselingSessionsTable,
  courtCasesTable,
  educationPlansTable,
  familySocioeconomicRecordsTable,
  followUpsTable,
  guardianVisitsTable,
  healthAssessmentsTable,
  measurementSurveysTable,
  policeAcquisitionsTable,
  releaseRecordsTable,
  riskAssessmentsTable,
  centersTable,
} from "@workspace/db";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getCurrentUser, moduleGuard } from "../middlewares/auth";

const router: IRouter = Router();

router.use(moduleGuard("admissions"));

const ADMISSION_WORKFLOW = {
  DRAFT: "Draft",
  SUBMITTED_TO_CW: "Submitted to CW",
  UPDATE_NEEDED_BY_CW: "Update Needed by CW",
  SUBMITTED_TO_PO: "Submitted to PO",
  UPDATE_NEEDED_BY_PO: "Update Needed by PO",
  SUBMITTED_TO_SUPT: "Submitted to SUPT",
  APPROVED: "Approved",
  REJECTED: "Rejected",
} as const;

function canCreateAdmission(user: any) {
  // If it's a global role or a center-based role with create permission
  return user.roleScope === "Global" || user.roleScope === "Center";
}

function canEditAdmissionByState(user: any, state: string | null | undefined) {
  const role = user.roleName ?? "";
  const scope = user.roleScope ?? "";
  const currentState = state ?? ADMISSION_WORKFLOW.DRAFT;
  
  if (scope === "Global" || role === "Center Admin") return true;
  
  // Center-based roles (DEO, Social Worker, etc.) can only edit in specific states
  if (scope === "Center") {
    return [
      ADMISSION_WORKFLOW.DRAFT,
      ADMISSION_WORKFLOW.UPDATE_NEEDED_BY_CW,
      ADMISSION_WORKFLOW.UPDATE_NEEDED_BY_PO,
    ].includes(currentState as any);
  }
  return false;
}

function canDeleteAdmission(user: any) {
  return user.roleScope === "Global" || user.roleName === "Center Admin";
}

function canBulkCascadeDeleteAdmissions(roleName: string | null | undefined) {
  return roleName === "Super Admin";
}

function canAccessCenter(user: any, recordCenterId: number | null) {
  if (!user) return false;
  if (user.roleScope === "Global") return true;
  if (recordCenterId == null) return true;
  return user.centerId === recordCenterId;
}

function isGenderCenterValidationBypassed(user: any) {
  return user.roleScope === "Global";
}

function normalizeGender(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function classifyCenter(centerLike: string | null | undefined): "konabari" | "tongi_or_fulerhat" | "other" {
  const normalized = String(centerLike ?? "").trim().toLowerCase();
  if (normalized.includes("konabari")) return "konabari";
  if (
    normalized.includes("tongi") ||
    normalized.includes("fulerhat") ||
    normalized.includes("jashore")
  ) {
    return "tongi_or_fulerhat";
  }
  return "other";
}

function buildGenderCenterError(centerLike: string | null | undefined, genderLike: unknown) {
  const gender = normalizeGender(genderLike);
  const normalizedGender =
    gender === "male" ? "boy"
      : gender === "female" ? "girl"
        : gender === "other" ? "others"
          : gender;
  const centerGroup = classifyCenter(centerLike);

  if (!normalizedGender || centerGroup === "other") return null;
  // "others" gender can be admitted to any center—no restriction
  if (normalizedGender === "others") return null;

  if (centerGroup === "konabari" && normalizedGender === "boy") {
    return {
      error: "Konabari center is for girls only",
      errorBn: "কনাবাড়ি কেন্দ্র শুধুমাত্র মেয়েদের জন্য",
    };
  }

  if (centerGroup === "tongi_or_fulerhat" && normalizedGender === "girl") {
    return {
      error: "Girls can only be admitted to Konabari center",
      errorBn: "মেয়েদের শুধুমাত্র কনাবাড়ি কেন্দ্রে ভর্তি করা যাবে",
    };
  }

  return null;
}



// getCenterIdByName is obsolete

function generateAdmissionId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `ADM-${year}-${rand}`;
}

async function syncChildCenterFromAdmission(admissionLike: { childId: number; centerId?: number | null }) {
  if (!admissionLike.centerId) return;
  await db
    .update(childrenTable)
    .set({ centerId: admissionLike.centerId })
    .where(eq(childrenTable.id, admissionLike.childId));
}

function admissionSelect() {
  return {
    id: admissionsTable.id,
    admissionId: admissionsTable.admissionId,
    childId: admissionsTable.childId,
    childName: childrenTable.fullName,
    childCenterId: childrenTable.centerId,
    childCenterName: centersTable.centerName,
    admissionDate: admissionsTable.admissionDate,
    admissionTime: admissionsTable.admissionTime,
    admissionSource: admissionsTable.admissionSource,
    centerId: admissionsTable.centerId,
    centerName: centersTable.centerName,
    centerNameBn: centersTable.centerNameBn,
    receivingOfficer: admissionsTable.receivingOfficer,
    documentsVerified: admissionsTable.documentsVerified,
    verifiedBy: admissionsTable.verifiedBy,
    verificationDate: admissionsTable.verificationDate,
    approvalStatus: admissionsTable.approvalStatus,
    authorityRemarks: admissionsTable.authorityRemarks,
    cwFeedback: admissionsTable.cwFeedback,
    poFeedback: admissionsTable.poFeedback,
    rejectionNote: admissionsTable.rejectionNote,
    approvedByName: admissionsTable.approvedByName,
    rejectedByName: admissionsTable.rejectedByName,
    createdAt: admissionsTable.createdAt,
    updatedAt: admissionsTable.updatedAt,
  };
}

router.get("/", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const isGlobal = user.roleName === "Super Admin" || user.roleName === "Head Office";
    if (!isGlobal && !user.centerId) return res.json([]);

    const { childId, status } = req.query as Record<string, string>;
    const conditions = [];
    if (childId) conditions.push(eq(admissionsTable.childId, parseInt(childId, 10)));
    if (status) conditions.push(eq(admissionsTable.approvalStatus, status));
    if (!isGlobal) {
      conditions.push(eq(childrenTable.centerId, user.centerId!));
    }

    const whereClause = conditions.length === 0
      ? undefined
      : conditions.length === 1
        ? conditions[0]
        : and(...conditions);

    const rows = await db
      .select(admissionSelect())
      .from(admissionsTable)
      .leftJoin(childrenTable, eq(admissionsTable.childId, childrenTable.id))
      .leftJoin(centersTable, eq(admissionsTable.centerId, centersTable.id))
      .where(whereClause)
      .orderBy(desc(admissionsTable.createdAt));

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list admissions");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    // moduleGuard("admissions") handles the general 'canCreate' check.
    // We just verify the user has a valid scope here.
    if (!user.roleScope) return res.status(403).json({ error: "Forbidden: role has no scope" });

    const childId = parseInt(req.body.childId, 10);
    const [child] = await db
      .select({ centerId: childrenTable.centerId, gender: childrenTable.gender })
      .from(childrenTable)
      .where(eq(childrenTable.id, childId))
      .limit(1);
    if (!child) return res.status(404).json({ error: "Child not found" });
    if (!canAccessCenter(user, child.centerId ?? null)) return res.status(403).json({ error: "Forbidden" });

    if (user.roleScope === "Center" && user.centerId != null) {
      const requestedCenterId = req.body?.centerId ? parseInt(req.body.centerId, 10) : null;
      if (requestedCenterId != null && requestedCenterId !== user.centerId) {
        return res.status(403).json({ error: "Forbidden: DEO can submit admissions only for their own center" });
      }
      if (!req.body?.centerId && user.centerId) {
        req.body.centerId = user.centerId;
      }
    }

    if (!isGenderCenterValidationBypassed(user)) {
      const centerId = req.body?.centerId ? parseInt(req.body.centerId, 10) : child.centerId;
      let centerName = "";
      if (centerId) {
        const [c] = await db.select({ centerName: centersTable.centerName }).from(centersTable).where(eq(centersTable.id, centerId)).limit(1);
        if (c) centerName = c.centerName;
      }
      const violation = buildGenderCenterError(centerName, child.gender);
      if (violation) return res.status(400).json(violation);
    }

    const [admission] = await db.insert(admissionsTable).values({
      ...req.body,
      childId,
      approvalStatus: ADMISSION_WORKFLOW.DRAFT,
      admissionId: generateAdmissionId(),
    }).returning();
    await syncChildCenterFromAdmission(admission);

    const [row] = await db
      .select(admissionSelect())
      .from(admissionsTable)
      .leftJoin(childrenTable, eq(admissionsTable.childId, childrenTable.id))
      .leftJoin(centersTable, eq(admissionsTable.centerId, centersTable.id))
      .where(eq(admissionsTable.id, admission.id))
      .limit(1);

    res.status(201).json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to create admission");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const id = parseInt(req.params.id, 10);
    const [row] = await db
      .select(admissionSelect())
      .from(admissionsTable)
      .leftJoin(childrenTable, eq(admissionsTable.childId, childrenTable.id))
      .leftJoin(centersTable, eq(admissionsTable.centerId, centersTable.id))
      .where(eq(admissionsTable.id, id))
      .limit(1);

    if (!row) return res.status(404).json({ error: "Not found", message: "Admission not found" });
    if (!canAccessCenter(user, row.childCenterId ?? null)) return res.status(403).json({ error: "Forbidden" });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to get admission");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const id = parseInt(req.params.id, 10);
    const [existing] = await db
      .select({
        childId: admissionsTable.childId,
        approvalStatus: admissionsTable.approvalStatus,
      })
      .from(admissionsTable)
      .where(eq(admissionsTable.id, id))
      .limit(1);

    if (!existing) return res.status(404).json({ error: "Not found" });
    if (!canEditAdmissionByState(user, existing.approvalStatus)) {
      return res.status(403).json({ error: "Forbidden: role cannot edit in this workflow state" });
    }

    const [child] = await db
      .select({ centerId: childrenTable.centerId, gender: childrenTable.gender })
      .from(childrenTable)
      .where(eq(childrenTable.id, existing.childId))
      .limit(1);
    if (!child) return res.status(404).json({ error: "Child not found" });
    if (!canAccessCenter(user, child.centerId ?? null)) return res.status(403).json({ error: "Forbidden" });

    if (user.roleScope === "Center" && user.centerId != null) {
      const requestedCenterId = req.body?.centerId ? parseInt(req.body.centerId, 10) : null;
      if (requestedCenterId != null && requestedCenterId !== user.centerId) {
        return res.status(403).json({ error: "Forbidden: DEO can submit admissions only for their own center" });
      }
      if (!req.body?.centerId && user.centerId) {
        req.body.centerId = user.centerId;
      }
    }

    if (!isGenderCenterValidationBypassed(user)) {
      const centerId = req.body?.centerId ? parseInt(req.body.centerId, 10) : child.centerId;
      let centerName = "";
      if (centerId) {
        const [c] = await db.select({ centerName: centersTable.centerName }).from(centersTable).where(eq(centersTable.id, centerId)).limit(1);
        if (c) centerName = c.centerName;
      }
      const violation = buildGenderCenterError(centerName, child.gender);
      if (violation) return res.status(400).json(violation);
    }

    const [admission] = await db
      .update(admissionsTable)
      .set({
        ...req.body,
        approvalStatus: existing.approvalStatus,
      })
      .where(eq(admissionsTable.id, id))
      .returning();

    if (!admission) return res.status(404).json({ error: "Not found", message: "Admission not found" });
    await syncChildCenterFromAdmission(admission);

    const [row] = await db
      .select(admissionSelect())
      .from(admissionsTable)
      .leftJoin(childrenTable, eq(admissionsTable.childId, childrenTable.id))
      .leftJoin(centersTable, eq(admissionsTable.centerId, centersTable.id))
      .where(eq(admissionsTable.id, admission.id))
      .limit(1);

    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to update admission");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/bulk-delete", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (!canBulkCascadeDeleteAdmissions(user.roleName)) {
      return res.status(403).json({
        error: "Forbidden: bulk cascade delete is allowed only for Super Admin",
      });
    }

    const incomingIds = Array.isArray(req.body?.admissionIds) ? req.body.admissionIds : [];
    const admissionIds = [...new Set(
      incomingIds
        .map((v: unknown) => Number(v))
        .filter((v: number) => Number.isInteger(v) && v > 0),
    )];

    if (admissionIds.length === 0) {
      return res.status(400).json({ error: "admissionIds must be a non-empty array of numbers" });
    }

    const admissions = await db
      .select({
        id: admissionsTable.id,
        childId: admissionsTable.childId,
      })
      .from(admissionsTable)
      .where(inArray(admissionsTable.id, admissionIds));

    if (admissions.length === 0) {
      return res.status(404).json({ error: "No admissions found for provided ids" });
    }

    const childIds = [...new Set(admissions.map((r) => r.childId).filter((v): v is number => Number.isInteger(v)))];
    if (childIds.length === 0) {
      return res.status(400).json({ error: "No child records mapped for selected admissions" });
    }

    const result = await db.transaction(async (tx) => {
      const cases = await tx
        .select({ id: casesTable.id })
        .from(casesTable)
        .where(inArray(casesTable.childId, childIds));
      const caseIds = cases.map((r) => r.id);

      const deleted: Record<string, number> = {};

      if (caseIds.length > 0) {
        deleted.case_agreements = (await tx.delete(caseAgreementsTable).where(inArray(caseAgreementsTable.caseId, caseIds)).returning({ id: caseAgreementsTable.id })).length;
        deleted.case_detail_assessments = (await tx.delete(caseDetailAssessmentsTable).where(inArray(caseDetailAssessmentsTable.caseId, caseIds)).returning({ id: caseDetailAssessmentsTable.id })).length;
        deleted.case_intervention_plans = (await tx.delete(caseInterventionPlansTable).where(inArray(caseInterventionPlansTable.caseId, caseIds)).returning({ id: caseInterventionPlansTable.id })).length;
        deleted.case_risk_assessments = (await tx.delete(caseRiskAssessmentsTable).where(inArray(caseRiskAssessmentsTable.caseId, caseIds)).returning({ id: caseRiskAssessmentsTable.id })).length;
      } else {
        deleted.case_agreements = 0;
        deleted.case_detail_assessments = 0;
        deleted.case_intervention_plans = 0;
        deleted.case_risk_assessments = 0;
      }

      deleted.guardian_visits = (await tx.delete(guardianVisitsTable).where(inArray(guardianVisitsTable.childId, childIds)).returning({ id: guardianVisitsTable.id })).length;
      deleted.court_cases = (await tx.delete(courtCasesTable).where(inArray(courtCasesTable.childId, childIds)).returning({ id: courtCasesTable.id })).length;
      deleted.health_assessments = (await tx.delete(healthAssessmentsTable).where(inArray(healthAssessmentsTable.childId, childIds)).returning({ id: healthAssessmentsTable.id })).length;
      deleted.counseling_sessions = (await tx.delete(counselingSessionsTable).where(inArray(counselingSessionsTable.childId, childIds)).returning({ id: counselingSessionsTable.id })).length;
      deleted.education_plans = (await tx.delete(educationPlansTable).where(inArray(educationPlansTable.childId, childIds)).returning({ id: educationPlansTable.id })).length;
      deleted.risk_assessments = (await tx.delete(riskAssessmentsTable).where(inArray(riskAssessmentsTable.childId, childIds)).returning({ id: riskAssessmentsTable.id })).length;
      deleted.release_records = (await tx.delete(releaseRecordsTable).where(inArray(releaseRecordsTable.childId, childIds)).returning({ id: releaseRecordsTable.id })).length;
      deleted.follow_ups = (await tx.delete(followUpsTable).where(inArray(followUpsTable.childId, childIds)).returning({ id: followUpsTable.id })).length;
      deleted.family_socioeconomic_records = (await tx.delete(familySocioeconomicRecordsTable).where(inArray(familySocioeconomicRecordsTable.childId, childIds)).returning({ id: familySocioeconomicRecordsTable.id })).length;
      deleted.police_acquisitions = (await tx.delete(policeAcquisitionsTable).where(inArray(policeAcquisitionsTable.childId, childIds)).returning({ id: policeAcquisitionsTable.id })).length;
      deleted.measurement_surveys = (await tx.delete(measurementSurveysTable).where(inArray(measurementSurveysTable.childId, childIds)).returning({ id: measurementSurveysTable.id })).length;
      deleted.cases = (await tx.delete(casesTable).where(inArray(casesTable.childId, childIds)).returning({ id: casesTable.id })).length;
      deleted.admissions = (await tx.delete(admissionsTable).where(inArray(admissionsTable.childId, childIds)).returning({ id: admissionsTable.id })).length;
      deleted.children = (await tx.delete(childrenTable).where(inArray(childrenTable.id, childIds)).returning({ id: childrenTable.id })).length;

      return { deleted };
    });

    res.json({
      ok: true,
      admissionIds,
      affectedChildIds: childIds,
      deleted: result.deleted,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to bulk cascade delete admissions");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (!canDeleteAdmission(user)) return res.status(403).json({ error: "Forbidden" });

    const id = parseInt(req.params.id, 10);
    const [existing] = await db
      .select({ childId: admissionsTable.childId })
      .from(admissionsTable)
      .where(eq(admissionsTable.id, id))
      .limit(1);
    if (!existing) return res.status(404).json({ error: "Not found" });

    const [child] = await db
      .select({ centerId: childrenTable.centerId })
      .from(childrenTable)
      .where(eq(childrenTable.id, existing.childId))
      .limit(1);
    if (!child) return res.status(404).json({ error: "Child not found" });
    if (!canAccessCenter(user, child.centerId ?? null)) return res.status(403).json({ error: "Forbidden" });

    await db.delete(admissionsTable).where(eq(admissionsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete admission");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

router.post("/:id/action", async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const id = parseInt(req.params.id, 10);
    const { action, feedback, note } = req.body as {
      action?: string;
      feedback?: string;
      note?: string;
    };

    const [existing] = await db
      .select({
        id: admissionsTable.id,
        childId: admissionsTable.childId,
        approvalStatus: admissionsTable.approvalStatus,
      })
      .from(admissionsTable)
      .where(eq(admissionsTable.id, id))
      .limit(1);

    if (!existing) return res.status(404).json({ error: "Admission not found" });

    const [child] = await db
      .select({ centerId: childrenTable.centerId })
      .from(childrenTable)
      .where(eq(childrenTable.id, existing.childId))
      .limit(1);
    if (!child) return res.status(404).json({ error: "Child not found" });
    if (!canAccessCenter(user, child.centerId ?? null)) return res.status(403).json({ error: "Forbidden" });

    const role = user.roleName ?? "";
    const state = existing.approvalStatus ?? ADMISSION_WORKFLOW.DRAFT;
    const isAdminOverride = role === "Super Admin" || role === "Head Office" || role === "Center Admin";
    const trimmedFeedback = feedback?.trim();
    const trimmedNote = note?.trim();
    const updates: Partial<typeof admissionsTable.$inferInsert> = {};
    let nextState: string | null = null;

    if (
      action === "submit_to_cw" &&
      (isAdminOverride || role === "Data Entry Operator") &&
      [ADMISSION_WORKFLOW.DRAFT, ADMISSION_WORKFLOW.UPDATE_NEEDED_BY_CW, ADMISSION_WORKFLOW.UPDATE_NEEDED_BY_PO].includes(state as any)
    ) {
      nextState = ADMISSION_WORKFLOW.SUBMITTED_TO_CW;
      updates.cwFeedback = null;
      updates.poFeedback = null;
      updates.rejectionNote = null;
      updates.rejectedByName = null;
      updates.authorityRemarks = null;
    } else if (
      action === "update_needed_cw" &&
      (isAdminOverride || role === "Case Worker") &&
      state === ADMISSION_WORKFLOW.SUBMITTED_TO_CW
    ) {
      if (!trimmedFeedback) return res.status(400).json({ error: "Feedback is required" });
      nextState = ADMISSION_WORKFLOW.UPDATE_NEEDED_BY_CW;
      updates.cwFeedback = trimmedFeedback;
      updates.poFeedback = null;
      updates.authorityRemarks = trimmedFeedback;
    } else if (
      action === "forward_to_po" &&
      (isAdminOverride || role === "Case Worker") &&
      state === ADMISSION_WORKFLOW.SUBMITTED_TO_CW
    ) {
      nextState = ADMISSION_WORKFLOW.SUBMITTED_TO_PO;
      updates.verifiedBy = user.fullName;
      updates.verificationDate = new Date().toISOString().split("T")[0] as any;
      updates.cwFeedback = null;
    } else if (
      action === "update_needed_po" &&
      (isAdminOverride || role === "Probation Officer") &&
      state === ADMISSION_WORKFLOW.SUBMITTED_TO_PO
    ) {
      if (!trimmedFeedback) return res.status(400).json({ error: "Feedback is required" });
      nextState = ADMISSION_WORKFLOW.UPDATE_NEEDED_BY_PO;
      updates.poFeedback = trimmedFeedback;
      updates.authorityRemarks = trimmedFeedback;
    } else if (
      action === "forward_to_supt" &&
      (isAdminOverride || role === "Probation Officer") &&
      state === ADMISSION_WORKFLOW.SUBMITTED_TO_PO
    ) {
      nextState = ADMISSION_WORKFLOW.SUBMITTED_TO_SUPT;
      updates.poFeedback = null;
    } else if (
      action === "approve" &&
      (isAdminOverride || role === "Superintendent") &&
      state === ADMISSION_WORKFLOW.SUBMITTED_TO_SUPT
    ) {
      nextState = ADMISSION_WORKFLOW.APPROVED;
      updates.documentsVerified = true;
      updates.approvedByName = user.fullName;
      updates.rejectionNote = null;
      updates.rejectedByName = null;
      updates.authorityRemarks = null;
      await db
        .update(childrenTable)
        .set({ currentStatus: "Admitted" })
        .where(eq(childrenTable.id, existing.childId));
    } else if (
      action === "reject" &&
      (isAdminOverride || role === "Superintendent") &&
      state === ADMISSION_WORKFLOW.SUBMITTED_TO_SUPT
    ) {
      if (!trimmedNote) return res.status(400).json({ error: "Rejection note is required" });
      nextState = ADMISSION_WORKFLOW.REJECTED;
      updates.rejectionNote = trimmedNote;
      updates.rejectedByName = user.fullName;
      updates.authorityRemarks = trimmedNote;
    } else {
      return res.status(403).json({ error: "Action not permitted in current workflow state" });
    }

    updates.approvalStatus = nextState;

    const [updated] = await db
      .update(admissionsTable)
      .set(updates)
      .where(eq(admissionsTable.id, id))
      .returning();

    const [row] = await db
      .select(admissionSelect())
      .from(admissionsTable)
      .leftJoin(childrenTable, eq(admissionsTable.childId, childrenTable.id))
      .leftJoin(centersTable, eq(admissionsTable.centerId, centersTable.id))
      .where(eq(admissionsTable.id, updated.id))
      .limit(1);

    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Failed to run admission workflow action");
    res.status(500).json({ error: "Internal server error", message: String(err) });
  }
});

export default router;
