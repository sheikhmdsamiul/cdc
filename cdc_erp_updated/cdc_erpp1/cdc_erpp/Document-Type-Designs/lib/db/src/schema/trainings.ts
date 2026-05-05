import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const trainingsTable = pgTable("trainings", {
  id: serial("id").primaryKey(),
  nameBn: text("name_bn").notNull(),
  nameEn: text("name_en").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTrainingSchema = createInsertSchema(trainingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTraining = z.infer<typeof insertTrainingSchema>;
export type TrainingRecord = typeof trainingsTable.$inferSelect;
