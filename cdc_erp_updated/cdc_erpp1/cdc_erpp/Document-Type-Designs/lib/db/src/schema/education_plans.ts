import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { childrenTable } from "./children";

export const educationPlansTable = pgTable("education_plans", {
  id: serial("id").primaryKey(),
  planId: text("plan_id").notNull().unique(),
  childId: integer("child_id").notNull().references(() => childrenTable.id),
  programType: text("program_type").notNull(),
  admissionEligibleFor: text("admission_eligible_for"),
  caseDetails: text("case_details"),
  recommenderCaseWorkerName: text("recommender_case_worker_name"),
  recordTitle: text("record_title"),
  status: text("status"),
  institutionName: text("institution_name"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  educationLevel: text("education_level"),
  boardOrCurriculum: text("board_or_curriculum"),
  learningGoals: text("learning_goals"),
  tradeName: text("trade_name"),
  certificationName: text("certification_name"),
  weeklyHours: integer("weekly_hours"),
  assessmentDate: date("assessment_date"),
  assessorName: text("assessor_name"),
  literacyLevel: text("literacy_level"),
  numeracyLevel: text("numeracy_level"),
  digitalLiteracyLevel: text("digital_literacy_level"),
  interestAreas: text("interest_areas"),
  strengths: text("strengths"),
  supportNeeds: text("support_needs"),
  progressNotes: text("progress_notes"),
  recommendations: text("recommendations"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertEducationPlanSchema = createInsertSchema(educationPlansTable).omit({ id: true, planId: true, createdAt: true, updatedAt: true });
export type InsertEducationPlan = z.infer<typeof insertEducationPlanSchema>;
export type EducationPlan = typeof educationPlansTable.$inferSelect;
