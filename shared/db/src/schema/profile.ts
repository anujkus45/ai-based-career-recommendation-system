import { boolean, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const userProfilesTable = pgTable("user_profiles", {
  userId: varchar("user_id").primaryKey(),
  classLevel: varchar("class_level"),
  stream: varchar("stream"),
  interests: jsonb("interests").$type<string[]>().default([]),
  preferredCareers: jsonb("preferred_careers").$type<string[]>().default([]),
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const savedItemsTable = pgTable("saved_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  kind: varchar("kind").notNull(),
  title: text("title").notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserProfile = typeof userProfilesTable.$inferSelect;
export type InsertUserProfile = typeof userProfilesTable.$inferInsert;
export type SavedItem = typeof savedItemsTable.$inferSelect;
export type InsertSavedItem = typeof savedItemsTable.$inferInsert;
