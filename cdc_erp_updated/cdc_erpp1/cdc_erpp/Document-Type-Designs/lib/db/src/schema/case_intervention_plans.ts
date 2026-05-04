import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { casesTable } from "./cases";

export const caseInterventionPlansTable = pgTable("case_intervention_plans", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull().references(() => casesTable.id),
  changeNeeded: text("change_needed"),
  activities: text("activities"),
  howToKnowImprovement: text("how_to_know_improvement"),
  childOpinion: text("child_opinion"),
  parentOpinion: text("parent_opinion"),
  planDate: date("plan_date"),
  nextReviewDate: date("next_review_date"),
  parentSignature: text("parent_signature"),
  socialWorkerSignature: text("social_worker_signature"),
  attendeesNames: text("attendees_names"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCaseInterventionPlanSchema = createInsertSchema(caseInterventionPlansTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCaseInterventionPlan = z.infer<typeof insertCaseInterventionPlanSchema>;
export type CaseInterventionPlan = typeof caseInterventionPlansTable.$inferSelect;
