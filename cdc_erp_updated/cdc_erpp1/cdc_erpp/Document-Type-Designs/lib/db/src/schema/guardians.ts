import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { childrenTable } from "./children";

export const guardiansTable = pgTable("guardians", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").references(() => childrenTable.id),
  guardianId: text("guardian_id").notNull().unique(),
  guardianName: text("guardian_name").notNull(),
  relationship: text("relationship").notNull(),
  nidNo: text("nid_no"),
  contactNumber: text("contact_number"),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGuardianSchema = createInsertSchema(guardiansTable).omit({ id: true, guardianId: true, createdAt: true, updatedAt: true });
export type InsertGuardian = z.infer<typeof insertGuardianSchema>;
export type Guardian = typeof guardiansTable.$inferSelect;
