import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const docTypeEnum = pgEnum("doc_type", ["id", "medical", "criminal", "photo"]);
export const docStatusEnum = pgEnum("doc_status", ["pending", "approved", "rejected"]);

export const providerDocumentsTable = pgTable("provider_documents", {
  id: text("id").primaryKey(),
  providerId: text("provider_id").notNull(),
  docType: docTypeEnum("doc_type").notNull(),
  fileUrl: text("file_url").notNull(),
  status: docStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(providerDocumentsTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type ProviderDocument = typeof providerDocumentsTable.$inferSelect;
