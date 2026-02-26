import { BaseScraper } from '../BaseScraper';
import { MatchData } from '../types';
import { logger } from '../../../utils/logger';

export class BetPlayScraper extends BaseScraper {
  name = 'BetPlay';
  url = 'https://betplay.com.co/apuestas#sports-hub/football/colombia/liga_betplay_dimayor';

  protected async extractMatches(): Promise<MatchData[]> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const matches: MatchData[] = [];

    try {
      // Wait for match list items to load
      await this.page.waitForSelector('li.KambiBC-sandwich-filter__event-list-item', {
        timeout: 15000,
      });

      const matchElements = await this.page.$$('li.KambiBC-sandwich-filter__event-list-item');
      logger.info(`${this.name}: Found ${matchElements.length} match rows`);

      for (const matchEl of matchElements) {
        try {
          // Team names — two elements: index 0 = home, 1 = away
          const teamNames = await matchEl.$$eval(
            '.KambiBC-event-participants__name-participant-name',
            (els) => els.map((el) => el.textContent?.trim() ?? '')
          );

          if (teamNames.length < 2) continue;

          const homeTeam = teamNames[0];
          const awayTeam = teamNames[1];

          // 1X2 odds buttons — only from the onecrosstwo section (not over/under)
          const oddsLabels = await matchEl.$$eval(
            '.KambiBC-bet-offer--onecrosstwo .KambiBC-betty-outcome',
            (buttons) => buttons.map((btn) => btn.getAttribute('aria-label') ?? '')
          );

          if (oddsLabels.length < 3) continue;

          // Parse odds from aria-label: "...en 3.15" → 3.15
          const parseOdds = (label: string): number => {
            const match = label.match(/en\s+([\d.]+)\s*$/i);
            return match ? parseFloat(match[1]) : 0;
          };

          const homeOdds = parseOdds(oddsLabels[0]);
          const drawOdds = parseOdds(oddsLabels[1]);
          const awayOdds = parseOdds(oddsLabels[2]);

          if (homeOdds === 0) continue;

          // Total goals (Más/Menos de 2.5) — from KambiBC-bet-offer--overunder section
          // aria-label: "...Total de goles - Más de 2.5 en 2.20"
          const totalGoalsLabels = await matchEl.$$eval(
            '.KambiBC-bet-offer--overunder .KambiBC-betty-outcome',
            (buttons) => buttons.map((btn) => btn.getAttribute('aria-label') ?? '')
          );

          const over25Odds = totalGoalsLabels[0] ? parseOdds(totalGoalsLabels[0]) : null;
          const under25Odds = totalGoalsLabels[1] ? parseOdds(totalGoalsLabels[1]) : null;

          // Date & time
          const dateStr = await matchEl.$eval(
            '.KambiBC-event-item__start-time--date',
            (el) => el.textContent?.trim() ?? ''
          ).catch(() => '');

          const timeStr = await matchEl.$eval(
            '.KambiBC-event-item__start-time--time',
            (el) => el.textContent?.trim() ?? ''
          ).catch(() => '');

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

  private parseMatchDate(dateStr: string, timeStr: string): Date {
    try {
      const cleanTime = timeStr.replace(/\u00a0/g, ' ').replace('p. m.', 'PM').replace('a. m.', 'AM');

      // Map Spanish day abbreviations to JS day numbers (0=Sun … 6=Sat)
      const DAY_MAP: Record<string, number> = {
        dom: 0, lun: 1, mar: 2, mié: 3, mie: 3, jue: 4, vie: 5, sáb: 6, sab: 6,
      };

      const normalizedDay = dateStr.toLowerCase().trim().replace(/[.\s]/g, '');
      const targetDow = DAY_MAP[normalizedDay];

      const now = new Date();

      if (targetDow !== undefined) {
        // Find the next (or same-day) occurrence of targetDow from today
        const currentDow = now.getDay();
        let daysAhead = targetDow - currentDow;
        if (daysAhead < 0) daysAhead += 7;
        const matchDate = new Date(now);
        matchDate.setDate(now.getDate() + daysAhead);
        const parsed = new Date(`${matchDate.toDateString()} ${cleanTime}`);
        return isNaN(parsed.getTime()) ? now : parsed;
      }

      // Fallback: use today with the parsed time
      const parsed = new Date(`${now.toDateString()} ${cleanTime}`);
      return isNaN(parsed.getTime()) ? now : parsed;
    } catch {
      return new Date();
    }
  }
}
