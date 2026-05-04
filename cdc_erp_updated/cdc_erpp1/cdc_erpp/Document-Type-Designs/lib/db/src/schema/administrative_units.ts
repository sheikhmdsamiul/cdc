import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { centersTable } from "./centers";

export const administrativeUnitsTable = pgTable("administrative_units", {
  id: serial("id").primaryKey(),
  unitName: text("unit_name").notNull(),
  unitNameBn: text("unit_name_bn"),
  unitNameEn: text("unit_name_en"),
  unitType: text("unit_type").notNull(),
  parentUnitId: integer("parent_unit_id"),
  linkedCenterId: integer("linked_center_id").references(() => centersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAdminUnitSchema = createInsertSchema(administrativeUnitsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAdminUnit = z.infer<typeof insertAdminUnitSchema>;
export type AdminUnit = typeof administrativeUnitsTable.$inferSelect;
