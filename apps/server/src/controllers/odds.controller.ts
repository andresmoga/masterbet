import { Request, Response } from 'express';
import { db, matches, teams, scrapedOdds, scraperLogs, eq, and, alias, desc } from '@masterbet/database';
import { normalizeTeamName } from '../services/scraper/teamNormalizer';
import { BOOKMAKER_TEAM_ALIASES } from '../services/scraper/teamBookmakerMap';
import { triggerLeagueScrape, debugRunScraper } from '../jobs/scraperCron';

// Canonical league names — map any scraped variant to one canonical string
const LEAGUE_CANONICAL: Record<string, string> = {
  'colombia - primera a': 'Colombia - Liga BetPlay Dimayor',
  'colombia primera a': 'Colombia - Liga BetPlay Dimayor',
  'primera a colombia': 'Colombia - Liga BetPlay Dimayor',
  'colombia - liga betplay dimayor': 'Colombia - Liga BetPlay Dimayor',
  'liga betplay dimayor': 'Colombia - Liga BetPlay Dimayor',
  'conmebol libertadores': 'CONMEBOL Libertadores',
  'copa libertadores': 'CONMEBOL Libertadores',
  'uefa champions league': 'UEFA Champions League',
  'champions league': 'UEFA Champions League',
  'uefa europa league': 'UEFA Europa League',
  'europa league': 'UEFA Europa League',
  'uefa conference league': 'UEFA Conference League',
  'conference league': 'UEFA Conference League',
  'premier league': 'Premier League',
  'la liga': 'La Liga',
  'laliga': 'La Liga',
  'serie a': 'Serie A',
  'bundesliga': 'Bundesliga',
  'ligue 1': 'Ligue 1',
  'copa del mundo 2026': 'Copa del Mundo 2026',
};

// Map URL slug → canonical league name for filtering
const SLUG_TO_LEAGUE: Record<string, string> = {
  'liga-betplay': 'Colombia - Liga BetPlay Dimayor',
  'libertadores': 'CONMEBOL Libertadores',
  'champions': 'UEFA Champions League',
  'europa-league': 'UEFA Europa League',
  'conference-league': 'UEFA Conference League',
  'premier-league': 'Premier League',
  'la-liga': 'La Liga',
  'serie-a': 'Serie A',
  'bundesliga': 'Bundesliga',
  'ligue-1': 'Ligue 1',
  'world-cup-2026': 'Copa del Mundo 2026',
};

function normalizeLeague(league: string | null): string | null {
  if (!league) return null;
  return LEAGUE_CANONICAL[league.toLowerCase()] ?? league;
}

export async function getOddsComparison(req: Request, res: Response) {
  try {
    const leagueSlug = req.query.league as string | undefined;
    const leagueFilter = leagueSlug ? SLUG_TO_LEAGUE[leagueSlug] : undefined;

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

    // Filter rows by league if a slug was provided
    const filteredRows = leagueFilter
      ? rows.filter((r) => normalizeLeague(r.league) === leagueFilter)
      : rows;

    for (const row of filteredRows) {
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

    // Show matches that haven't started yet, plus a 90-min grace window for live matches.
    const cutoff = new Date(Date.now() - 90 * 60 * 1000);

    const data = Array.from(matchMap.values()).filter(
      (m) => !m.matchDate || m.matchDate >= cutoff
    );

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch odds comparison' });
  }
}

export async function getScraperStatus(_req: Request, res: Response) {
  try {
    // ── 1. Recent scraper runs (per bookmaker, most recent only) ──────────────
    const logs = await db
      .select()
      .from(scraperLogs)
      .orderBy(desc(scraperLogs.createdAt))
      .limit(200);

    const latestLog = new Map<string, typeof logs[0]>();
    for (const log of logs) {
      const key = log.bookmaker ?? 'unknown';
      if (!latestLog.has(key)) latestLog.set(key, log);
    }

    const scrapers = Array.from(latestLog.values()).map((l) => ({
      bookmaker: l.bookmaker ?? 'unknown',
      status: l.status ?? 'unknown',
      matchesFound: l.matchesFound,
      error: l.errorMessage ?? null,
      lastRun: l.createdAt,
    }));
    scrapers.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'error' ? -1 : 1;
      return a.bookmaker.localeCompare(b.bookmaker);
    });

    // ── 2. Coverage: which bookmakers have odds per league (upcoming matches) ─
    // Tells you exactly which bookmaker × league combinations are missing.
    const homeTeam = alias(teams, 'home_team');
    const awayTeam = alias(teams, 'away_team');
    const oddRows = await db
      .select({
        league: matches.league,
        matchDate: matches.matchDate,
        homeTeam: homeTeam.canonicalName,
        awayTeam: awayTeam.canonicalName,
        bookmaker: scrapedOdds.bookmaker,
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

    // Filter to upcoming only
    const upcomingRows = oddRows.filter(
      (r) => !r.matchDate || r.matchDate >= startOfToday
    );

    // Group: league → bookmaker → match count
    const coverage: Record<string, Record<string, { matches: number; lastScraped: Date | null }>> = {};
    for (const row of upcomingRows) {
      const league = normalizeLeague(row.league) ?? 'Unknown';
      const bm = row.bookmaker ?? 'unknown';
      if (!coverage[league]) coverage[league] = {};
      if (!coverage[league][bm]) coverage[league][bm] = { matches: 0, lastScraped: null };
      coverage[league][bm].matches += 1;
      const scraped = row.scrapedAt ? new Date(row.scrapedAt) : null;
      if (scraped && (!coverage[league][bm].lastScraped || scraped > coverage[league][bm].lastScraped!)) {
        coverage[league][bm].lastScraped = scraped;
      }
    }

    res.json({ scrapers, coverage, total: scrapers.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scraper status' });
  }
}

export async function getTeamMap(_req: Request, res: Response) {
  try {
    // ── All DB teams ──────────────────────────────────────────────────────────
    const dbTeams = await db.select().from(teams).orderBy(teams.canonicalName);

    // Build canonical → DB id map
    const dbTeamByCanonical = new Map<string, string>();
    for (const t of dbTeams) {
      dbTeamByCanonical.set(t.canonicalName.toLowerCase(), t.id);
    }

    // ── Alias table: flat rows for easy auditing ───────────────────────────────
    const aliasRows = Object.entries(BOOKMAKER_TEAM_ALIASES).map(([canonical, aliases]) => {
      const dbId = dbTeamByCanonical.get(canonical.toLowerCase()) ?? null;
      // Trace each alias through normalizeTeamName to confirm it resolves correctly
      const aliasChecks = aliases.map((a) => ({
        alias: a,
        resolvesTo: normalizeTeamName(a),
        ok: normalizeTeamName(a) === canonical,
      }));
      return {
        canonical,
        dbId,
        inDb: !!dbId,
        aliases: aliasChecks,
      };
    });

    // ── DB teams with no alias entry (created by scrapers, not in the alias table) ─
    const mappedCanonicals = new Set(
      Object.keys(BOOKMAKER_TEAM_ALIASES).map((k) => k.toLowerCase())
    );
    const unmapped = dbTeams
      .filter((t) => !mappedCanonicals.has(t.canonicalName.toLowerCase()))
      .map((t) => ({ id: t.id, canonicalName: t.canonicalName }));

    res.json({
      aliasTable: aliasRows,
      unmappedDbTeams: unmapped,
      summary: {
        aliasEntries: aliasRows.length,
        dbTeams: dbTeams.length,
        unmappedInDb: unmapped.length,
        brokenAliases: aliasRows.flatMap((r) => r.aliases.filter((a) => !a.ok)).length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team map' });
  }
}

export async function debugScraper(req: Request, res: Response) {
  const slug = req.query.league as string | undefined;
  const bookmaker = req.query.bookmaker as string | undefined;

  if (!slug || !bookmaker) {
    res.status(400).json({ error: 'Missing ?league= and ?bookmaker= parameters' });
    return;
  }

  // This can take 30-60s — increase client timeout if testing via browser
  const result = await debugRunScraper(slug, bookmaker);
  res.json(result);
}

export function triggerScrape(req: Request, res: Response) {
  const slug = req.query.league as string | undefined;
  if (!slug) {
    res.status(400).json({ error: 'Missing ?league= parameter' });
    return;
  }
  const started = triggerLeagueScrape(slug);
  res.json({ status: started ? 'scraping' : 'already_running' });
}
