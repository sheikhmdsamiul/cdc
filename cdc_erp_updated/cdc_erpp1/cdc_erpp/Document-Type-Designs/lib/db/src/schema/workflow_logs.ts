import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const workflowLogsTable = pgTable("workflow_logs", {
  id: serial("id").primaryKey(),
  recordType: text("record_type").notNull(), // 'case' or 'court_case'
  recordId: integer("record_id").notNull(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  action: text("action").notNull(), // e.g., 'submitted_to_df', 'approved'
  message: text("message"), // any notes provided during the transition
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
