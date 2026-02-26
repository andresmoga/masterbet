import { BaseScraper } from '../BaseScraper';
import { MatchData } from '../types';
import { logger } from '../../../utils/logger';

export class BetanoScraper extends BaseScraper {
  name = 'Betano';
  url = 'https://www.betano.com/sport/futbol';

  protected async extractMatches(): Promise<MatchData[]> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const matches: MatchData[] = [];

    try {
      await this.page.waitForSelector('[data-qa*="event"], .events__event, .match-event', {
        timeout: 10000,
      }).catch(() => {
        logger.warn(`${this.name}: Match selector not found`);
      });

      const matchElements = await this.page.$$('[data-qa*="event"], .events__event, .match-event');

      for (const matchEl of matchElements) {
        try {
          const homeTeam = await matchEl.$eval('[data-qa*="home"], .team--home, .participant-home', (el) =>
            el.textContent?.trim()
          ).catch(() => null);

          const awayTeam = await matchEl.$eval('[data-qa*="away"], .team--away, .participant-away', (el) =>
            el.textContent?.trim()
          ).catch(() => null);

          const homeOdds = await matchEl.$eval('[data-qa*="odds-1"], .selections__selection:nth-child(1)', (el) =>
            parseFloat(el.textContent?.trim() || '0')
          ).catch(() => 0);

          const drawOdds = await matchEl.$eval('[data-qa*="odds-X"], .selections__selection:nth-child(2)', (el) =>
            parseFloat(el.textContent?.trim() || '0')
          ).catch(() => null);

          const awayOdds = await matchEl.$eval('[data-qa*="odds-2"], .selections__selection:nth-child(3)', (el) =>
            parseFloat(el.textContent?.trim() || '0')
          ).catch(() => 0);

          if (homeTeam && awayTeam && homeOdds > 0) {
            matches.push({
              homeTeam,
              awayTeam,
              matchDate: new Date(),
              league: 'Colombia - Liga BetPlay Dimayor',
              odds: [
                {
                  bookmaker: this.name,
                  homeOdds,
                  drawOdds,
                  awayOdds,
                  over25Odds: null,
                  under25Odds: null,
                  scrapedAt: new Date(),
                },
              ],
            });
          }
        } catch (error) {
          logger.debug(`Error extracting match from ${this.name}:`, error);
        }
      }
    } catch (error) {
      logger.error(`Error in ${this.name} extractMatches:`, error);
    }

    return matches;
  }
}
