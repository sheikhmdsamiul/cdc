import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { rolesTable } from "./roles";
import { centersTable } from "./centers";
import { administrativeUnitsTable } from "./administrative_units";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  passwordHash: text("password_hash").notNull(),
  roleId: integer("role_id").references(() => rolesTable.id),
  centerId: integer("center_id").references(() => centersTable.id),
  administrativeUnitId: integer("administrative_unit_id").references(() => administrativeUnitsTable.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, passwordHash: true, createdAt: true, updatedAt: true }).extend({
  password: z.string().min(6),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
