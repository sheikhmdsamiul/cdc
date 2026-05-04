import { pgTable, text, serial, timestamp, integer, date, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { childrenTable } from "./children";

export const healthAssessmentsTable = pgTable("health_assessments", {
  id: serial("id").primaryKey(),
  assessmentId: text("assessment_id").notNull().unique(),
  childId: integer("child_id").notNull().references(() => childrenTable.id),
  assessmentDate: date("assessment_date").notNull(),
  height: real("height"),
  weight: real("weight"),
  bmi: real("bmi"),
  physicalCondition: text("physical_condition"),
  mentalCondition: text("mental_condition"),
  doctorName: text("doctor_name"),
  visibleInjury: boolean("visible_injury").default(false),
  injuryDescription: text("injury_description"),
  chronicDisease: text("chronic_disease"),
  congenitalDiseaseInfo: text("congenital_disease_info"),
  hasHereditaryDiseaseHistory: boolean("has_hereditary_disease_history").default(false),
  hereditaryDiseaseDetails: text("hereditary_disease_details"),
  hasDisability: boolean("has_disability").default(false),
  disability: text("disability"),
  substanceAbuse: boolean("substance_abuse").default(false),
  gbvSurvivor: boolean("gbv_survivor").default(false),
  ongoingMedication: text("ongoing_medication"),
  immeditateTreatmentRequired: boolean("immidiate_treatment_required").default(false),
  hospitalReferralNeeded: boolean("hospital_referral_needed").default(false),
  recommendation: text("recommendation"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertHealthAssessmentSchema = createInsertSchema(healthAssessmentsTable).omit({ id: true, assessmentId: true, createdAt: true, updatedAt: true });
export type InsertHealthAssessment = z.infer<typeof insertHealthAssessmentSchema>;
export type HealthAssessment = typeof healthAssessmentsTable.$inferSelect;
