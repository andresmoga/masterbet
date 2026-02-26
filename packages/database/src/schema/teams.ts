import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  canonicalName: varchar('canonical_name', { length: 255 }).notNull(),
  aliases: text('aliases').array().$type<string[]>(),
  country: varchar('country', { length: 100 }),
  league: varchar('league', { length: 255 }),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
