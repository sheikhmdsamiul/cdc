import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { casesTable } from "./cases";

export const caseDetailAssessmentsTable = pgTable("case_detail_assessments", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull().references(() => casesTable.id),
  courtOrderDetails: text("court_order_details"),
  assessmentReason: text("assessment_reason"),
  familyMembers: text("family_members"),
  currentLivingSituation: text("current_living_situation"),
  previousServices: text("previous_services"),
  childDomainScores: text("child_domain_scores"),
  parentCapacityScores: text("parent_capacity_scores"),
  environmentScores: text("environment_scores"),
  conclusionReason: text("conclusion_reason"),
  overallComments: text("overall_comments"),
  changesNeeded: text("changes_needed"),
  childOpinion: text("child_opinion"),
  parentOpinion: text("parent_opinion"),
  assessedBy: text("assessed_by"),
  assessorDesignation: text("assessor_designation"),
  assessedAt: date("assessed_at"),
  parentSignature: text("parent_signature"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCaseDetailAssessmentSchema = createInsertSchema(caseDetailAssessmentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCaseDetailAssessment = z.infer<typeof insertCaseDetailAssessmentSchema>;
export type CaseDetailAssessment = typeof caseDetailAssessmentsTable.$inferSelect;
