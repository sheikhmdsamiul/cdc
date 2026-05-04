/**
 * CDC ERP — Demo Data Seed
 * Clears all existing demo data and seeds fresh center-segregated records.
 * Run: pnpm --filter @workspace/scripts run seed-demo
 */
import { db } from "@workspace/db";
import {
  childrenTable, centersTable, casesTable, courtCasesTable,
  healthAssessmentsTable, counselingSessionsTable, guardianVisitsTable,
  policeAcquisitionsTable, educationPlansTable, releaseRecordsTable,
  followUpsTable, admissionsTable, riskAssessmentsTable,
  measurementSurveysTable, caseRiskAssessmentsTable,
  caseDetailAssessmentsTable, caseInterventionPlansTable,
  caseAgreementsTable, guardiansTable,
} from "@workspace/db/schema";

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function dob(yearsAgo: number, monthOffset = 0, dayOffset = 0): string {
  const d = new Date("2026-04-02");
  d.setFullYear(d.getFullYear() - yearsAgo);
  d.setMonth(d.getMonth() + monthOffset);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split("T")[0];
}

function pastDate(daysAgo: number): string {
  const d = new Date("2026-04-02");
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function futureDate(daysAhead: number): string {
  const d = new Date("2026-04-02");
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
}

let caseCounter = 1;
let courtCounter = 1;
let healthCounter = 1;
let acquisitionCounter = 1;
let admissionCounter = 1;
let counselingCounter = 1;
let surveyCounter = 1;
let followUpCounter = 1;
let guardianCounter = 1;

const mk = (n: number, p: string) => `${p}-2026-${String(n).padStart(5, "0")}`;

/* ─── clear demo tables (keep users/roles/centers/admin-units) ────────────── */
async function clearDemoData() {
  console.log("Clearing existing demo data...");
  await db.delete(caseAgreementsTable);
  await db.delete(caseInterventionPlansTable);
  await db.delete(caseDetailAssessmentsTable);
  await db.delete(caseRiskAssessmentsTable);
  await db.delete(measurementSurveysTable);
  await db.delete(followUpsTable);
  await db.delete(releaseRecordsTable);
  await db.delete(educationPlansTable);
  await db.delete(policeAcquisitionsTable);
  await db.delete(riskAssessmentsTable);
  await db.delete(counselingSessionsTable);
  await db.delete(guardianVisitsTable);
  await db.delete(healthAssessmentsTable);
  await db.delete(courtCasesTable);
  await db.delete(admissionsTable);
  await db.delete(casesTable);
  await db.delete(guardiansTable);
  await db.delete(childrenTable);
  console.log("  Done.");
}

/* ─── helper: insert one child + related records ────────────────────────── */
async function insertChild(opts: {
  centerId: number;
  name: string;
  gender: "Male" | "Female";
  dateOfBirth: string;
  verifiedDob?: string;
  ageAtAdmission: number;
  admissionDate: string;
  admissionSource: string;
  courtRef?: string;
  caseType: string;
  currentStatus: "Admitted" | "Released" | "Transferred";
  district: string;
  upazila: string;
  division: string;
  riskLevel: "High" | "Medium" | "Low";
  workflowState: "Draft" | "Submitted to DF" | "Reviewed by DF" | "Reviewed by PO" | "Approved";
  nextHearingDate?: string;
  caseWorkerName: string;
  fatherName?: string;
  motherName?: string;
}) {
  const year = 2026;
  const idx = caseCounter;
  const childIdStr = `CHILD-${year}-${String(idx).padStart(5, "0")}`;
  const normalizedChildGender = opts.gender === "Male" ? "Boy" : "Girl";

  const [child] = await db.insert(childrenTable).values({
    childId: childIdStr,
    centerId: opts.centerId,
    fullName: opts.name,
    gender: normalizedChildGender,
    dateOfBirth: opts.dateOfBirth,
    verifiedDob: opts.verifiedDob ?? opts.dateOfBirth,
    ageAtAdmission: opts.ageAtAdmission,
    religion: "Islam",
    nationality: "Bangladeshi",
    presentDivision: opts.division,
    presentDistrict: opts.district,
    presentUpazila: opts.upazila,
    presentAddress: `${opts.upazila}, ${opts.district}`,
    permanentAddress: `গ্রাম: ${opts.upazila}, থানা: ${opts.district}`,
    admissionDate: opts.admissionDate,
    admissionSource: opts.admissionSource,
    courtReferenceNo: opts.courtRef ?? `CR-${year}-${String(idx).padStart(4, "0")}`,
    caseType: opts.caseType,
    currentStatus: opts.currentStatus,
  }).returning();

  // Case
  const [caseRec] = await db.insert(casesTable).values({
    caseId: mk(caseCounter, "CASE"),
    childId: child.id,
    centerId: opts.centerId,
    caseOpeningDate: opts.admissionDate,
    assignedCaseWorker: opts.caseWorkerName,
    riskLevel: opts.riskLevel,
    caseStatus: opts.currentStatus === "Released" ? "Closed" : "Open",
    caseSummary: `শিশুটি ${opts.admissionSource} থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে ${opts.riskLevel.toLowerCase()} ঝুঁকি চিহ্নিত হয়েছে।`,
    investigationNotes: `পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।`,
    recommendation: opts.workflowState === "Approved" ? "পরিবারে পুনর্মিলন বিবেচনা করুন।" : "নিয়মিত ফলো-আপ প্রয়োজন।",
    workflowState: opts.workflowState,
    fatherName: opts.fatherName ?? "অজানা",
    motherName: opts.motherName ?? "অজানা",
    nationality: "Bangladeshi",
    religion: "Islam",
    currentAddressDivision: opts.division,
    currentAddressDistrict: opts.district,
    currentAddressUpazila: opts.upazila,
  }).returning();
  caseCounter++;

  // Court case
  await db.insert(courtCasesTable).values({
    courtCaseId: mk(courtCounter, "CRT"),
    childId: child.id,
    courtName: `যুগ্ম দায়রা জজ আদালত, ${opts.district}`,
    caseNo: `CR-${year}/${String(courtCounter).padStart(3, "0")}`,
    hearingDate: pastDate(60 + courtCounter * 3),
    lawyerName: "অ্যাডভোকেট মোহাম্মদ আলী",
    outcome: "পরবর্তী শুনানির তারিখ নির্ধারিত",
    nextHearingDate: opts.nextHearingDate ?? null,
  }).catch(() => null);
  courtCounter++;

  // Health assessment
  await db.insert(healthAssessmentsTable).values({
    assessmentId: mk(healthCounter, "HEALTH"),
    childId: child.id,
    assessmentDate: opts.admissionDate,
    height: 140 + Math.floor(Math.random() * 30),
    weight: 35 + Math.floor(Math.random() * 20),
    bmi: 18 + Math.random() * 4,
    physicalCondition: "সুস্থ",
    mentalCondition: "স্বাভাবিক",
    doctorName: "ডা. নুরুল ইসলাম",
    visibleInjury: false,
    immeditateTreatmentRequired: false,
    hospitalReferralNeeded: false,
    recommendation: "নিয়মিত স্বাস্থ্য পরীক্ষা অব্যাহত রাখুন।",
  }).catch(() => null);
  healthCounter++;

  // Counseling session
  await db.insert(counselingSessionsTable).values({
    sessionId: mk(counselingCounter, "CS"),
    childId: child.id,
    sessionDate: pastDate(30),
    counselor: opts.caseWorkerName,
    sessionType: "Individual",
    issuesDiscussed: "পারিবারিক যোগাযোগ ও মানসিক সুস্থতা নিয়ে আলোচনা হয়েছে।",
    observations: "শিশুর মানসিক অবস্থা স্থিতিশীল। পরিবারের সাথে যোগাযোগ বজায় রাখা হচ্ছে।",
    outcome: "নিয়মিত কাউন্সেলিং চালিয়ে যাওয়ার পরামর্শ দেওয়া হয়েছে।",
    nextSessionDate: opts.currentStatus === "Admitted" ? futureDate(30) : null,
  }).catch(() => null);
  counselingCounter++;

  // Admission record
  await db.insert(admissionsTable).values({
    admissionId: mk(admissionCounter, "ADM"),
    childId: child.id,
    admissionDate: opts.admissionDate,
    admissionSource: opts.admissionSource,
    receivingCenter: opts.admissionSource,
    receivingOfficer: opts.caseWorkerName,
    documentsVerified: true,
    approvalStatus: opts.workflowState === "Approved" ? "Approved" : "Pending",
  }).catch(() => null);
  admissionCounter++;

  // Measurement survey
  await db.insert(measurementSurveysTable).values({
    surveyId: mk(surveyCounter, "SURV"),
    centerId: opts.centerId,
    childId: child.id,
    enumeratorName: opts.caseWorkerName,
    surveyDate: opts.admissionDate,
    ageGroup:
      opts.ageAtAdmission <= 10 ? "9-10" :
      opts.ageAtAdmission <= 12 ? "11-12" :
      opts.ageAtAdmission <= 14 ? "13-14" :
      opts.ageAtAdmission <= 16 ? "15-16" : "17-18",
    gender: opts.gender,
    educationLevel: "5",
    detentionLength: "6-12 months",
    homeDistrict: opts.district,
    structuredRoutine: "Always",
    educationHours: "2-3",
    physicalActivity: "Yes daily",
    readingAccess: true,
    lifeskillsParticipation: "Regularly",
    productiveActivities: true,
    complaintOpportunities: true,
    familyContact: "Sometimes",
    safetyPerception: "Safe",
    physicalPunishment: "Never",
    rulesFairness: "Fair",
    captainSystem: true,
    formalEducation: true,
    vocationalAvailable: true,
    tradesAvailable: ["Tailoring", "Computer"],
    vocationalSatisfaction: "Satisfied",
    selfHarm: false,
    inmateConflicts: "Rarely",
    emotionalWellbeing: "Stable",
    hopefulness: "Hopeful",
    legalRightsInformed: true,
    legalGuidance: "Sometimes",
    mainChallenges: "পরিবার থেকে দূরে থাকা",
    wishedChanges: "আরও বেশি দক্ষতা উন্নয়ন কার্যক্রম",
  }).catch(() => null);
  surveyCounter++;

  // Follow-up (if admitted)
  if (opts.currentStatus === "Admitted") {
    await db.insert(followUpsTable).values({
      followUpId: mk(followUpCounter, "FU"),
      childId: child.id,
      followUpDate: futureDate(15),
      visitType: "Routine",
      observation: "নিয়মিত ফলো-আপ নির্ধারিত।",
      nextAction: `পরবর্তী সাক্ষাৎ ${futureDate(45)} তারিখে পরিকল্পিত।`,
    }).catch(() => null);
    followUpCounter++;
  }

  // Release record (if released)
  if (opts.currentStatus === "Released") {
    await db.insert(releaseRecordsTable).values({
      releaseId: mk(followUpCounter, "REL"),
      childId: child.id,
      releaseDate: pastDate(90),
      releaseType: "Family Reunion",
      handedOverTo: opts.fatherName ?? "অভিভাবক",
      authorityApproval: true,
      remarks: "পরিবারের সাথে পুনর্মিলন সম্পন্ন।",
    }).catch(() => null);
    followUpCounter++;
  }

  return child;
}

/* ─── main seed ───────────────────────────────────────────────────────────── */
async function seed() {
  await clearDemoData();

  const allCenters = await db.select().from(centersTable);
  const tongi = allCenters.find(c => c.location === "Tongi");
  const konabari = allCenters.find(c => c.location === "Konabari");
  const fulerhat = allCenters.find(c => c.location === "Jashore");

  if (!tongi || !konabari || !fulerhat) {
    console.error("Centers not found. Run seed-auth first.");
    process.exit(1);
  }

  console.log("\n=== Seeding Tongi Boys CDC ===");

  await insertChild({
    centerId: tongi.id, name: "মোহাম্মদ রাফি হাসান", gender: "Male",
    dateOfBirth: dob(14, 0, -15), ageAtAdmission: 12,
    admissionDate: pastDate(730), admissionSource: "আদালতের নির্দেশে",
    caseType: "Juvenile Offence", currentStatus: "Admitted",
    district: "গাজীপুর", upazila: "টঙ্গি", division: "ঢাকা",
    riskLevel: "Medium", workflowState: "Reviewed by PO",
    nextHearingDate: futureDate(5),
    caseWorkerName: "সজল কুমার দাস",
    fatherName: "মোহাম্মদ করিম হাসান", motherName: "নাজমা বেগম",
  });

  await insertChild({
    centerId: tongi.id, name: "আরিফুল ইসলাম", gender: "Male",
    dateOfBirth: dob(15, -2, 10), ageAtAdmission: 13,
    admissionDate: pastDate(600), admissionSource: "পুলিশ হেফাজত থেকে",
    caseType: "Neglect", currentStatus: "Admitted",
    district: "নারায়ণগঞ্জ", upazila: "রূপগঞ্জ", division: "ঢাকা",
    riskLevel: "High", workflowState: "Reviewed by DF",
    nextHearingDate: futureDate(12),
    caseWorkerName: "সজল কুমার দাস",
    fatherName: "আবদুল করিম", motherName: "রহিমা বেগম",
  });

  await insertChild({
    centerId: tongi.id, name: "সাইফুল রহমান", gender: "Male",
    dateOfBirth: dob(13, 1, -5), ageAtAdmission: 11,
    admissionDate: pastDate(800), admissionSource: "আদালতের নির্দেশে",
    caseType: "Abuse", currentStatus: "Admitted",
    district: "গাজীপুর", upazila: "কালীগঞ্জ", division: "ঢাকা",
    riskLevel: "High", workflowState: "Submitted to DF",
    nextHearingDate: futureDate(28),
    caseWorkerName: "সজল কুমার দাস",
    fatherName: "রফিকুল রহমান", motherName: "হাসিনা বেগম",
  });

  await insertChild({
    centerId: tongi.id, name: "জুনায়েদ আহমেদ", gender: "Male",
    dateOfBirth: dob(16, -3, 8), ageAtAdmission: 14,
    admissionDate: pastDate(730), admissionSource: "সমাজসেবা অধিদফতর",
    caseType: "Abandoned", currentStatus: "Admitted",
    district: "ঢাকা", upazila: "দেমড়া", division: "ঢাকা",
    riskLevel: "Low", workflowState: "Approved",
    nextHearingDate: futureDate(22),
    caseWorkerName: "সজল কুমার দাস",
    fatherName: "মোহাম্মদ ইকবাল আহমেদ", motherName: "সুফিয়া আহমেদ",
  });

  await insertChild({
    centerId: tongi.id, name: "রিদওয়ান হোসেন", gender: "Male",
    dateOfBirth: dob(12, 2, -10), ageAtAdmission: 10,
    admissionDate: pastDate(650), admissionSource: "আদালতের নির্দেশে",
    caseType: "Juvenile Offence", currentStatus: "Admitted",
    district: "গাজীপুর", upazila: "শ্রীপুর", division: "ঢাকা",
    riskLevel: "Medium", workflowState: "Draft",
    caseWorkerName: "সজল কুমার দাস",
    fatherName: "আলী হোসেন", motherName: "মরিয়ম হোসেন",
  });

  await insertChild({
    centerId: tongi.id, name: "তামিম খান", gender: "Male",
    dateOfBirth: dob(15, -1, 3), ageAtAdmission: 13,
    admissionDate: pastDate(500), admissionSource: "পুলিশ হেফাজত থেকে",
    caseType: "Neglect", currentStatus: "Admitted",
    district: "কিশোরগঞ্জ", upazila: "ভৈরব", division: "ঢাকা",
    riskLevel: "Medium", workflowState: "Submitted to DF",
    nextHearingDate: futureDate(7),
    caseWorkerName: "সজল কুমার দাস",
    fatherName: "মাহমুদুল খান", motherName: "পারভিন বেগম",
  });

  // Approaching 18 — 60 days left
  await insertChild({
    centerId: tongi.id, name: "নাফিউজ্জামান", gender: "Male",
    dateOfBirth: dob(18, 0, 60), ageAtAdmission: 15,
    admissionDate: pastDate(1000), admissionSource: "আদালতের নির্দেশে",
    caseType: "Juvenile Offence", currentStatus: "Admitted",
    district: "গাজীপুর", upazila: "টঙ্গি", division: "ঢাকা",
    riskLevel: "Medium", workflowState: "Approved",
    nextHearingDate: futureDate(25),
    caseWorkerName: "সজল কুমার দাস",
    fatherName: "নুরুজ্জামান", motherName: "আমেনা বেগম",
  });

  // Approaching 18 — 25 days left
  await insertChild({
    centerId: tongi.id, name: "শফিউল আলম", gender: "Male",
    dateOfBirth: dob(18, 0, 25), ageAtAdmission: 15,
    admissionDate: pastDate(1100), admissionSource: "সমাজসেবা অধিদফতর",
    caseType: "Abuse", currentStatus: "Admitted",
    district: "মানিকগঞ্জ", upazila: "সিংগাইর", division: "ঢাকা",
    riskLevel: "High", workflowState: "Reviewed by PO",
    caseWorkerName: "সজল কুমার দাস",
    fatherName: "শামসুল আলম", motherName: "রুকাইয়া খাতুন",
  });

  // Over 18 — turned 18 three months ago
  await insertChild({
    centerId: tongi.id, name: "হাবিবুর রহমান", gender: "Male",
    dateOfBirth: dob(18, 3), ageAtAdmission: 15,
    admissionDate: pastDate(1095), admissionSource: "আদালতের নির্দেশে",
    caseType: "Juvenile Offence", currentStatus: "Admitted",
    district: "গাজীপুর", upazila: "টঙ্গি", division: "ঢাকা",
    riskLevel: "High", workflowState: "Reviewed by PO",
    nextHearingDate: futureDate(3),
    caseWorkerName: "সজল কুমার দাস",
    fatherName: "হারুনুর রশিদ", motherName: "জরিনা বেগম",
  });

  // Released
  await insertChild({
    centerId: tongi.id, name: "ইমরান হাসান", gender: "Male",
    dateOfBirth: dob(17, -4), ageAtAdmission: 14,
    admissionDate: pastDate(500), admissionSource: "আদালতের নির্দেশে",
    caseType: "Neglect", currentStatus: "Released",
    district: "ঢাকা", upazila: "গুলশান", division: "ঢাকা",
    riskLevel: "Low", workflowState: "Approved",
    caseWorkerName: "সজল কুমার দাস",
    fatherName: "মোস্তফা হাসান", motherName: "নার্গিস বেগম",
  });

  console.log("  Tongi: 10 children inserted.");

  /* ─── Konabari Girls CDC ──────────────────────────────────────────────── */
  console.log("\n=== Seeding Konabari Girls CDC ===");

  await insertChild({
    centerId: konabari.id, name: "ফারিয়া বেগম", gender: "Female",
    dateOfBirth: dob(14, 1, -8), ageAtAdmission: 12,
    admissionDate: pastDate(730), admissionSource: "আদালতের নির্দেশে",
    caseType: "Abuse", currentStatus: "Admitted",
    district: "গাজীপুর", upazila: "কোনাবাড়ি", division: "ঢাকা",
    riskLevel: "High", workflowState: "Submitted to DF",
    nextHearingDate: futureDate(4),
    caseWorkerName: "মিসেস শিরিন আক্তার",
    fatherName: "আলমগীর হোসেন", motherName: "মোসাম্মৎ নার্গিস",
  });

  await insertChild({
    centerId: konabari.id, name: "নাজমা খাতুন", gender: "Female",
    dateOfBirth: dob(13, -2, 5), ageAtAdmission: 11,
    admissionDate: pastDate(600), admissionSource: "সমাজসেবা অধিদফতর",
    caseType: "Neglect", currentStatus: "Admitted",
    district: "ময়মনসিংহ", upazila: "ত্রিশাল", division: "ময়মনসিংহ",
    riskLevel: "Medium", workflowState: "Draft",
    nextHearingDate: futureDate(18),
    caseWorkerName: "মিসেস শিরিন আক্তার",
    fatherName: "জাহাঙ্গীর আলম", motherName: "বেগম রোকেয়া",
  });

  await insertChild({
    centerId: konabari.id, name: "সাবিনা ইয়াসমিন", gender: "Female",
    dateOfBirth: dob(15, -1, 12), ageAtAdmission: 13,
    admissionDate: pastDate(730), admissionSource: "পুলিশ হেফাজত থেকে",
    caseType: "Trafficking", currentStatus: "Admitted",
    district: "শেরপুর", upazila: "নালিতাবাড়ী", division: "ময়মনসিংহ",
    riskLevel: "High", workflowState: "Reviewed by DF",
    nextHearingDate: futureDate(10),
    caseWorkerName: "মিসেস শিরিন আক্তার",
    fatherName: "আব্দুল লতিফ", motherName: "হাসনা হেনা",
  });

  await insertChild({
    centerId: konabari.id, name: "রেহানা পারভিন", gender: "Female",
    dateOfBirth: dob(16, 2, -3), ageAtAdmission: 14,
    admissionDate: pastDate(800), admissionSource: "আদালতের নির্দেশে",
    caseType: "Abandoned", currentStatus: "Admitted",
    district: "নেত্রকোণা", upazila: "কেন্দুয়া", division: "ময়মনসিংহ",
    riskLevel: "Low", workflowState: "Approved",
    caseWorkerName: "মিসেস শিরিন আক্তার",
    fatherName: "মতিউর রহমান", motherName: "রোকসানা বেগম",
  });

  await insertChild({
    centerId: konabari.id, name: "আয়েশা সিদ্দিকা", gender: "Female",
    dateOfBirth: dob(12, 0, 18), ageAtAdmission: 10,
    admissionDate: pastDate(750), admissionSource: "সমাজসেবা অধিদফতর",
    caseType: "Abuse", currentStatus: "Admitted",
    district: "গাজীপুর", upazila: "কালিয়াকৈর", division: "ঢাকা",
    riskLevel: "Medium", workflowState: "Reviewed by PO",
    nextHearingDate: futureDate(20),
    caseWorkerName: "মিসেস শিরিন আক্তার",
    fatherName: "আবুল কাসেম", motherName: "জাহানারা বেগম",
  });

  // Approaching 18 — 45 days left
  await insertChild({
    centerId: konabari.id, name: "সুমাইয়া আক্তার", gender: "Female",
    dateOfBirth: dob(18, 0, 45), ageAtAdmission: 14,
    admissionDate: pastDate(1100), admissionSource: "পুলিশ হেফাজত থেকে",
    caseType: "Trafficking", currentStatus: "Admitted",
    district: "কুড়িগ্রাম", upazila: "ভুরুঙ্গামারী", division: "রংপুর",
    riskLevel: "High", workflowState: "Reviewed by DF",
    nextHearingDate: futureDate(15),
    caseWorkerName: "মিসেস শিরিন আক্তার",
    fatherName: "সিরাজুল ইসলাম", motherName: "আক্লিমা বেগম",
  });

  // Over 18 — 1 month over
  await insertChild({
    centerId: konabari.id, name: "মারিয়াম বেগম", gender: "Female",
    dateOfBirth: dob(18, 1, 5),
    ageAtAdmission: 15,
    admissionDate: pastDate(1095), admissionSource: "আদালতের নির্দেশে",
    caseType: "Abuse", currentStatus: "Admitted",
    district: "জামালপুর", upazila: "মেলান্দহ", division: "ময়মনসিংহ",
    riskLevel: "High", workflowState: "Reviewed by PO",
    nextHearingDate: futureDate(2),
    caseWorkerName: "মিসেস শিরিন আক্তার",
    fatherName: "মোখলেসুর রহমান", motherName: "হনুফা বেগম",
  });

  // Transferred
  await insertChild({
    centerId: konabari.id, name: "তাসমিয়া ইসলাম", gender: "Female",
    dateOfBirth: dob(14, -3, 7), ageAtAdmission: 12,
    admissionDate: pastDate(600), admissionSource: "সমাজসেবা অধিদফতর",
    caseType: "Neglect", currentStatus: "Transferred",
    district: "গাজীপুর", upazila: "কোনাবাড়ি", division: "ঢাকা",
    riskLevel: "Low", workflowState: "Approved",
    caseWorkerName: "মিসেস শিরিন আক্তার",
    fatherName: "আব্বাস আলী", motherName: "সুলতানা রাজিয়া",
  });

  console.log("  Konabari: 8 children inserted.");

  /* ─── Fulerhat Boys CDC, Jashore ─────────────────────────────────────── */
  console.log("\n=== Seeding Fulerhat Boys CDC (Jashore) ===");

  await insertChild({
    centerId: fulerhat.id, name: "রাকিব হাসান", gender: "Male",
    dateOfBirth: dob(15, -1, 20), ageAtAdmission: 13,
    admissionDate: pastDate(730), admissionSource: "আদালতের নির্দেশে",
    caseType: "Juvenile Offence", currentStatus: "Admitted",
    district: "যশোর", upazila: "ফুলেরহাট", division: "খুলনা",
    riskLevel: "Medium", workflowState: "Submitted to DF",
    nextHearingDate: futureDate(6),
    caseWorkerName: "মোহাম্মদ বশির আহমেদ",
    fatherName: "আবুল হাসেম", motherName: "রোজিনা বেগম",
  });

  await insertChild({
    centerId: fulerhat.id, name: "আসিফ ইসলাম", gender: "Male",
    dateOfBirth: dob(16, 2, -10), ageAtAdmission: 14,
    admissionDate: pastDate(650), admissionSource: "পুলিশ হেফাজত থেকে",
    caseType: "Neglect", currentStatus: "Admitted",
    district: "সাতক্ষীরা", upazila: "শ্যামনগর", division: "খুলনা",
    riskLevel: "High", workflowState: "Reviewed by DF",
    nextHearingDate: futureDate(14),
    caseWorkerName: "মোহাম্মদ বশির আহমেদ",
    fatherName: "সাজেদুল ইসলাম", motherName: "সেলিনা বেগম",
  });

  await insertChild({
    centerId: fulerhat.id, name: "মামুন রহমান", gender: "Male",
    dateOfBirth: dob(13, 0, -20), ageAtAdmission: 11,
    admissionDate: pastDate(800), admissionSource: "সমাজসেবা অধিদফতর",
    caseType: "Abandoned", currentStatus: "Admitted",
    district: "খুলনা", upazila: "ডুমুরিয়া", division: "খুলনা",
    riskLevel: "Low", workflowState: "Approved",
    caseWorkerName: "মোহাম্মদ বশির আহমেদ",
    fatherName: "মোহাম্মদ ইউসুফ", motherName: "মাহফুজা বেগম",
  });

  await insertChild({
    centerId: fulerhat.id, name: "সোহেল রানা", gender: "Male",
    dateOfBirth: dob(14, -2, 15), ageAtAdmission: 12,
    admissionDate: pastDate(750), admissionSource: "আদালতের নির্দেশে",
    caseType: "Juvenile Offence", currentStatus: "Admitted",
    district: "নড়াইল", upazila: "লোহাগড়া", division: "খুলনা",
    riskLevel: "Medium", workflowState: "Draft",
    nextHearingDate: futureDate(24),
    caseWorkerName: "মোহাম্মদ বশির আহমেদ",
    fatherName: "মজনু মিয়া", motherName: "কহিনুর বেগম",
  });

  // Approaching 18 — 18 days left
  await insertChild({
    centerId: fulerhat.id, name: "সাজিদুল ইসলাম", gender: "Male",
    dateOfBirth: dob(18, 0, 18), ageAtAdmission: 15,
    admissionDate: pastDate(1095), admissionSource: "আদালতের নির্দেশে",
    caseType: "Juvenile Offence", currentStatus: "Admitted",
    district: "যশোর", upazila: "কেশবপুর", division: "খুলনা",
    riskLevel: "High", workflowState: "Reviewed by PO",
    nextHearingDate: futureDate(9),
    caseWorkerName: "মোহাম্মদ বশির আহমেদ",
    fatherName: "বাবুল ইসলাম", motherName: "তাহমিনা বেগম",
  });

  // Over 18 — 6 months over
  await insertChild({
    centerId: fulerhat.id, name: "কামরুল হাসান", gender: "Male",
    dateOfBirth: dob(18, 6), ageAtAdmission: 14,
    admissionDate: pastDate(1460), admissionSource: "আদালতের নির্দেশে",
    caseType: "Juvenile Offence", currentStatus: "Admitted",
    district: "যশোর", upazila: "বাঘারপাড়া", division: "খুলনা",
    riskLevel: "High", workflowState: "Approved",
    nextHearingDate: futureDate(1),
    caseWorkerName: "মোহাম্মদ বশির আহমেদ",
    fatherName: "কামাল হোসেন", motherName: "মেহেরুন নেসা",
  });

  // Released
  await insertChild({
    centerId: fulerhat.id, name: "ইব্রাহিম মোল্লা", gender: "Male",
    dateOfBirth: dob(16, 1, -5), ageAtAdmission: 13,
    admissionDate: pastDate(600), admissionSource: "সমাজসেবা অধিদফতর",
    caseType: "Neglect", currentStatus: "Released",
    district: "বাগেরহাট", upazila: "চিতলমারী", division: "খুলনা",
    riskLevel: "Low", workflowState: "Approved",
    caseWorkerName: "মোহাম্মদ বশির আহমেদ",
    fatherName: "আলী মোল্লা", motherName: "মমতাজ বেগম",
  });

  console.log("  Fulerhat: 7 children inserted.");

  const totalChildren = 10 + 8 + 7;
  console.log(`\n✓ Demo seed complete: ${totalChildren} children across 3 centers`);
  console.log("  Tongi: 10 (7 admitted, 2 approaching 18, 1 over 18, 1 released)");
  console.log("  Konabari: 8 (5 admitted, 1 approaching 18, 1 over 18, 1 transferred)");
  console.log("  Fulerhat: 7 (4 admitted, 1 approaching 18, 1 over 18, 1 released)");
  console.log("  Upcoming hearings: today+1, +2, +3, +4, +5, +6, +7, +9, +10, +12, +14, +18, +20, +22, +24, +25, +28");
}

seed().catch(console.error).finally(() => process.exit(0));
