import { pgTable, uuid, varchar, decimal, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { matches } from './matches';

export const scrapedOdds = pgTable('scraped_odds', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'cascade' }).notNull(),
  bookmaker: varchar('bookmaker', { length: 100 }).notNull(),
  oddsHome: decimal('odds_home', { precision: 5, scale: 2 }),
  oddsDraw: decimal('odds_draw', { precision: 5, scale: 2 }),
  oddsAway: decimal('odds_away', { precision: 5, scale: 2 }),
  oddsOver25: decimal('odds_over25', { precision: 5, scale: 2 }),
  oddsUnder25: decimal('odds_under25', { precision: 5, scale: 2 }),
  scrapedAt: timestamp('scraped_at').defaultNow().notNull(),
  isLatest: boolean('is_latest').default(true).notNull()
}, (table) => ({
  matchLatestIdx: index('idx_scraped_odds_match_latest').on(table.matchId, table.isLatest)
}));

export type ScrapedOdds = typeof scrapedOdds.$inferSelect;
export type NewScrapedOdds = typeof scrapedOdds.$inferInsert;
