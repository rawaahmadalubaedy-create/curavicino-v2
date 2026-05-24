import { pgTable, text, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const txTypeEnum = pgEnum("tx_type", ["credit", "debit"]);

export const walletTransactionsTable = pgTable("wallet_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  amount: real("amount").notNull(),
  type: txTypeEnum("type").notNull(),
  description: text("description").notNull().default(""),
  referenceId: text("reference_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWalletTxSchema = createInsertSchema(walletTransactionsTable).omit({
  createdAt: true,
});

export type InsertWalletTx = z.infer<typeof insertWalletTxSchema>;
export type WalletTransaction = typeof walletTransactionsTable.$inferSelect;
