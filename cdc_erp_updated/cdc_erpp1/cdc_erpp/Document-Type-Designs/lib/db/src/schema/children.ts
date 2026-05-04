import { pgTable, text, serial, timestamp, integer, date, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { centersTable } from "./centers";

export const childGenderEnum = pgEnum("child_gender", ["Boy", "Girl", "Others"]);

export const childrenTable = pgTable("children", {
  id: serial("id").primaryKey(),
  childId: text("child_id").notNull().unique(),
  centerId: integer("center_id").references(() => centersTable.id),
  fullName: text("full_name").notNull(),
  motherName: text("mother_name"),
  fatherName: text("father_name"),
  gender: childGenderEnum("gender"),
  dateOfBirth: date("date_of_birth"),
  ageAtAdmission: integer("age_at_admission"),
  verifiedAge: integer("verified_age"),
  verifiedAgeDate: date("verified_age_date"),
  verifiedDob: date("verified_dob"),
  birthRegistrationNo: text("birth_registration_no"),
  birthCertificateFileName: text("birth_certificate_file_name"),
  birthCertificateFileDataUrl: text("birth_certificate_file_data_url"),
  profileImageFileName: text("profile_image_file_name"),
  profileImageDataUrl: text("profile_image_data_url"),
  religion: text("religion"),
  nationality: text("nationality"),
  presentDivision: text("present_division"),
  presentDistrict: text("present_district"),
  presentUpazila: text("present_upazila"),
  presentVillage: text("present_village"),
  presentAddress: text("present_address"),
  permanentDivision: text("permanent_division"),
  permanentDistrict: text("permanent_district"),
  permanentUpazila: text("permanent_upazila"),
  permanentVillage: text("permanent_village"),
  permanentAddress: text("permanent_address"),
  admissionDate: date("admission_date").notNull(),
  arrivalDistrict: text("arrival_district"),
  admissionSource: text("admission_source").notNull(),
  legalContext: text("legal_context"),
  judicialStatus: text("judicial_status"),
  educationLevel: text("education_level"),
  skills: text("skills"),
  futureGoal: text("future_goal"),
  childRisk: text("child_risk"),
  parentsEducation: text("parents_education"),
  parentsOccupation: text("parents_occupation"),
  parentsMonthlyIncome: integer("parents_monthly_income"),
  socioeconomicStatus: text("socioeconomic_status"),
  parentsContactNumber: text("parents_contact_number"),
  childRelationshipWithParents: text("child_relationship_with_parents"),
  siblingsCountAndOrder: text("siblings_count_and_order"),
  isMarried: boolean("is_married").notNull().default(false),
  childrenCount: integer("children_count"),
  familyType: text("family_type"),
  parentsMaritalStatus: text("parents_marital_status"),
  guardianType: text("guardian_type"),
  isOrphan: boolean("is_orphan").notNull().default(false),
  familyMemberSubstanceAbuse: boolean("family_member_substance_abuse").notNull().default(false),
  familyCriminalInvolvement: boolean("family_criminal_involvement").notNull().default(false),
  peerCircleInfo: text("peer_circle_info"),
  basicNeedsFulfilled: boolean("basic_needs_fulfilled").notNull().default(false),
  basicNeedsNote: text("basic_needs_note"),
  safetyEnsured: boolean("safety_ensured").notNull().default(false),
  safetyEnsuredNote: text("safety_ensured_note"),
  initialHealthCheckCompleted: boolean("initial_health_check_completed").notNull().default(false),
  initialHealthCheckNote: text("initial_health_check_note"),
  courtReferenceNo: text("court_reference_no"),
  caseType: text("case_type"),
  currentStatus: text("current_status").notNull().default("Admitted"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertChildSchema = createInsertSchema(childrenTable).omit({ id: true, childId: true, createdAt: true, updatedAt: true });
export type InsertChild = z.infer<typeof insertChildSchema>;
export type Child = typeof childrenTable.$inferSelect;

let childCounter = 1;
export function generateChildId(year: number): string {
  return `CHILD-${year}-${String(childCounter++).padStart(5, "0")}`;
}
