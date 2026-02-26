import { pgTable, uuid, varchar, decimal, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { matches } from './matches';

export const userBets = pgTable('user_bets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  matchId: uuid('match_id').references(() => matches.id),
  bookmaker: varchar('bookmaker', { length: 100 }),
  betType: varchar('bet_type', { length: 50 }),
  odds: decimal('odds', { precision: 5, scale: 2 }),
  stake: decimal('stake', { precision: 10, scale: 2 }),
  potentialPayout: decimal('potential_payout', { precision: 10, scale: 2 }),
  actualPayout: decimal('actual_payout', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  betDate: timestamp('bet_date'),
  settledAt: timestamp('settled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>()
}, (table) => ({
  userStatusIdx: index('idx_user_bets_user_status').on(table.userId, table.status)
}));

export type UserBet = typeof userBets.$inferSelect;
export type NewUserBet = typeof userBets.$inferInsert;
