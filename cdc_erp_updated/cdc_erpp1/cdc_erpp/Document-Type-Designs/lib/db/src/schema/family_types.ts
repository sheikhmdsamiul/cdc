import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const familyTypesTable = pgTable("family_types", {
  id: serial("id").primaryKey(),
  nameBn: text("name_bn").notNull(),
  nameEn: text("name_en").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertFamilyTypeSchema = createInsertSchema(familyTypesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFamilyType = z.infer<typeof insertFamilyTypeSchema>;
export type FamilyType = typeof familyTypesTable.$inferSelect;
