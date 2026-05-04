import { pgTable, text, serial, timestamp, integer, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { childrenTable } from "./children";

export const courtCasesTable = pgTable("court_cases", {
  id: serial("id").primaryKey(),
  courtCaseId: text("court_case_id").notNull().unique(),
  childId: integer("child_id").notNull().references(() => childrenTable.id),
  courtName: text("court_name").notNull(),
  policeStationName: text("police_station_name"),
  grNumber: text("gr_number"),
  caseNo: text("case_no").notNull(),
  legalSection: text("legal_section"),
  legalAidType: text("legal_aid_type"),
  hearingDate: date("hearing_date"),
  lastHearingDate: date("last_hearing_date"),
  lawyerName: text("lawyer_name"),
  childCaseType: text("child_case_type"),
  previousCaseInvolvement: boolean("previous_case_involvement").notNull().default(false),
  outcome: text("outcome"),
  nextHearingDate: date("next_hearing_date"),

  // Extended fields for import
  firNumber: text("fir_number"), // থানা/কেস নং
  firDate: date("fir_date"), // আদমজির তারিখ
  currentCaseStatus: text("current_case_status"), // মামলার বর্তমান অবস্থা
  courtAttendanceDetails: text("court_attendance_details"), // আদালতে হাজিরির বিবরণ
  courtAttendanceDates: text("court_attendance_dates"), // আদালতে হাজিরির তারিখ
  guardianCommunication: text("guardian_communication"), // অভিভাবকের সাথে যোগাযোগ
  educationTraining: text("education_training"), // শিক্ষা ও প্রশিক্ষণ
  centerFacilities: text("center_facilities"), // কেন্দ্র থেকে প্রদত্ত সুযোগ সুবিধা
  caseComments: text("case_comments"), // মন্তব্য

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCourtCaseSchema = createInsertSchema(courtCasesTable).omit({ id: true, courtCaseId: true, createdAt: true, updatedAt: true });
export type InsertCourtCase = z.infer<typeof insertCourtCaseSchema>;
export type CourtCase = typeof courtCasesTable.$inferSelect;
