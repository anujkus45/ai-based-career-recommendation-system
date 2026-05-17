import { jsonb, pgTable, serial, text, timestamp, integer, varchar } from "drizzle-orm/pg-core";

export const assessmentsTable = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  careerTitle: text("career_title").notNull(),
  matchScore: integer("match_score").notNull(),
  result: jsonb("result").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Assessment = typeof assessmentsTable.$inferSelect;
export type InsertAssessment = typeof assessmentsTable.$inferInsert;
