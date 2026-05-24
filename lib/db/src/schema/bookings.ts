import { pgTable, text, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookingStatusEnum = pgEnum("booking_status", ["pending", "active", "completed", "cancelled"]);

export const bookingsTable = pgTable("bookings", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").notNull(),
  providerId: text("provider_id").notNull(),
  providerName: text("provider_name").notNull(),
  service: text("service").notNull(),
  category: text("category").notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  duration: integer("duration").notNull().default(1),
  totalCost: real("total_cost").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
