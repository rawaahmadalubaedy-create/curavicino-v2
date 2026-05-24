import { pgTable, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reviewsTable = pgTable("reviews", {
  id: text("id").primaryKey(),
  bookingId: text("booking_id").notNull(),
  customerId: text("customer_id").notNull(),
  providerId: text("provider_id").notNull(),
  customerName: text("customer_name").notNull().default(""),
  customerAvatar: text("customer_avatar").default(""),
  rating: real("rating").notNull(),
  text: text("text").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({
  createdAt: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
