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
};

function normalizeLeague(league: string | null | undefined): string {
  if (!league) return 'Unknown';
  return LEAGUE_CANONICAL[league.toLowerCase()] ?? league;
}

export class ScraperOrchestrator {
  private scrapers: IScraper[] = [];

  registerScraper(scraper: IScraper): void {
    this.scrapers.push(scraper);
    logger.info(`Registered scraper: ${scraper.name}`);
  }

  async runAll(): Promise<ScraperResult[]> {
    logger.info(`Running ${this.scrapers.length} scrapers...`);

    const results: ScraperResult[] = [];

    const scrapePromises = this.scrapers.map(async (scraper) => {
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
    });

    const scrapeResults = await Promise.all(scrapePromises);
    results.push(...scrapeResults);

    const successCount = results.filter((r) => r.success).length;
    const totalMatches = results.reduce((sum, r) => sum + r.matchesFound, 0);

    logger.info(
      `Scraping complete: ${successCount}/${this.scrapers.length} successful, ${totalMatches} total matches`
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
