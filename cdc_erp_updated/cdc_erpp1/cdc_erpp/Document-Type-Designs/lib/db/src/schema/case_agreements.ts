import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { casesTable } from "./cases";

export const caseAgreementsTable = pgTable("case_agreements", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull().references(() => casesTable.id),
  registrationNo: text("registration_no"),
  childNameAtAgreement: text("child_name_at_agreement"),
  fatherNameAtAgreement: text("father_name_at_agreement"),
  motherNameAtAgreement: text("mother_name_at_agreement"),
  ageAtAgreement: integer("age_at_agreement"),
  genderAtAgreement: text("gender_at_agreement"),
  religionAtAgreement: text("religion_at_agreement"),
  currentAddressAtAgreement: text("current_address_at_agreement"),
  permanentAddressAtAgreement: text("permanent_address_at_agreement"),
  guardianInfo: text("guardian_info"),
  witnessNames: text("witness_names"),
  agreementDate: date("agreement_date"),
  socialWorkerSignature: text("social_worker_signature"),
  officerSignature: text("officer_signature"),
  guardianSignature: text("guardian_signature"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCaseAgreementSchema = createInsertSchema(caseAgreementsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCaseAgreement = z.infer<typeof insertCaseAgreementSchema>;
export type CaseAgreement = typeof caseAgreementsTable.$inferSelect;
