import { pgTable, uuid, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { teams } from './teams';

export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  sport: varchar('sport', { length: 100 }).default('soccer').notNull(),
  league: varchar('league', { length: 255 }),
  homeTeamId: uuid('home_team_id').references(() => teams.id),
  awayTeamId: uuid('away_team_id').references(() => teams.id),
  matchDate: timestamp('match_date'),
  status: varchar('status', { length: 50 }).default('scheduled').notNull(),
  finalScoreHome: integer('final_score_home'),
  finalScoreAway: integer('final_score_away'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
