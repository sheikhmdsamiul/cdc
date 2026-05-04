import { pgTable, text, serial, timestamp, integer, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { childrenTable } from "./children";

export const riskAssessmentsTable = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  riskId: text("risk_id").notNull().unique(),
  childId: integer("child_id").notNull().references(() => childrenTable.id),
  assessmentDate: date("assessment_date").notNull(),
  assessedBy: text("assessed_by"),
  previousOccupation: text("previous_occupation"),
  childNature: text("child_nature"),
  communicationSkill: text("communication_skill"),
  communicationWithGuardian: text("communication_with_guardian"),
  educationTrainingInfo: text("education_training_info"),
  childCounselingStatus: text("child_counseling_status"),
  familyCounselingStatus: text("family_counseling_status"),
  recreationArrangement: text("recreation_arrangement"),
  otherRehabilitationInfo: text("other_rehabilitation_info"),
  abuseRisk: text("abuse_risk"),
  traffickingRisk: text("trafficking_risk"),
  reoffendingRisk: text("reoffending_risk"),
  selfHarmRisk: text("self_harm_risk"),
  overallRiskLevel: text("overall_risk_level").notNull(),
  immediateActionRequired: boolean("immediate_action_required").default(false),
  protectionMeasures: text("protection_measures"),
  status: text("status").default("Draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessmentsTable).omit({ id: true, riskId: true, createdAt: true, updatedAt: true });
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
export type RiskAssessment = typeof riskAssessmentsTable.$inferSelect;
