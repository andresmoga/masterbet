import { IScraper, ScraperResult } from './types';
import { logger } from '../../utils/logger';
import { db, scrapedOdds, scraperLogs, teams, matches, eq, and } from '@masterbet/database';
import { normalizeTeamName } from './teamNormalizer';

// Canonical league names — map any variant to one canonical string
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

function normalizeLeague(league: string | null | undefined): string {
  if (!league) return 'Unknown';
  return LEAGUE_CANONICAL[league.toLowerCase()] ?? league;
}

export class ScraperOrchestrator {
  private scrapers: IScraper[] = [];

  // ── Known-teams registry ───────────────────────────────────────────────────
  // Populated by GoogleLeagueScraper. If a league has an entry here, any match
  // whose teams are NOT in the set gets rejected before saving.
  private static knownLeagueTeams = new Map<string, Set<string>>();

  static updateKnownTeams(league: string, teams: Set<string>): void {
    ScraperOrchestrator.knownLeagueTeams.set(league, teams);
  }

  static getKnownTeams(league: string): Set<string> | undefined {
    return ScraperOrchestrator.knownLeagueTeams.get(league);
  }

  registerScraper(scraper: IScraper): void {
    this.scrapers.push(scraper);
    logger.info(`Registered scraper: ${scraper.name}`);
  }

  // Max browsers open at once — one per bookmaker keeps network load manageable
  private readonly MAX_CONCURRENT = 7;

  async runAll(): Promise<ScraperResult[]> {
    return this.runScrapers(this.scrapers);
  }

  async runScrapers(scrapers: IScraper[]): Promise<ScraperResult[]> {
    logger.info(`Running ${scrapers.length} scrapers (max ${this.MAX_CONCURRENT} concurrent)...`);

    const results: ScraperResult[] = [];

    const runScraper = async (scraper: IScraper): Promise<ScraperResult> => {
      try {
        const result = await scraper.scrape();
        await this.saveResults(result);
        return result;
      } catch (error) {
        logger.error(`Unexpected error running scraper ${scraper.name}:`, error);
        return {
          bookmaker: scraper.name,
          success: false,
          matchesFound: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          matches: [],
        };
      }
    };

    // Process in batches to avoid opening too many browsers simultaneously
    for (let i = 0; i < scrapers.length; i += this.MAX_CONCURRENT) {
      const batch = scrapers.slice(i, i + this.MAX_CONCURRENT);
      logger.info(`Scraping batch ${Math.floor(i / this.MAX_CONCURRENT) + 1}/${Math.ceil(scrapers.length / this.MAX_CONCURRENT)} (${batch.map(s => s.name).join(', ')})`);
      const batchResults = await Promise.all(batch.map(runScraper));
      results.push(...batchResults);
    }

    const successCount = results.filter((r) => r.success).length;
    const totalMatches = results.reduce((sum, r) => sum + r.matchesFound, 0);

    logger.info(
      `Scraping complete: ${successCount}/${scrapers.length} successful, ${totalMatches} total matches`
    );

    return results;
  }

  private async saveResults(result: ScraperResult): Promise<void> {
    try {
      // Save scraper log — schema requires: status, bookmaker, matchesFound, errorMessage
      await db.insert(scraperLogs).values({
        bookmaker: result.bookmaker,
        status: result.success ? 'success' : 'error',
        matchesFound: result.matchesFound,
        errorMessage: result.error || null,
      });

      if (!result.success || result.matches.length === 0) {
        return;
      }

      for (const match of result.matches) {
        await this.saveMatch(match, result.bookmaker);
      }

      logger.info(`Saved ${result.matches.length} matches from ${result.bookmaker}`);
    } catch (error) {
      logger.error(`Error saving results from ${result.bookmaker}:`, error);
    }
  }

  private async saveMatch(matchData: any, bookmaker: string): Promise<void> {
    try {
      const normalizedHome = normalizeTeamName(matchData.homeTeam);
      const normalizedAway = normalizeTeamName(matchData.awayTeam);

      // If Google has populated a known-team set for this league, validate both
      // teams against it — reject matches that don't belong to the league.
      const canonicalLeague = normalizeLeague(matchData.league);
      const knownTeams = ScraperOrchestrator.knownLeagueTeams.get(canonicalLeague);
      if (knownTeams && knownTeams.size > 0) {
        const homeKnown = [...knownTeams].some(
          (t) => normalizeTeamName(t).toLowerCase() === normalizedHome.toLowerCase()
        );
        const awayKnown = [...knownTeams].some(
          (t) => normalizeTeamName(t).toLowerCase() === normalizedAway.toLowerCase()
        );
        if (!homeKnown || !awayKnown) {
          logger.warn(
            `${bookmaker}: rejected "${normalizedHome} vs ${normalizedAway}" — teams not in "${canonicalLeague}" known list`
          );
          return;
        }
      }

      const homeTeamId = await this.findOrCreateTeam(normalizedHome);
      const awayTeamId = await this.findOrCreateTeam(normalizedAway);

      // Deduplicate by same calendar day: fetch all matches with the same teams,
      // then check in TS whether any falls on the same day.
      // (gte/lte cause Drizzle version-conflict errors in this monorepo setup.)
      const matchDayStr = new Date(matchData.matchDate).toDateString();

      const candidateMatches = await db
        .select()
        .from(matches)
        .where(
          and(
            eq(matches.homeTeamId, homeTeamId),
            eq(matches.awayTeamId, awayTeamId)
          )
        );

      const existingMatch = candidateMatches.filter(
        (m) => m.matchDate && new Date(m.matchDate).toDateString() === matchDayStr
      );

      let matchId: string;

      if (existingMatch.length > 0) {
        matchId = existingMatch[0].id;
      } else {
        const [newMatch] = await db
          .insert(matches)
          .values({
            homeTeamId,
            awayTeamId,
            matchDate: matchData.matchDate,
            league: normalizeLeague(matchData.league),
            status: 'scheduled',
          })
          .returning();

        matchId = newMatch.id;
      }

      const oddsData = matchData.odds.find((o: any) => o.bookmaker === bookmaker);

      if (oddsData) {
        // Schema fields: oddsHome, oddsDraw, oddsAway (not homeOdds/drawOdds/awayOdds)
        await db.insert(scrapedOdds).values({
          matchId,
          bookmaker,
          oddsHome: String(oddsData.homeOdds),
          oddsDraw: oddsData.drawOdds != null ? String(oddsData.drawOdds) : null,
          oddsAway: oddsData.awayOdds != null ? String(oddsData.awayOdds) : null,
          oddsOver25: oddsData.over25Odds != null ? String(oddsData.over25Odds) : null,
          oddsUnder25: oddsData.under25Odds != null ? String(oddsData.under25Odds) : null,
        });
      }
    } catch (error) {
      logger.error(`Error saving match data:`, error);
    }
  }

  private async findOrCreateTeam(teamName: string): Promise<string> {
    // Schema uses canonicalName, not name
    const existing = await db
      .select()
      .from(teams)
      .where(eq(teams.canonicalName, teamName))
      .limit(1);

    if (existing.length > 0) {
      return existing[0].id;
    }

    const [newTeam] = await db
      .insert(teams)
      .values({
        canonicalName: teamName,
        aliases: [],
      })
      .returning();

    return newTeam.id;
  }
}
