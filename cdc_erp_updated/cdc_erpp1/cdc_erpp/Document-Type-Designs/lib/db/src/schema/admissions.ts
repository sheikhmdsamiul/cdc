import { pgTable, text, serial, timestamp, integer, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { childrenTable } from "./children";
import { centersTable } from "./centers";

export const admissionsTable = pgTable("admissions", {
  id: serial("id").primaryKey(),
  admissionId: text("admission_id").notNull().unique(),
  childId: integer("child_id").notNull().references(() => childrenTable.id),
  centerId: integer("center_id").notNull().references(() => centersTable.id),
  admissionDate: date("admission_date").notNull(),
  admissionTime: text("admission_time"),
  admissionSource: text("admission_source").notNull(),
  receivingOfficer: text("receiving_officer"),
  documentsVerified: boolean("documents_verified").default(false),
  verifiedBy: text("verified_by"),
  verificationDate: date("verification_date"),
  approvalStatus: text("approval_status").notNull().default("Draft"),
  authorityRemarks: text("authority_remarks"),
  cwFeedback: text("cw_feedback"),
  poFeedback: text("po_feedback"),
  rejectionNote: text("rejection_note"),
  approvedByName: text("approved_by_name"),
  rejectedByName: text("rejected_by_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAdmissionSchema = createInsertSchema(admissionsTable).omit({ id: true, admissionId: true, createdAt: true, updatedAt: true });
export type InsertAdmission = z.infer<typeof insertAdmissionSchema>;
export type Admission = typeof admissionsTable.$inferSelect;
