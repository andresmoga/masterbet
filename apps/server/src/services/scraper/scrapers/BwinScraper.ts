import { BaseScraper } from '../BaseScraper';
import { MatchData } from '../types';
import { logger } from '../../../utils/logger';

export class BwinScraper extends BaseScraper {
  name = 'bwin';
  url = 'https://www.bwin.co/es/sports/f%C3%BAtbol-4/apuestas/colombia-45/primera-a-apertura-102161';

  protected async extractMatches(): Promise<MatchData[]> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const matches: MatchData[] = [];

    try {
      await this.page.waitForSelector('div.grid-event-wrapper', { timeout: 20000 });

      const matchElements = await this.page.$$('div.grid-event-wrapper');
      logger.info(`${this.name}: Found ${matchElements.length} match rows`);

      for (const matchEl of matchElements) {
        try {
          // Team names — div.participant has a nested .participant-country span (empty)
          // textContent.trim() gives just the team name
          const teamNames = await matchEl.$$eval(
            'div.participant',
            (els) => els.map((el) => el.textContent?.trim() ?? '')
          );

          if (teamNames.length < 2) continue;

          const homeTeam = teamNames[0];
          const awayTeam = teamNames[1];

          // 1X2 odds — first ms-option-group contains 3 options (home, draw, away)
          const optionGroups = await matchEl.$$('ms-option-group');
          if (optionGroups.length < 1) continue;

          const oddsValues = await optionGroups[0].$$eval(
            'ms-option .option-value ms-font-resizer',
            (els) => els.map((el) => parseFloat(el.textContent?.trim() || '0'))
          );

          if (oddsValues.length < 3) continue;

          const homeOdds = oddsValues[0];
          const drawOdds = oddsValues[1];
          const awayOdds = oddsValues[2];

          if (homeOdds === 0) continue;

          // Over/Under 2.5 — look for ms-option elements where .option-attribute = "2.5"
          // (the listing page may show 1.5 or 2.5 depending on the match)
          const totalOdds = await matchEl.$$eval('ms-option', (options) => {
            const result: number[] = [];
            for (const opt of options) {
              const attr = opt.querySelector('.option-attribute')?.textContent?.trim();
              if (attr === '2.5') {
                const val = parseFloat(
                  opt.querySelector('.option-value ms-font-resizer')?.textContent?.trim() || '0'
                );
                result.push(val);
              }
            }
            return result;
          });

          const over25Odds = totalOdds[0] || null;
          const under25Odds = totalOdds[1] || null;

          // Date & time — "Mañana / 19:00" or "hoy / 19:00"
          const dateTimeStr = await matchEl
            .$eval('ms-prematch-timer', (el) => el.textContent?.trim() ?? '')
            .catch(() => '');

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

  private parseMatchDate(dateTimeStr: string): Date {
    try {
      // e.g. "Mañana / 19:00" or "hoy / 19:00" — extract the HH:MM time
      const now = new Date();
      const timeMatch = dateTimeStr.match(/(\d{1,2}:\d{2})$/);
      if (!timeMatch) return now;
      const parsed = new Date(`${now.toDateString()} ${timeMatch[1]}`);
      return isNaN(parsed.getTime()) ? now : parsed;
    } catch {
      return new Date();
    }
  }
}
