import { pgTable, text, serial, timestamp, integer, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { childrenTable } from "./children";

export const policeAcquisitionsTable = pgTable("police_acquisitions", {
  id: serial("id").primaryKey(),
  acquisitionId: text("acquisition_id").notNull().unique(),
  childId: integer("child_id").notNull().references(() => childrenTable.id),

  hearingDate: date("hearing_date").notNull(),
  courtName: text("court_name"),
  caseNumber: text("case_number"),
  policeStation: text("police_station"),
  officersRequired: integer("officers_required").notNull().default(2),
  escortDepartureTime: text("escort_departure_time"),
  requisitionDate: date("requisition_date"),
  status: text("status").notNull().default("Draft"),
  requestedById: integer("requested_by_id"),
  centerId: integer("center_id"),
  policeOfficerName: text("police_officer_name"),
  acknowledgementRef: text("acknowledgement_ref"),
  remarks: text("remarks"),

  reasonForTransfer: text("reason_for_transfer"),
  receivingAuthority: text("receiving_authority"),
  transferDate: date("transfer_date"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPoliceAcquisitionSchema = createInsertSchema(policeAcquisitionsTable).omit({ id: true, acquisitionId: true, createdAt: true, updatedAt: true });
export type InsertPoliceAcquisition = z.infer<typeof insertPoliceAcquisitionSchema>;
export type PoliceAcquisition = typeof policeAcquisitionsTable.$inferSelect;
