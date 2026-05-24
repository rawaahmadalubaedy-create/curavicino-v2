import { pgTable, text, integer, real, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoryEnum = pgEnum("category_type", ["elderly-care", "delivery", "home-services"]);
export const availabilityEnum = pgEnum("availability_status", ["available", "busy", "offline"]);

export const providersTable = pgTable("providers", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull().default(""),
  category: categoryEnum("category").notNull(),
  pricePerHour: real("price_per_hour").notNull().default(0),
  heroImage: text("hero_image").notNull().default(""),
  profilePhoto: text("profile_photo").notNull().default(""),
  gallery: text("gallery").array().default([]),
  about: text("about").default(""),
  certifications: text("certifications").array().default([]),
  languages: text("languages").array().default([]),
  serviceAreas: text("service_areas").array().default([]),
  availabilityStatus: availabilityEnum("availability_status").default("available"),
  responseTime: text("response_time").default("< 1 hour"),
  completedServices: integer("completed_services").default(0),
  memberSince: text("member_since").default(""),
  isVerified: boolean("is_verified").default(false),
  rating: real("rating").default(0),
  reviewsCount: integer("reviews_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProviderSchema = createInsertSchema(providersTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertProvider = z.infer<typeof insertProviderSchema>;
export type Provider = typeof providersTable.$inferSelect;
