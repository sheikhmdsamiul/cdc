import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { childrenTable } from "./children";
import { guardiansTable } from "./guardians";

export const guardianVisitsTable = pgTable("guardian_visits", {
  id: serial("id").primaryKey(),
  visitId: text("visit_id").notNull().unique(),
  childId: integer("child_id").notNull().references(() => childrenTable.id),
  guardianId: integer("guardian_id").notNull().references(() => guardiansTable.id),
  visitDate: date("visit_date").notNull(),
  purposeOfVisit: text("purpose_of_visit"),
  observations: text("observations"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGuardianVisitSchema = createInsertSchema(guardianVisitsTable).omit({ id: true, visitId: true, createdAt: true, updatedAt: true });
export type InsertGuardianVisit = z.infer<typeof insertGuardianVisitSchema>;
export type GuardianVisit = typeof guardianVisitsTable.$inferSelect;
