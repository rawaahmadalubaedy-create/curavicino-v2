import { pgTable, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userTypeEnum = pgEnum("user_type", ["customer", "provider", "admin"]);
export const withdrawalPrefEnum = pgEnum("withdrawal_pref", ["daily", "weekly", "monthly"]);

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull().default(""),
  userType: userTypeEnum("user_type").notNull().default("customer"),
  age: integer("age"),
  address: text("address"),
  forFamilyMember: boolean("for_family_member").default(false),
  isVerified: boolean("is_verified").default(false),
  photo: text("photo"),
  withdrawalPreference: withdrawalPrefEnum("withdrawal_preference").default("weekly"),
  bankLinked: boolean("bank_linked").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
