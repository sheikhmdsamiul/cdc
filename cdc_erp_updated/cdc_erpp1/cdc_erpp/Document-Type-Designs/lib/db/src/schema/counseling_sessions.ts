import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { childrenTable } from "./children";

export const counselingSessionsTable = pgTable("counseling_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  childId: integer("child_id").notNull().references(() => childrenTable.id),
  sessionDate: date("session_date").notNull(),
  counselor: text("counselor"),
  sessionType: text("session_type").notNull(),
  issuesDiscussed: text("issues_discussed"),
  observations: text("observations"),
  outcome: text("outcome"),
  nextSessionDate: date("next_session_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCounselingSessionSchema = createInsertSchema(counselingSessionsTable).omit({ id: true, sessionId: true, createdAt: true, updatedAt: true });
export type InsertCounselingSession = z.infer<typeof insertCounselingSessionSchema>;
export type CounselingSession = typeof counselingSessionsTable.$inferSelect;
