import { Request, Response } from 'express';
import { db, matches, teams, scrapedOdds, eq, and, alias } from '@masterbet/database';
import { normalizeTeamName } from '../services/scraper/teamNormalizer';

// Canonical league names — same map as in ScraperOrchestrator
const LEAGUE_CANONICAL: Record<string, string> = {
  'colombia - primera a': 'Colombia - Liga BetPlay Dimayor',
  'colombia primera a': 'Colombia - Liga BetPlay Dimayor',
  'primera a colombia': 'Colombia - Liga BetPlay Dimayor',
  'colombia - liga betplay dimayor': 'Colombia - Liga BetPlay Dimayor',
  'liga betplay dimayor': 'Colombia - Liga BetPlay Dimayor',
};

function normalizeLeague(league: string | null): string | null {
  if (!league) return null;
  return LEAGUE_CANONICAL[league.toLowerCase()] ?? league;
}

export async function getOddsComparison(req: Request, res: Response) {
  try {
    const homeTeam = alias(teams, 'home_team');
    const awayTeam = alias(teams, 'away_team');

    const rows = await db
      .select({
        matchId: matches.id,
        matchDate: matches.matchDate,
        league: matches.league,
        homeTeam: homeTeam.canonicalName,
        awayTeam: awayTeam.canonicalName,
        bookmaker: scrapedOdds.bookmaker,
        oddsHome: scrapedOdds.oddsHome,
        oddsDraw: scrapedOdds.oddsDraw,
        oddsAway: scrapedOdds.oddsAway,
        oddsOver25: scrapedOdds.oddsOver25,
        oddsUnder25: scrapedOdds.oddsUnder25,
        scrapedAt: scrapedOdds.scrapedAt,
      })
      .from(matches)
      .innerJoin(homeTeam, eq(matches.homeTeamId, homeTeam.id))
      .innerJoin(awayTeam, eq(matches.awayTeamId, awayTeam.id))
      .innerJoin(
        scrapedOdds,
        and(eq(scrapedOdds.matchId, matches.id), eq(scrapedOdds.isLatest, true))
      )
      .orderBy(matches.matchDate);

    // Group by team pair + ISO week to merge duplicate records caused by scrapers
    // using different date parsing (e.g. BetPlay uses "today" while Wplay parses
    // the actual date, so the same game lands on Mon Feb 24 vs Tue Feb 25).
    // Same team pair in the same calendar week = same game.
    const getWeekKey = (date: Date | null): string => {
      if (!date) return 'unknown';
      const d = new Date(date);
      // Roll back to Monday of this week
      const dow = d.getDay(); // 0=Sun
      const daysToMonday = dow === 0 ? -6 : 1 - dow;
      const monday = new Date(d);
      monday.setDate(d.getDate() + daysToMonday);
      return monday.toISOString().split('T')[0]; // YYYY-MM-DD of Monday
    };

    const matchMap = new Map<string, {
      matchId: string;
      homeTeam: string;
      awayTeam: string;
      matchDate: Date | null;
      league: string | null;
      odds: Record<string, { home: number | null; draw: number | null; away: number | null; over25: number | null; under25: number | null }>;
    }>();

    for (const row of rows) {
      // Normalize team names at query time so existing DB rows with slightly
      // different spellings (e.g. "Boyaca Chicó" vs "Boyacá Chicó FC") still merge
      const canonicalHome = normalizeTeamName(row.homeTeam);
      const canonicalAway = normalizeTeamName(row.awayTeam);
      const weekKey = getWeekKey(row.matchDate);
      const groupKey = `${canonicalHome}|${canonicalAway}|${weekKey}`;

      if (!matchMap.has(groupKey)) {
        matchMap.set(groupKey, {
          matchId: row.matchId,
          homeTeam: canonicalHome,
          awayTeam: canonicalAway,
          matchDate: row.matchDate,
          league: normalizeLeague(row.league),
          odds: {},
        });
      }
      const entry = matchMap.get(groupKey)!;

      // Prefer the later date (Wplay parses the actual game date; BetPlay uses today)
      if (row.matchDate && entry.matchDate && row.matchDate > entry.matchDate) {
        entry.matchDate = row.matchDate;
      }

      entry.odds[row.bookmaker] = {
        home: row.oddsHome ? parseFloat(row.oddsHome) : null,
        draw: row.oddsDraw ? parseFloat(row.oddsDraw) : null,
        away: row.oddsAway ? parseFloat(row.oddsAway) : null,
        over25: row.oddsOver25 ? parseFloat(row.oddsOver25) : null,
        under25: row.oddsUnder25 ? parseFloat(row.oddsUnder25) : null,
      };
    }

    res.json({ data: Array.from(matchMap.values()) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch odds comparison' });
  }
}
