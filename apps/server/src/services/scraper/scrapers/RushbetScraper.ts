import { BaseScraper } from '../BaseScraper';
import { MatchData } from '../types';
import { logger } from '../../../utils/logger';

export class RushbetScraper extends BaseScraper {
  name = 'Rushbet';
  url = 'https://www.rushbet.co/?page=sportsbook#filter/football/colombia/liga_betplay_dimayor';

  protected async extractMatches(): Promise<MatchData[]> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const matches: MatchData[] = [];

    try {
      await this.page.waitForSelector('li.KambiBC-event-item--type-match', { timeout: 20000 });

      const matchElements = await this.page.$$('li.KambiBC-event-item--type-match');
      logger.info(`${this.name}: Found ${matchElements.length} match rows`);

      for (const matchEl of matchElements) {
        try {
          // Team names — text node after empty .KambiBC-event-participants__info div
          const teamNames = await matchEl.$$eval(
            '.KambiBC-event-participants__name',
            (els) => els.map((el) => el.textContent?.trim() ?? '')
          );

          if (teamNames.length < 2) continue;

          const homeTeam = teamNames[0];
          const awayTeam = teamNames[1];

          // 1X2 odds — button textContent is just the odds number (no aria-label on Rushbet)
          const oddsValues = await matchEl.$$eval(
            '.KambiBC-bet-offer--onecrosstwo .KambiBC-betty-outcome',
            (btns) => btns.map((btn) => parseFloat(btn.textContent?.trim() || '0'))
          );

          if (oddsValues.length < 3) continue;

          const homeOdds = oddsValues[0];
          const drawOdds = oddsValues[1];
          const awayOdds = oddsValues[2];

          if (homeOdds === 0) continue;

          // Over/Under 2.5 — button textContent has "Más de / 2.5 / <odds>"
          // Extract the last decimal number (the odds, not the handicap)
          const totalOdds = await matchEl.$$eval(
            '.KambiBC-bet-offer--overunder .KambiBC-betty-outcome',
            (btns) =>
              btns.map((btn) => {
                const nums = btn.textContent?.match(/\d+\.\d+/g) ?? [];
                return parseFloat(nums[nums.length - 1] ?? '0');
              })
          );

          const over25Odds = totalOdds[0] || null;
          const under25Odds = totalOdds[1] || null;

          // Date & time — 24h format e.g. "mié" + "19:00"
          const dateStr = await matchEl
            .$eval('.KambiBC-event-item__start-time--date', (el) => el.textContent?.trim() ?? '')
            .catch(() => '');

          const timeStr = await matchEl
            .$eval('.KambiBC-event-item__start-time--time', (el) => el.textContent?.trim() ?? '')
            .catch(() => '');

          matches.push({
            homeTeam,
            awayTeam,
            matchDate: this.parseMatchDate(dateStr, timeStr),
            league: 'Colombia - Liga BetPlay Dimayor',
            odds: [
              {
                bookmaker: this.name,
                homeOdds,
                drawOdds,
                awayOdds,
                over25Odds,
                under25Odds,
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

  private parseMatchDate(dateStr: string, timeStr: string): Date {
    try {
      // timeStr is 24h format: "19:00"
      const now = new Date();
      const parsed = new Date(`${now.toDateString()} ${timeStr}`);
      return isNaN(parsed.getTime()) ? now : parsed;
    } catch {
      return new Date();
    }
  }
}
