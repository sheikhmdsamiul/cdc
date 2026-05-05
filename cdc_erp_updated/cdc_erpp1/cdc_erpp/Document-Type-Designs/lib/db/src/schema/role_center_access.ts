import { pgTable, serial, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { rolesTable } from "./roles";
import { centersTable } from "./centers";

export const roleCenterAccessTable = pgTable("role_center_access", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => rolesTable.id).notNull(),
  centerId: integer("center_id").references(() => centersTable.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqRoleCenter: unique("role_center_access_role_center_unique").on(table.roleId, table.centerId),
}));

export const insertRoleCenterAccessSchema = createInsertSchema(roleCenterAccessTable).omit({ id: true, createdAt: true });
export type InsertRoleCenterAccess = z.infer<typeof insertRoleCenterAccessSchema>;
export type RoleCenterAccess = typeof roleCenterAccessTable.$inferSelect;
