import { pgTable, uuid, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const tokenUsage = pgTable('token_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  endpoint: varchar('endpoint', { length: 255 }),
  tokensUsed: integer('tokens_used').notNull(),
  usageMonth: varchar('usage_month', { length: 7 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  userMonthIdx: index('idx_token_usage_user_month').on(table.userId, table.usageMonth)
}));

export type TokenUsage = typeof tokenUsage.$inferSelect;
export type NewTokenUsage = typeof tokenUsage.$inferInsert;
