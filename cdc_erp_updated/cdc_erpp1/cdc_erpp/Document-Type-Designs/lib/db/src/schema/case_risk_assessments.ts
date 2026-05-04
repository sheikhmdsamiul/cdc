import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { casesTable } from "./cases";

export const caseRiskAssessmentsTable = pgTable("case_risk_assessments", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull().references(() => casesTable.id),
  domainScores: text("domain_scores"),
  totalScore: integer("total_score"),
  assessedBy: text("assessed_by"),
  assessorDesignation: text("assessor_designation"),
  assessedAt: date("assessed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCaseRiskAssessmentSchema = createInsertSchema(caseRiskAssessmentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCaseRiskAssessment = z.infer<typeof insertCaseRiskAssessmentSchema>;
export type CaseRiskAssessment = typeof caseRiskAssessmentsTable.$inferSelect;
