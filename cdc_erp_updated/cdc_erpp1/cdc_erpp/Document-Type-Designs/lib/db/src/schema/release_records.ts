import { pgTable, text, serial, timestamp, integer, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { childrenTable } from "./children";

export const releaseRecordsTable = pgTable("release_records", {
  id: serial("id").primaryKey(),
  releaseId: text("release_id").notNull().unique(),
  childId: integer("child_id").notNull().references(() => childrenTable.id),
  releaseDate: date("release_date").notNull(),
  releaseType: text("release_type").notNull(),
  handedOverTo: text("handed_over_to"),
  authorityApproval: boolean("authority_approval").default(false),
  remarks: text("remarks"),
  approvalStatus: text("approval_status").notNull().default("Draft"),
  submittedBy: text("submitted_by"),
  approvedByName: text("approved_by_name"),
  rejectionNote: text("rejection_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertReleaseRecordSchema = createInsertSchema(releaseRecordsTable).omit({ id: true, releaseId: true, createdAt: true, updatedAt: true });
export type InsertReleaseRecord = z.infer<typeof insertReleaseRecordSchema>;
export type ReleaseRecord = typeof releaseRecordsTable.$inferSelect;
