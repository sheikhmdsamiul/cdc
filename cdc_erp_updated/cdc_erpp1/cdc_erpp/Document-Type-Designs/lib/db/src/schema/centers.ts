import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const centersTable = pgTable("centers", {
  id: serial("id").primaryKey(),
  centerName: text("center_name").notNull().unique(),
  centerNameBn: text("center_name_bn"),
  centerType: text("center_type").notNull(),
  location: text("location"),
  address: text("address"),
  isHq: text("is_hq").default("no"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCenterSchema = createInsertSchema(centersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCenter = z.infer<typeof insertCenterSchema>;
export type Center = typeof centersTable.$inferSelect;
