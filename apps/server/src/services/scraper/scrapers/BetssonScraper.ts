import { BaseScraper } from '../BaseScraper';
import { MatchData } from '../types';
import { logger } from '../../../utils/logger';

export class BetssonScraper extends BaseScraper {
  name = 'Betsson';
  url = 'https://www.betsson.co/apuestas-deportivas/futbol/colombia/colombia-primera-a?tab=liveAndUpcoming';

  protected async extractMatches(): Promise<MatchData[]> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const matches: MatchData[] = [];

    try {
      // Angular app — wait for match rows to render
      await this.page.waitForSelector('obg-event-row-container', { timeout: 20000 });

      const matchElements = await this.page.$$('obg-event-row-container');
      logger.info(`${this.name}: Found ${matchElements.length} match rows`);

      for (const matchEl of matchElements) {
        try {
          // Team names — span.obg-event-scorecard-participants-name, index 0=home, 1=away
          const teamNames = await matchEl.$$eval(
            'span.obg-event-scorecard-participants-name',
            (els) => els.map((el) => el.textContent?.trim() ?? '')
          );

          if (teamNames.length < 2) continue;

          const homeTeam = teamNames[0];
          const awayTeam = teamNames[1];

          // Odds — from "Ganador del partido" section (first market container with highlight header)
          // span[test-id="odds"] order in DOM: home(0), draw(1), away(2)
          const oddsValues = await matchEl.$$eval(
            'obg-event-row-market-container.first-event-row-market-container span[test-id="odds"]',
            (els) => els.map((el) => parseFloat(el.textContent?.trim() ?? '0'))
          );

          if (oddsValues.length < 3) continue;

          const homeOdds = oddsValues[0];
          const drawOdds = oddsValues[1];
          const awayOdds = oddsValues[2];

          if (homeOdds === 0) continue;

          // Total goals (Más/Menos de 2.5) — second market container (not first)
          const totalOdds = await matchEl.$$eval(
            'obg-event-row-market-container:not(.first-event-row-market-container) span[test-id="odds"]',
            (els) => els.map((el) => parseFloat(el.textContent?.trim() ?? '0'))
          );

          const over25Odds = totalOdds[0] ?? null;
          const under25Odds = totalOdds[1] ?? null;

          // Date/time — inside obg-event-countdown time span
          const dateTimeStr = await matchEl.$eval(
            'obg-event-countdown time span',
            (el) => el.textContent?.trim() ?? ''
          ).catch(() => '');

          matches.push({
            homeTeam,
            awayTeam,
            matchDate: this.parseMatchDate(dateTimeStr),
            league: 'Colombia - Primera A',
            odds: [
              {
                bookmaker: this.name,
                homeOdds,
                drawOdds,
                awayOdds,
                over25Odds: over25Odds || null,
                under25Odds: under25Odds || null,
                scrapedAt: new Date(),
              },
            ],
          });
        } catch (error) {
          logger.debug(`${this.name}: Error parsing match row`, error);
        }
      }
    } catch (error) {
      logger.error(`${this.name}: extractMatches failed`, error);
    }

    return matches;
  }

  private parseMatchDate(dateTimeStr: string): Date {
    try {
      // e.g. "Mañana  7:00 p. m." or "hoy  7:00 p. m."
      const now = new Date();
      const cleanTime = dateTimeStr
        .replace(/\u00a0/g, ' ')
        .replace('p. m.', 'PM')
        .replace('a. m.', 'AM')
        .replace(/mañana/i, '')
        .replace(/hoy/i, '')
        .trim();

      const parsed = new Date(`${now.toDateString()} ${cleanTime}`);
      return isNaN(parsed.getTime()) ? now : parsed;
    } catch {
      return new Date();
    }
  }
}
