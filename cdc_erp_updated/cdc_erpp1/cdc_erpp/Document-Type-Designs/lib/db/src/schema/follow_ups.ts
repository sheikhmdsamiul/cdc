import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { childrenTable } from "./children";

export const followUpsTable = pgTable("follow_ups", {
  id: serial("id").primaryKey(),
  followUpId: text("follow_up_id").notNull().unique(),
  childId: integer("child_id").notNull().references(() => childrenTable.id),
  followUpDate: date("follow_up_date").notNull(),
  visitType: text("visit_type").notNull(),
  observation: text("observation"),
  nextAction: text("next_action"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertFollowUpSchema = createInsertSchema(followUpsTable).omit({ id: true, followUpId: true, createdAt: true, updatedAt: true });
export type InsertFollowUp = z.infer<typeof insertFollowUpSchema>;
export type FollowUp = typeof followUpsTable.$inferSelect;
