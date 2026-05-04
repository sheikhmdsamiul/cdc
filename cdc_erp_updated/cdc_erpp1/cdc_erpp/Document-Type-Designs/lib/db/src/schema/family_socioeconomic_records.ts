import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { childrenTable } from "./children";

export const familySocioeconomicRecordsTable = pgTable("family_socioeconomic_records", {
  id: serial("id").primaryKey(),
  recordId: text("record_id").notNull().unique(),
  childId: integer("child_id").notNull().references(() => childrenTable.id),
  parentsEducation: text("parents_education"),
  parentsOccupation: text("parents_occupation"),
  parentsMonthlyIncome: integer("parents_monthly_income"),
  socioeconomicStatus: text("socioeconomic_status"),
  parentsContactNumber: text("parents_contact_number"),
  childRelationshipWithParents: text("child_relationship_with_parents"),
  siblingsCountAndOrder: text("siblings_count_and_order"),
  isMarried: boolean("is_married").notNull().default(false),
  childrenCount: integer("children_count"),
  familyType: text("family_type"),
  parentsMaritalStatus: text("parents_marital_status"),
  guardianType: text("guardian_type"),
  isOrphan: boolean("is_orphan").notNull().default(false),
  familyMemberSubstanceAbuse: boolean("family_member_substance_abuse").notNull().default(false),
  familyCriminalInvolvement: boolean("family_criminal_involvement").notNull().default(false),
  peerCircleInfo: text("peer_circle_info"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertFamilySocioeconomicRecordSchema = createInsertSchema(familySocioeconomicRecordsTable).omit({ id: true, recordId: true, createdAt: true, updatedAt: true });
export type InsertFamilySocioeconomicRecord = z.infer<typeof insertFamilySocioeconomicRecordSchema>;
export type FamilySocioeconomicRecord = typeof familySocioeconomicRecordsTable.$inferSelect;
