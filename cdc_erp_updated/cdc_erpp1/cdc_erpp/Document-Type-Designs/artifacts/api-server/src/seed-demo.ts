// @ts-nocheck
/**
 * CDC ERP — Demo Data Seed
 * Clears all existing demo data and seeds fresh center-segregated records.
 * Run: pnpm --filter @workspace/api-server run seed-demo
 */
import { db } from "@workspace/db";
import {
  childrenTable, centersTable, casesTable, courtCasesTable,
  healthAssessmentsTable, counselingSessionsTable, guardianVisitsTable,
  policeAcquisitionsTable, educationPlansTable, releaseRecordsTable,
  followUpsTable, admissionsTable, riskAssessmentsTable,
  measurementSurveysTable, caseRiskAssessmentsTable,
  caseDetailAssessmentsTable, caseInterventionPlansTable,
  caseAgreementsTable, guardiansTable, familySocioeconomicRecordsTable,
} from "@workspace/db/schema";

/* ─── date helpers ────────────────────────────────────────────────────────── */
const BASE = new Date("2026-04-02");

function dob(yearsAgo: number, monthOffset = 0, dayOffset = 0): string {
  const d = new Date(BASE);
  d.setFullYear(d.getFullYear() - yearsAgo);
  d.setMonth(d.getMonth() + monthOffset);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split("T")[0];
}

function pastDate(daysAgo: number): string {
  const d = new Date(BASE);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function futureDate(daysAhead: number): string {
  const d = new Date(BASE);
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
}

let idx = 0;

/* ─── clear all demo tables (keep users / roles / centers / admin-units) ─── */
async function clearDemoData() {
  console.log("Clearing existing demo data...");
  await db.delete(caseAgreementsTable);
  await db.delete(caseInterventionPlansTable);
  await db.delete(caseDetailAssessmentsTable);
  await db.delete(caseRiskAssessmentsTable);
  await db.delete(measurementSurveysTable);
  await db.delete(familySocioeconomicRecordsTable);
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
  console.log("  Done.\n");
}

/* ─── Child definition ───────────────────────────────────────────────────── */
interface ChildDef {
  centerId: number;
  name: string;
  gender: "Boy" | "Female";
  dateOfBirth: string;
  ageAtAdmission: number;
  admissionDate: string;
  admissionSource: string;
  caseType: string;
  currentStatus: "Admitted" | "Released" | "Transferred";
  district: string;
  upazila: string;
  division: string;
  riskLevel: "High" | "Medium" | "Low";
  workflowState: "Draft" | "Submitted to DF" | "Reviewed by DF" | "Reviewed by PO" | "Approved";
  nextHearingDate?: string;
  caseWorker: string;
  fatherName: string;
  motherName: string;
  courtRef?: string;
}

/* ─── insert one child with all related records ───────────────────────────── */
async function insertChild(c: ChildDef) {
  const childNum = ++idx;
  const childId = `CHILD-2026-${String(childNum).padStart(5, "0")}`;

  // Child
  const [child] = await db.insert(childrenTable).values({
    childId,
    centerId: c.centerId,
    fullName: c.name,
    motherName: c.motherName,
    fatherName: c.fatherName,
    gender: c.gender,
    dateOfBirth: c.dateOfBirth,
    verifiedDob: c.dateOfBirth,
    ageAtAdmission: c.ageAtAdmission,
    religion: "Islam",
    nationality: "Bangladeshi",
    presentDivision: c.division,
    presentDistrict: c.district,
    presentUpazila: c.upazila,
    presentVillage: `${c.upazila} গ্রাম`,
    presentAddress: `${c.upazila}, ${c.district}`,
    permanentDivision: c.division,
    permanentDistrict: c.district,
    permanentUpazila: c.upazila,
    permanentVillage: `${c.upazila} গ্রাম`,
    permanentAddress: `গ্রাম: ${c.upazila}, থানা: ${c.district}`,
    admissionDate: c.admissionDate,
    arrivalDistrict: c.district,
    admissionSource: c.admissionSource,
    legalContext: c.caseType === "Juvenile Offence" ? "Child in Conflict with Law" : "Child in Contact with Law",
    judicialStatus: c.caseType === "Juvenile Offence" ? "Under Trial" : "Safe Custody",
    educationLevel: childNum % 3 === 0 ? "Class 8" : childNum % 2 === 0 ? "Class 5" : "Class 3",
    skills: childNum % 4 === 0 ? "Drawing, football" : "Basic literacy, handicrafts",
    futureGoal: childNum % 5 === 0 ? "Return to school and become self-reliant" : "Continue education and vocational development",
    childRisk: c.riskLevel,
    courtReferenceNo: c.courtRef ?? `CR-2026-${String(childNum).padStart(4, "0")}`,
    caseType: c.caseType,
    currentStatus: c.currentStatus,
  }).returning();

  // Case
  const [caseRec] = await db.insert(casesTable).values({
    caseId: `CASE-2026-${String(childNum).padStart(5, "0")}`,
    childId: child.id,
    centerId: c.centerId,
    caseOpeningDate: c.admissionDate,
    assignedCaseWorker: c.caseWorker,
    riskLevel: c.riskLevel,
    caseStatus: c.currentStatus === "Released" ? "Closed" : "Open",
    caseSummary: `শিশুটি ${c.admissionSource} থেকে কেন্দ্রে ভর্তি হয়েছে। প্রাথমিক মূল্যায়নে ${c.riskLevel === "High" ? "উচ্চ" : c.riskLevel === "Medium" ? "মাঝারি" : "কম"} ঝুঁকি চিহ্নিত।`,
    investigationNotes: "পারিবারিক পরিস্থিতি পর্যবেক্ষণে রাখা হয়েছে।",
    recommendation: c.workflowState === "Approved" ? "পরিবারে পুনর্মিলন বিবেচনা করুন।" : "নিয়মিত ফলো-আপ প্রয়োজন।",
    workflowState: c.workflowState,
    fatherName: c.fatherName,
    motherName: c.motherName,
    nationality: "Bangladeshi",
    religion: "Islam",
    currentAddressDivision: c.division,
    currentAddressDistrict: c.district,
    currentAddressUpazila: c.upazila,
  }).returning();

  // Court case
  await db.insert(courtCasesTable).values({
    courtCaseId: `CRT-2026-${String(childNum).padStart(5, "0")}`,
    childId: child.id,
    courtName: `যুগ্ম দায়রা জজ আদালত, ${c.district}`,
    policeStationName: `${c.upazila} থানা`,
    grNumber: `GR-${String(childNum).padStart(4, "0")}/2026`,
    caseNo: `CR-2026/${String(childNum).padStart(3, "0")}`,
    legalSection: c.caseType === "Juvenile Offence" ? "Penal Code 1860, Section 379" : "Children Act 2013, Section 17",
    legalAidType: childNum % 5 === 0 ? "ngo_support" : childNum % 3 === 0 ? "government_legal_aid" : "family_support",
    hearingDate: pastDate(60 + childNum * 2),
    lastHearingDate: pastDate(20 + childNum),
    lawyerName: "অ্যাডভোকেট মোহাম্মদ আলী",
    childCaseType: c.caseType,
    previousCaseInvolvement: childNum % 6 === 0,
    outcome: "পরবর্তী শুনানির তারিখ নির্ধারিত",
    nextHearingDate: c.nextHearingDate ?? null,
  });

  // Health assessment
  await db.insert(healthAssessmentsTable).values({
    assessmentId: `HEALTH-2026-${String(childNum).padStart(5, "0")}`,
    childId: child.id,
    assessmentDate: c.admissionDate,
    height: 140 + (childNum % 30),
    weight: 35 + (childNum % 20),
    bmi: 18.5 + (childNum % 4),
    physicalCondition: childNum % 6 === 0 ? "Critical" : childNum % 4 === 0 ? "Weak" : "Normal",
    mentalCondition: childNum % 5 === 0 ? "Anxious but responsive" : "Stable and cooperative",
    doctorName: "ডা. নুরুল ইসলাম",
    visibleInjury: childNum % 7 === 0,
    injuryDescription: childNum % 7 === 0 ? "বাম হাতে আঁচড়ের দাগ" : null,
    chronicDisease: childNum % 9 === 0 ? "Asthma" : null,
    congenitalDiseaseInfo: childNum % 11 === 0 ? "Congenital heart murmur under observation" : null,
    hasHereditaryDiseaseHistory: childNum % 10 === 0,
    hereditaryDiseaseDetails: childNum % 10 === 0 ? "Family history of diabetes" : null,
    hasDisability: childNum % 12 === 0,
    disability: childNum % 12 === 0 ? "Partial hearing impairment" : null,
    substanceAbuse: childNum % 13 === 0,
    gbvSurvivor: childNum % 8 === 0,
    ongoingMedication: childNum % 9 === 0 ? "Inhaler as prescribed" : null,
    immeditateTreatmentRequired: childNum % 8 === 0,
    hospitalReferralNeeded: childNum % 6 === 0,
    recommendation: childNum % 6 === 0
      ? "Urgent follow-up and hospital referral recommended."
      : "Continue routine medical observation and monthly review.",
  });

  // Admission record
  await db.insert(admissionsTable).values({
    admissionId: `ADM-2026-${String(childNum).padStart(5, "0")}`,
    childId: child.id,
    admissionDate: c.admissionDate,
    admissionSource: c.admissionSource,
    centerId: c.centerId,
    receivingOfficer: c.caseWorker,
    documentsVerified: true,
    approvalStatus: c.workflowState === "Approved" ? "Approved" : "Pending",
  });

  // Risk assessment
  await db.insert(riskAssessmentsTable).values({
    riskId: `RISK-2026-${String(childNum).padStart(5, "0")}`,
    childId: child.id,
    assessmentDate: c.admissionDate,
    assessedBy: c.caseWorker,
    abuseRisk: c.caseType === "Abuse" ? "High" : c.riskLevel,
    traffickingRisk: c.caseType === "Trafficking" ? "High" : "Low",
    reoffendingRisk: c.caseType === "Juvenile Offence" ? c.riskLevel : "Low",
    selfHarmRisk: c.riskLevel === "High" ? "Medium" : "Low",
    overallRiskLevel: c.riskLevel,
    immediateActionRequired: c.riskLevel === "High",
    protectionMeasures: c.riskLevel === "High"
      ? "নিবিড় পর্যবেক্ষণ ও মনোসামাজিক সহায়তা প্রদান করুন।"
      : "নিয়মিত ফলো-আপ এবং কাউন্সেলিং চালু রাখুন।",
    status: "Submitted",
  });

  // Counseling sessions (2 per child)
  for (let s = 0; s < 2; s++) {
    await db.insert(counselingSessionsTable).values({
      sessionId: `CS-2026-${String(childNum * 10 + s).padStart(5, "0")}`,
      childId: child.id,
      sessionDate: pastDate(30 - s * 15),
      counselorName: c.caseWorker,
      sessionType: s === 0 ? "Individual" : "Group",
      sessionNotes: s === 0
        ? "শিশুর মানসিক অবস্থা স্থিতিশীল। পরিবারের সাথে যোগাযোগ বজায় রাখা হচ্ছে।"
        : "গ্রুপ থেরাপিতে ইতিবাচক অংশগ্রহণ লক্ষ্য করা গেছে।",
      nextSessionDate: c.currentStatus === "Admitted" ? futureDate(15 + s * 15) : null,
    }).catch(() => null);
  }

  // Measurement survey
  await db.insert(measurementSurveysTable).values({
    surveyId: `SURV-2026-${String(childNum).padStart(5, "0")}`,
    centerId: c.centerId,
    childId: child.id,
    surveyDate: c.admissionDate,
    height: 140 + (childNum % 30),
    weight: 35 + (childNum % 20),
    bmi: 18.5 + (childNum % 4),
    surveyType: "Initial",
    conductedBy: c.caseWorker,
  }).catch(() => null);

  // Follow-up (correct schema fields: visitType, observation, nextAction)
  if (c.currentStatus === "Admitted") {
    await db.insert(followUpsTable).values({
      followUpId: `FU-2026-${String(childNum).padStart(5, "0")}`,
      childId: child.id,
      followUpDate: futureDate(15),
      visitType: "Routine",
      observation: "শিশু স্বাভাবিক আচরণ করছে। কেন্দ্রের কার্যক্রমে অংশ নিচ্ছে।",
      nextAction: "আগামী মাসে পুনরায় ফলো-আপ নিশ্চিত করতে হবে।",
    }).catch(() => null);
  }

  // Release record if released
  if (c.currentStatus === "Released") {
    await db.insert(releaseRecordsTable).values({
      releaseId: `REL-2026-${String(childNum).padStart(5, "0")}`,
      childId: child.id,
      releaseDate: pastDate(90),
      releaseType: "Family Reunion",
      releasedBy: c.caseWorker,
      guardianName: c.fatherName,
      guardianRelationship: "পিতা",
      remarks: "পরিবারের সাথে পুনর্মিলন সফলভাবে সম্পন্ন হয়েছে।",
      followUpRequired: true,
      followUpDate: pastDate(30),
    }).catch(() => null);
  }

  // Police requisition for children with upcoming court hearings
  if (c.nextHearingDate) {
    await db.insert(policeAcquisitionsTable).values({
      acquisitionId: `POLICE-2026-${String(childNum).padStart(5, "0")}`,
      childId: child.id,
      centerId: c.centerId,
      hearingDate: c.nextHearingDate,
      courtName: `যুগ্ম দায়রা জজ আদালত, ${c.district}`,
      caseNumber: `CR-2026/${String(childNum).padStart(3, "0")}`,
      policeStation: `${c.upazila} থানা`,
      officersRequired: 2,
      escortDepartureTime: "08:00",
      requisitionDate: pastDate(7),
      status: c.nextHearingDate <= futureDate(7) ? "Submitted" : "Draft",
      policeOfficerName: "ইন্সপেক্টর আবদুল মালেক",
      remarks: "শুনানির দিন সময়মতো উপস্থিত থাকতে হবে।",
    }).catch(() => null);
  }

  // Education & Skills - Admission Form
  await db.insert(educationPlansTable).values({
    planId: `EDU-AF-${String(childNum).padStart(5, "0")}`,
    childId: child.id,
    programType: "Admission Form",
    admissionEligibleFor: childNum % 2 === 0 ? "Grade 8" : "Grade 9",
    caseDetails: "Requires basic literacy and numeracy support.",
    recommenderCaseWorkerName: c.caseWorker,
    recordTitle: "Initial Admission Assessment",
    status: "Completed",
    startDate: c.admissionDate,
  }).catch(() => null);

  // Education & Skills - Education
  await db.insert(educationPlansTable).values({
    planId: `EDU-ED-${String(childNum).padStart(5, "0")}`,
    childId: child.id,
    programType: "Education",
    institutionName: "CDC Primary School",
    recordTitle: "Basic Education",
    status: "Ongoing",
    startDate: c.admissionDate,
    educationLevel: "Primary",
    boardOrCurriculum: "National Curriculum",
    learningGoals: "Improve reading and writing skills.",
    progressNotes: "Doing well in class.",
  }).catch(() => null);

  // Education & Skills - Vocational
  await db.insert(educationPlansTable).values({
    planId: `EDU-VC-${String(childNum).padStart(5, "0")}`,
    childId: child.id,
    programType: "Vocational",
    institutionName: "CDC Training Center",
    recordTitle: childNum % 2 === 0 ? "Tailoring Course" : "Computer Training",
    status: "Ongoing",
    startDate: c.admissionDate,
    tradeName: childNum % 2 === 0 ? "Tailoring" : "IT",
    certificationName: "Basic Certificate",
    weeklyHours: 15,
    progressNotes: "Learning basic skills quickly.",
  }).catch(() => null);

  // Education & Skills - Skills Assessment
  await db.insert(educationPlansTable).values({
    planId: `EDU-SA-${String(childNum).padStart(5, "0")}`,
    childId: child.id,
    programType: "Skills Assessment",
    recordTitle: "Initial Skills Assessment",
    status: "Completed",
    startDate: c.admissionDate, // required field
    assessmentDate: c.admissionDate,
    assessorName: c.caseWorker,
    literacyLevel: "Basic",
    numeracyLevel: "Basic",
    digitalLiteracyLevel: "Emerging",
    interestAreas: "Drawing, Sports",
    strengths: "Quick learner",
    supportNeeds: "Individual attention",
    recommendations: "Continue current plan.",
  }).catch(() => null);

  // Family & Socioeconomic Record
  await db.insert(familySocioeconomicRecordsTable).values({
    recordId: `FS-2026-${String(childNum).padStart(5, "0")}`,
    childId: child.id,
    parentsEducation: childNum % 2 === 0 ? "Primary Education" : "Secondary Education",
    parentsOccupation: childNum % 3 === 0 ? "Farmer" : "Day Laborer",
    parentsMonthlyIncome: 10000 + (childNum * 500),
    socioeconomicStatus: childNum % 4 === 0 ? "Lower Middle Class" : "Low Income",
    parentsContactNumber: `01711-${String(childNum).padStart(6, "0")}`,
    childRelationshipWithParents: "Good",
    siblingsCountAndOrder: `2 siblings, ${childNum % 3 === 0 ? "1st" : "2nd"} child`,
    isMarried: false,
    childrenCount: 0,
    familyType: childNum % 2 === 0 ? "Nuclear" : "Joint",
    parentsMaritalStatus: "Married",
    guardianType: "Parents",
    isOrphan: false,
    familyMemberSubstanceAbuse: childNum % 10 === 0,
    familyCriminalInvolvement: childNum % 8 === 0,
    peerCircleInfo: "Plays football with neighborhood kids",
  }).catch(() => null);

  return { child, case: caseRec };
}

/* ─── insert guardian + visits ───────────────────────────────────────────── */
async function insertGuardianWithVisits(
  guardianData: {
    name: string; relationship: string; nid: string;
    phone: string; address: string;
  },
  childIds: number[],
) {
  const guardianNum = ++idx;
  const [guardian] = await db.insert(guardiansTable).values({
    guardianId: `GUARD-2026-${String(guardianNum).padStart(5, "0")}`,
    guardianName: guardianData.name,
    relationship: guardianData.relationship,
    nidNo: guardianData.nid,
    contactNumber: guardianData.phone,
    address: guardianData.address,
  }).returning();

  // 2 visits per child
  for (const childId of childIds) {
    for (let v = 0; v < 2; v++) {
      const visitNum = ++idx;
      await db.insert(guardianVisitsTable).values({
        visitId: `VISIT-2026-${String(visitNum).padStart(5, "0")}`,
        childId,
        guardianId: guardian.id,
        visitDate: pastDate(90 - v * 45),
        purposeOfVisit: v === 0
          ? "প্রথম সাক্ষাৎ — শিশুর সার্বিক অবস্থা পর্যবেক্ষণ"
          : "নিয়মিত সাক্ষাৎ ও পরিবারের সাথে মিলনের পরিকল্পনা",
        observations: v === 0
          ? "অভিভাবক শিশুর সাথে দেখা করে সন্তুষ্ট হয়েছেন। কেন্দ্রের পরিবেশ ভালো মনে হয়েছে।"
          : "শিশু পরিবারের সাথে দেখা করে আনন্দিত। পুনর্মিলনের জন্য আবেদন করা হয়েছে।",
      }).catch(() => null);
    }
  }

  return guardian;
}

/* ─── main seed ───────────────────────────────────────────────────────────── */
async function seed() {
  await clearDemoData();

  const allCenters = await db.select().from(centersTable);
  const tongi    = allCenters.find(c => c.location === "Tongi");
  const konabari = allCenters.find(c => c.location === "Konabari");
  const fulerhat = allCenters.find(c => c.location === "Jashore");

  if (!tongi || !konabari || !fulerhat) {
    console.error("Centers not found. Run seed-auth first.\nFound centers:", allCenters.map(c => c.location));
    process.exit(1);
  }

  /* ──────────────────────────────────────────────────────────────────────
     TONGI — CDC Boys (10 children)
  ────────────────────────────────────────────────────────────────────── */
  console.log("=== Seeding Tongi Boys CDC ===");

  const tongiChildren = [];

  tongiChildren.push(await insertChild({
    centerId: tongi.id, name: "মোহাম্মদ রাফি হাসান", gender: "Boy",
    dateOfBirth: dob(14, 0, -15), ageAtAdmission: 12,
    admissionDate: pastDate(730), admissionSource: "আদালতের নির্দেশে",
    caseType: "Juvenile Offence", currentStatus: "Admitted",
    district: "গাজীপুর", upazila: "টঙ্গি", division: "ঢাকা",
    riskLevel: "Medium", workflowState: "Reviewed by PO",
    nextHearingDate: futureDate(5),
    caseWorker: "সজল কুমার দাস",
    fatherName: "মোহাম্মদ করিম হাসান", motherName: "নাজমা বেগম",
  }));

  tongiChildren.push(await insertChild({
    centerId: tongi.id, name: "আরিফুল ইসলাম", gender: "Boy",
    dateOfBirth: dob(15, -2, 10), ageAtAdmission: 13,
    admissionDate: pastDate(600), admissionSource: "পুলিশ হেফাজত থেকে",
    caseType: "Neglect", currentStatus: "Admitted",
    district: "নারায়ণগঞ্জ", upazila: "রূপগঞ্জ", division: "ঢাকা",
    riskLevel: "High", workflowState: "Reviewed by DF",
    nextHearingDate: futureDate(12),
    caseWorker: "সজল কুমার দাস",
    fatherName: "আবদুল করিম", motherName: "রহিমা বেগম",
  }));

  tongiChildren.push(await insertChild({
    centerId: tongi.id, name: "সাইফুল রহমান", gender: "Boy",
    dateOfBirth: dob(13, 1, -5), ageAtAdmission: 11,
    admissionDate: pastDate(800), admissionSource: "আদালতের নির্দেশে",
    caseType: "Abuse", currentStatus: "Admitted",
    district: "গাজীপুর", upazila: "কালীগঞ্জ", division: "ঢাকা",
    riskLevel: "High", workflowState: "Submitted to DF",
    nextHearingDate: futureDate(28),
    caseWorker: "সজল কুমার দাস",
    fatherName: "রফিকুল রহমান", motherName: "হাসিনা বেগম",
  }));

  tongiChildren.push(await insertChild({
    centerId: tongi.id, name: "জুনায়েদ আহমেদ", gender: "Boy",
    dateOfBirth: dob(16, -3, 8), ageAtAdmission: 14,
    admissionDate: pastDate(730), admissionSource: "সমাজসেবা অধিদফতর",
    caseType: "Abandoned", currentStatus: "Admitted",
    district: "ঢাকা", upazila: "দেমড়া", division: "ঢাকা",
    riskLevel: "Low", workflowState: "Approved",
    nextHearingDate: futureDate(22),
    caseWorker: "সজল কুমার দাস",
    fatherName: "মোহাম্মদ ইকবাল আহমেদ", motherName: "সুফিয়া আহমেদ",
  }));

  tongiChildren.push(await insertChild({
    centerId: tongi.id, name: "রিদওয়ান হোসেন", gender: "Boy",
    dateOfBirth: dob(12, 2, -10), ageAtAdmission: 10,
    admissionDate: pastDate(650), admissionSource: "আদালতের নির্দেশে",
    caseType: "Juvenile Offence", currentStatus: "Admitted",
    district: "গাজীপুর", upazila: "শ্রীপুর", division: "ঢাকা",
    riskLevel: "Medium", workflowState: "Draft",
    caseWorker: "সজল কুমার দাস",
    fatherName: "আলী হোসেন", motherName: "মরিয়ম হোসেন",
  }));

  tongiChildren.push(await insertChild({
    centerId: tongi.id, name: "তামিম খান", gender: "Boy",
    dateOfBirth: dob(15, -1, 3), ageAtAdmission: 13,
    admissionDate: pastDate(500), admissionSource: "পুলিশ হেফাজত থেকে",
    caseType: "Neglect", currentStatus: "Admitted",
    district: "কিশোরগঞ্জ", upazila: "ভৈরব", division: "ঢাকা",
    riskLevel: "Medium", workflowState: "Submitted to DF",
    nextHearingDate: futureDate(7),
    caseWorker: "সজল কুমার দাস",
    fatherName: "মাহমুদুল খান", motherName: "পারভিন বেগম",
  }));

  // Approaching 18 — 60 days left
  tongiChildren.push(await insertChild({
    centerId: tongi.id, name: "নাফিউজ্জামান", gender: "Boy",
    dateOfBirth: dob(18, 0, 60), ageAtAdmission: 15,
    admissionDate: pastDate(1000), admissionSource: "আদালতের নির্দেশে",
    caseType: "Juvenile Offence", currentStatus: "Admitted",
    district: "গাজীপুর", upazila: "টঙ্গি", division: "ঢাকা",
    riskLevel: "Medium", workflowState: "Approved",
    nextHearingDate: futureDate(25),
    caseWorker: "সজল কুমার দাস",
    fatherName: "নুরুজ্জামান", motherName: "আমেনা বেগম",
  }));

  // Approaching 18 — 25 days left
  tongiChildren.push(await insertChild({
    centerId: tongi.id, name: "শফিউল আলম", gender: "Boy",
    dateOfBirth: dob(18, 0, 25), ageAtAdmission: 15,
    admissionDate: pastDate(1100), admissionSource: "সমাজসেবা অধিদফতর",
    caseType: "Abuse", currentStatus: "Admitted",
    district: "মানিকগঞ্জ", upazila: "সিংগাইর", division: "ঢাকা",
    riskLevel: "High", workflowState: "Reviewed by PO",
    caseWorker: "সজল কুমার দাস",
    fatherName: "শামসুল আলম", motherName: "রুকাইয়া খাতুন",
  }));

  // Over 18 — 3 months over
  tongiChildren.push(await insertChild({
    centerId: tongi.id, name: "হাবিবুর রহমান", gender: "Boy",
    dateOfBirth: dob(18, 3), ageAtAdmission: 15,
    admissionDate: pastDate(1095), admissionSource: "আদালতের নির্দেশে",
    caseType: "Juvenile Offence", currentStatus: "Admitted",
    district: "গাজীপুর", upazila: "টঙ্গি", division: "ঢাকা",
    riskLevel: "High", workflowState: "Reviewed by PO",
    nextHearingDate: futureDate(3),
    caseWorker: "সজল কুমার দাস",
    fatherName: "হারুনুর রশিদ", motherName: "জরিনা বেগম",
  }));

  // Released
  tongiChildren.push(await insertChild({
    centerId: tongi.id, name: "ইমরান হাসান", gender: "Boy",
    dateOfBirth: dob(17, -4), ageAtAdmission: 14,
    admissionDate: pastDate(500), admissionSource: "আদালতের নির্দেশে",
    caseType: "Neglect", currentStatus: "Released",
    district: "ঢাকা", upazila: "গুলশান", division: "ঢাকা",
    riskLevel: "Low", workflowState: "Approved",
    caseWorker: "সজল কুমার দাস",
    fatherName: "মোস্তফা হাসান", motherName: "নার্গিস বেগম",
  }));

  // Guardians for Tongi (3 guardians, each paired with 2 children)
  const tongiIds = tongiChildren.map(r => r.child.id);
  await insertGuardianWithVisits(
    { name: "মোহাম্মদ করিম হাসান", relationship: "পিতা", nid: "19851234567890", phone: "01711-123456", address: "টঙ্গি, গাজীপুর" },
    [tongiIds[0], tongiIds[1]]
  );
  await insertGuardianWithVisits(
    { name: "রফিকুল রহমান", relationship: "পিতা", nid: "19781234567891", phone: "01811-234567", address: "কালীগঞ্জ, গাজীপুর" },
    [tongiIds[2], tongiIds[3]]
  );
  await insertGuardianWithVisits(
    { name: "মাহমুদুল খান", relationship: "পিতা", nid: "19901234567892", phone: "01911-345678", address: "ভৈরব, কিশোরগঞ্জ" },
    [tongiIds[4], tongiIds[5]]
  );

  console.log("  Tongi: 10 children, 3 guardians, 12 visits seeded.\n");

  /* ──────────────────────────────────────────────────────────────────────
     KONABARI — CDC Girls (8 children)
  ────────────────────────────────────────────────────────────────────── */
  console.log("=== Seeding Konabari Girls CDC ===");

  const konabariChildren = [];

  konabariChildren.push(await insertChild({
    centerId: konabari.id, name: "ফারিয়া বেগম", gender: "Girl",
    dateOfBirth: dob(14, 1, -8), ageAtAdmission: 12,
    admissionDate: pastDate(730), admissionSource: "আদালতের নির্দেশে",
    caseType: "Abuse", currentStatus: "Admitted",
    district: "গাজীপুর", upazila: "কোনাবাড়ি", division: "ঢাকা",
    riskLevel: "High", workflowState: "Submitted to DF",
    nextHearingDate: futureDate(4),
    caseWorker: "মিসেস শিরিন আক্তার",
    fatherName: "আলমগীর হোসেন", motherName: "মোসাম্মৎ নার্গিস",
  }));

  konabariChildren.push(await insertChild({
    centerId: konabari.id, name: "নাজমা খাতুন", gender: "Girl",
    dateOfBirth: dob(13, -2, 5), ageAtAdmission: 11,
    admissionDate: pastDate(600), admissionSource: "সমাজসেবা অধিদফতর",
    caseType: "Neglect", currentStatus: "Admitted",
    district: "ময়মনসিংহ", upazila: "ত্রিশাল", division: "ময়মনসিংহ",
    riskLevel: "Medium", workflowState: "Draft",
    nextHearingDate: futureDate(18),
    caseWorker: "মিসেস শিরিন আক্তার",
    fatherName: "জাহাঙ্গীর আলম", motherName: "বেগম রোকেয়া",
  }));

  konabariChildren.push(await insertChild({
    centerId: konabari.id, name: "সাবিনা ইয়াসমিন", gender: "Girl",
    dateOfBirth: dob(15, -1, 12), ageAtAdmission: 13,
    admissionDate: pastDate(730), admissionSource: "পুলিশ হেফাজত থেকে",
    caseType: "Trafficking", currentStatus: "Admitted",
    district: "শেরপুর", upazila: "নালিতাবাড়ী", division: "ময়মনসিংহ",
    riskLevel: "High", workflowState: "Reviewed by DF",
    nextHearingDate: futureDate(10),
    caseWorker: "মিসেস শিরিন আক্তার",
    fatherName: "আব্দুল লতিফ", motherName: "হাসনা হেনা",
  }));

  konabariChildren.push(await insertChild({
    centerId: konabari.id, name: "রেহানা পারভিন", gender: "Girl",
    dateOfBirth: dob(16, 2, -3), ageAtAdmission: 14,
    admissionDate: pastDate(800), admissionSource: "আদালতের নির্দেশে",
    caseType: "Abandoned", currentStatus: "Admitted",
    district: "নেত্রকোণা", upazila: "কেন্দুয়া", division: "ময়মনসিংহ",
    riskLevel: "Low", workflowState: "Approved",
    caseWorker: "মিসেস শিরিন আক্তার",
    fatherName: "মতিউর রহমান", motherName: "রোকসানা বেগম",
  }));

  konabariChildren.push(await insertChild({
    centerId: konabari.id, name: "আয়েশা সিদ্দিকা", gender: "Girl",
    dateOfBirth: dob(12, 0, 18), ageAtAdmission: 10,
    admissionDate: pastDate(750), admissionSource: "সমাজসেবা অধিদফতর",
    caseType: "Abuse", currentStatus: "Admitted",
    district: "গাজীপুর", upazila: "কালিয়াকৈর", division: "ঢাকা",
    riskLevel: "Medium", workflowState: "Reviewed by PO",
    nextHearingDate: futureDate(20),
    caseWorker: "মিসেস শিরিন আক্তার",
    fatherName: "আবুল কাসেম", motherName: "জাহানারা বেগম",
  }));

  // Approaching 18 — 45 days left
  konabariChildren.push(await insertChild({
    centerId: konabari.id, name: "সুমাইয়া আক্তার", gender: "Girl",
    dateOfBirth: dob(18, 0, 45), ageAtAdmission: 14,
    admissionDate: pastDate(1100), admissionSource: "পুলিশ হেফাজত থেকে",
    caseType: "Trafficking", currentStatus: "Admitted",
    district: "কুড়িগ্রাম", upazila: "ভুরুঙ্গামারী", division: "রংপুর",
    riskLevel: "High", workflowState: "Reviewed by DF",
    nextHearingDate: futureDate(15),
    caseWorker: "মিসেস শিরিন আক্তার",
    fatherName: "সিরাজুল ইসলাম", motherName: "আক্লিমা বেগম",
  }));

  // Over 18 — 1 month over
  konabariChildren.push(await insertChild({
    centerId: konabari.id, name: "মারিয়াম বেগম", gender: "Girl",
    dateOfBirth: dob(18, 1, 5), ageAtAdmission: 15,
    admissionDate: pastDate(1095), admissionSource: "আদালতের নির্দেশে",
    caseType: "Abuse", currentStatus: "Admitted",
    district: "জামালপুর", upazila: "মেলান্দহ", division: "ময়মনসিংহ",
    riskLevel: "High", workflowState: "Reviewed by PO",
    nextHearingDate: futureDate(2),
    caseWorker: "মিসেস শিরিন আক্তার",
    fatherName: "মোখলেসুর রহমান", motherName: "হনুফা বেগম",
  }));

  // Transferred
  konabariChildren.push(await insertChild({
    centerId: konabari.id, name: "তাসমিয়া ইসলাম", gender: "Girl",
    dateOfBirth: dob(14, -3, 7), ageAtAdmission: 12,
    admissionDate: pastDate(600), admissionSource: "সমাজসেবা অধিদফতর",
    caseType: "Neglect", currentStatus: "Transferred",
    district: "গাজীপুর", upazila: "কোনাবাড়ি", division: "ঢাকা",
    riskLevel: "Low", workflowState: "Approved",
    caseWorker: "মিসেস শিরিন আক্তার",
    fatherName: "আব্বাস আলী", motherName: "সুলতানা রাজিয়া",
  }));

  // Guardians for Konabari
  const konabariIds = konabariChildren.map(r => r.child.id);
  await insertGuardianWithVisits(
    { name: "আলমগীর হোসেন", relationship: "পিতা", nid: "19801234567893", phone: "01611-456789", address: "কোনাবাড়ি, গাজীপুর" },
    [konabariIds[0], konabariIds[1]]
  );
  await insertGuardianWithVisits(
    { name: "আব্দুল লতিফ", relationship: "পিতা", nid: "19821234567894", phone: "01511-567890", address: "নালিতাবাড়ী, শেরপুর" },
    [konabariIds[2], konabariIds[3]]
  );
  await insertGuardianWithVisits(
    { name: "সিরাজুল ইসলাম", relationship: "পিতা", nid: "19761234567895", phone: "01311-678901", address: "ভুরুঙ্গামারী, কুড়িগ্রাম" },
    [konabariIds[4], konabariIds[5]]
  );

  console.log("  Konabari: 8 children, 3 guardians, 12 visits seeded.\n");

  /* ──────────────────────────────────────────────────────────────────────
     FULERHAT — CDC Boys Jashore (7 children)
  ────────────────────────────────────────────────────────────────────── */
  console.log("=== Seeding Fulerhat Boys CDC (Jashore) ===");

  const fulerhatChildren = [];

  fulerhatChildren.push(await insertChild({
    centerId: fulerhat.id, name: "রাকিব হাসান", gender: "Boy",
    dateOfBirth: dob(15, -1, 20), ageAtAdmission: 13,
    admissionDate: pastDate(730), admissionSource: "আদালতের নির্দেশে",
    caseType: "Juvenile Offence", currentStatus: "Admitted",
    district: "যশোর", upazila: "ফুলেরহাট", division: "খুলনা",
    riskLevel: "Medium", workflowState: "Submitted to DF",
    nextHearingDate: futureDate(6),
    caseWorker: "মোহাম্মদ বশির আহমেদ",
    fatherName: "আবুল হাসেম", motherName: "রোজিনা বেগম",
  }));

  fulerhatChildren.push(await insertChild({
    centerId: fulerhat.id, name: "আসিফ ইসলাম", gender: "Boy",
    dateOfBirth: dob(16, 2, -10), ageAtAdmission: 14,
    admissionDate: pastDate(650), admissionSource: "পুলিশ হেফাজত থেকে",
    caseType: "Neglect", currentStatus: "Admitted",
    district: "সাতক্ষীরা", upazila: "শ্যামনগর", division: "খুলনা",
    riskLevel: "High", workflowState: "Reviewed by DF",
    nextHearingDate: futureDate(14),
    caseWorker: "মোহাম্মদ বশির আহমেদ",
    fatherName: "সাজেদুল ইসলাম", motherName: "সেলিনা বেগম",
  }));

  fulerhatChildren.push(await insertChild({
    centerId: fulerhat.id, name: "মামুন রহমান", gender: "Boy",
    dateOfBirth: dob(13, 0, -20), ageAtAdmission: 11,
    admissionDate: pastDate(800), admissionSource: "সমাজসেবা অধিদফতর",
    caseType: "Abandoned", currentStatus: "Admitted",
    district: "খুলনা", upazila: "ডুমুরিয়া", division: "খুলনা",
    riskLevel: "Low", workflowState: "Approved",
    caseWorker: "মোহাম্মদ বশির আহমেদ",
    fatherName: "মোহাম্মদ ইউসুফ", motherName: "মাহফুজা বেগম",
  }));

  fulerhatChildren.push(await insertChild({
    centerId: fulerhat.id, name: "সোহেল রানা", gender: "Boy",
    dateOfBirth: dob(14, -2, 15), ageAtAdmission: 12,
    admissionDate: pastDate(750), admissionSource: "আদালতের নির্দেশে",
    caseType: "Juvenile Offence", currentStatus: "Admitted",
    district: "নড়াইল", upazila: "লোহাগড়া", division: "খুলনা",
    riskLevel: "Medium", workflowState: "Draft",
    nextHearingDate: futureDate(24),
    caseWorker: "মোহাম্মদ বশির আহমেদ",
    fatherName: "মজনু মিয়া", motherName: "কহিনুর বেগম",
  }));

  // Approaching 18 — 18 days left
  fulerhatChildren.push(await insertChild({
    centerId: fulerhat.id, name: "সাজিদুল ইসলাম", gender: "Boy",
    dateOfBirth: dob(18, 0, 18), ageAtAdmission: 15,
    admissionDate: pastDate(1095), admissionSource: "আদালতের নির্দেশে",
    caseType: "Juvenile Offence", currentStatus: "Admitted",
    district: "যশোর", upazila: "কেশবপুর", division: "খুলনা",
    riskLevel: "High", workflowState: "Reviewed by PO",
    nextHearingDate: futureDate(9),
    caseWorker: "মোহাম্মদ বশির আহমেদ",
    fatherName: "বাবুল ইসলাম", motherName: "তাহমিনা বেগম",
  }));

  // Over 18 — 6 months over
  fulerhatChildren.push(await insertChild({
    centerId: fulerhat.id, name: "কামরুল হাসান", gender: "Boy",
    dateOfBirth: dob(18, 6), ageAtAdmission: 14,
    admissionDate: pastDate(1460), admissionSource: "আদালতের নির্দেশে",
    caseType: "Juvenile Offence", currentStatus: "Admitted",
    district: "যশোর", upazila: "বাঘারপাড়া", division: "খুলনা",
    riskLevel: "High", workflowState: "Approved",
    nextHearingDate: futureDate(1),
    caseWorker: "মোহাম্মদ বশির আহমেদ",
    fatherName: "কামাল হোসেন", motherName: "মেহেরুন নেসা",
  }));

  // Released
  fulerhatChildren.push(await insertChild({
    centerId: fulerhat.id, name: "ইব্রাহিম মোল্লা", gender: "Boy",
    dateOfBirth: dob(16, 1, -5), ageAtAdmission: 13,
    admissionDate: pastDate(600), admissionSource: "সমাজসেবা অধিদফতর",
    caseType: "Neglect", currentStatus: "Released",
    district: "বাগেরহাট", upazila: "চিতলমারী", division: "খুলনা",
    riskLevel: "Low", workflowState: "Approved",
    caseWorker: "মোহাম্মদ বশির আহমেদ",
    fatherName: "আলী মোল্লা", motherName: "মমতাজ বেগম",
  }));

  // Guardians for Fulerhat
  const fulerhatIds = fulerhatChildren.map(r => r.child.id);
  await insertGuardianWithVisits(
    { name: "আবুল হাসেম", relationship: "পিতা", nid: "19791234567896", phone: "01711-789012", address: "ফুলেরহাট, যশোর" },
    [fulerhatIds[0], fulerhatIds[1]]
  );
  await insertGuardianWithVisits(
    { name: "মোহাম্মদ ইউসুফ", relationship: "পিতা", nid: "19831234567897", phone: "01811-890123", address: "ডুমুরিয়া, খুলনা" },
    [fulerhatIds[2], fulerhatIds[3]]
  );
  await insertGuardianWithVisits(
    { name: "বাবুল ইসলাম", relationship: "পিতা", nid: "19861234567898", phone: "01911-901234", address: "কেশবপুর, যশোর" },
    [fulerhatIds[4]]
  );

  console.log("  Fulerhat: 7 children, 3 guardians, 10 visits seeded.\n");

  console.log("=".repeat(60));
  console.log("Demo seed complete!");
  console.log("  Children  : 25 total — Tongi: 10, Konabari: 8, Fulerhat: 7");
  console.log("  Guardians : 9 (3 per center) with 2 visits per child link");
  console.log("  Per child : case + court case + health + risk assessment");
  console.log("              + 2 counseling sessions + measurement survey");
  console.log("              + admission + follow-up + police requisition");
  console.log("=".repeat(60));
}

seed().catch(console.error).finally(() => process.exit(0));
