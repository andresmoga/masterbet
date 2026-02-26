import { pgTable, uuid, varchar, integer, text, timestamp } from 'drizzle-orm/pg-core';

export const scraperLogs = pgTable('scraper_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookmaker: varchar('bookmaker', { length: 100 }),
  status: varchar('status', { length: 50 }).notNull(),
  matchesFound: integer('matches_found'),
  errorMessage: text('error_message'),
  executionTimeMs: integer('execution_time_ms'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type ScraperLog = typeof scraperLogs.$inferSelect;
export type NewScraperLog = typeof scraperLogs.$inferInsert;
