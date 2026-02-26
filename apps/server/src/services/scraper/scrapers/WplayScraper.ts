import { BaseScraper } from '../BaseScraper';
import { MatchData } from '../types';
import { logger } from '../../../utils/logger';

export class WplayScraper extends BaseScraper {
  name = 'Wplay';
  url = 'https://apuestas.wplay.co/es/PrimeraAColombia';

  protected async extractMatches(): Promise<MatchData[]> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const matches: MatchData[] = [];

    try {
      // Step 1: Scrape main listing page for all matches + event IDs
      await this.page.waitForSelector('div.table-row.pager-item', { timeout: 15000 });

      const rawMatches = await this.page.$$eval('div.table-row.pager-item', (rows) => {
        return rows.map((row) => {
          // Team names
          const teamEls = row.querySelectorAll('td.seln:not(.seln_sort-D) .seln-name');
          const homeTeam = teamEls[0]?.textContent?.trim() ?? '';
          const awayTeam = teamEls[1]?.textContent?.trim() ?? '';

          // Decimal odds (home, draw, away)
          const allOdds = Array.from(row.querySelectorAll('.price.dec'))
            .map((el) => parseFloat((el as any).textContent?.trim() || '0'));

          // Event ID from the .ev div
          const evDiv = row.querySelector('[class*="ev-"]');
          const evId = evDiv?.className.match(/ev-(\d+)/)?.[1] ?? '';

          // Date/time
          const time = row.querySelector('.ev .time')?.textContent?.trim() ?? '';
          const date = row.querySelector('.ev .date')?.textContent?.trim() ?? '';

          return { homeTeam, awayTeam, homeOdds: allOdds[0], drawOdds: allOdds[1], awayOdds: allOdds[2], eventId: evId, date, time };
        }).filter((m) => m.homeTeam && m.awayTeam && m.homeOdds > 0 && m.eventId);
      });

      logger.info(`${this.name}: Found ${rawMatches.length} matches on main page`);

      // Step 2: For each match, visit detail page to get over/under 2.5
      for (const raw of rawMatches) {
        const detailUrl = `https://apuestas.wplay.co/es/e/${raw.eventId}?mkt_grp_code=GLSCR`;

        try {
          await this.page.goto(detailUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await this.page.waitForSelector('.price.dec', { timeout: 8000 }).catch(() => {});

          // Find "Más de (2.5)" and "Menos de (2.5)" buttons
          const totalGoals = await this.page.$$eval('button.price', (buttons) => {
            let over25 = 0;
            let under25 = 0;

            for (const btn of buttons) {
              const hcap = btn.querySelector('.seln-hcap')?.textContent?.trim();
              const name = btn.querySelector('.seln-name')?.textContent?.trim();
              const dec = parseFloat(btn.querySelector('.price.dec')?.textContent?.trim() || '0');

              if (hcap === '2.5' && name === 'Más de') over25 = dec;
              if (hcap === '2.5' && name === 'Menos de') under25 = dec;
            }

            return { over25, under25 };
          });

          matches.push({
            homeTeam: raw.homeTeam,
            awayTeam: raw.awayTeam,
            matchDate: this.parseMatchDate(raw.date, raw.time),
            league: 'Colombia - Primera A',
            odds: [
              {
                bookmaker: this.name,
                homeOdds: raw.homeOdds,
                drawOdds: raw.drawOdds,
                awayOdds: raw.awayOdds,
                over25Odds: totalGoals.over25 || null,
                under25Odds: totalGoals.under25 || null,
                scrapedAt: new Date(),
              },
            ],
          });

          logger.debug(`${this.name}: ${raw.homeTeam} vs ${raw.awayTeam} | O2.5=${totalGoals.over25} U2.5=${totalGoals.under25}`);
        } catch (err) {
          // If detail page fails, still save match with null total goals
          logger.debug(`${this.name}: Could not get total goals for ${raw.homeTeam} vs ${raw.awayTeam}`);
          matches.push({
            homeTeam: raw.homeTeam,
            awayTeam: raw.awayTeam,
            matchDate: this.parseMatchDate(raw.date, raw.time),
            league: 'Colombia - Primera A',
            odds: [
              {
                bookmaker: this.name,
                homeOdds: raw.homeOdds,
                drawOdds: raw.drawOdds,
                awayOdds: raw.awayOdds,
                over25Odds: null,
                under25Odds: null,
                scrapedAt: new Date(),
              },
            ],
          });
        }
      }
    } catch (error) {
      logger.error(`${this.name}: extractMatches failed`, error);
    }

    return matches;
  }

  private parseMatchDate(dateStr: string, timeStr: string): Date {
    try {
      const currentYear = new Date().getFullYear();
      const parsed = new Date(`${dateStr} ${currentYear} ${timeStr}`);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    } catch {
      return new Date();
    }
  }
}
