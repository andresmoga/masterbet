import { BaseScraper } from '../BaseScraper';
import { MatchData } from '../types';
import { logger } from '../../../utils/logger';

export class CodereScraper extends BaseScraper {
  name = 'Codere';
  url = 'https://m.codere.com.co/deportesCol/#/EventoPage';

  // Spanish month abbreviations → English for Date parsing
  private readonly monthMap: Record<string, string> = {
    Ene: 'Jan', Feb: 'Feb', Mar: 'Mar', Abr: 'Apr',
    May: 'May', Jun: 'Jun', Jul: 'Jul', Ago: 'Aug',
    Sep: 'Sep', Oct: 'Oct', Nov: 'Nov', Dic: 'Dec',
  };

  protected async extractMatches(): Promise<MatchData[]> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const matches: MatchData[] = [];

    try {
      await this.page.waitForSelector('div.game-row', { timeout: 20000 });

      const matchElements = await this.page.$$('div.game-row');
      logger.info(`${this.name}: Found ${matchElements.length} match rows`);

      for (const matchEl of matchElements) {
        try {
          // Team names — two <p> inside .participants div
          const teamNames = await matchEl.$$eval(
            '.participants p',
            (els) => els.map((el) => el.textContent?.trim() ?? '')
          );

          if (teamNames.length < 2) continue;

          const homeTeam = teamNames[0];
          const awayTeam = teamNames[1];

          // Extract all result buttons at once (efficient single $$eval)
          // Codere uses comma as decimal separator: "1,43" → replace with "."
          const buttonData = await matchEl.$$eval('sports-result-button', (btns) =>
            btns.map((btn) => ({
              name: btn.querySelector('.sp-button-text-name')?.textContent?.trim() ?? '',
              oddsRaw: btn.querySelector('.sp-button-text-odds')?.textContent?.trim() ?? '',
            }))
          );

          let homeOdds = 0;
          let drawOdds: number | null = null;
          let awayOdds: number | null = null;
          let over25Odds: number | null = null;
          let under25Odds: number | null = null;

          for (const { name, oddsRaw } of buttonData) {
            const odds = parseFloat(oddsRaw.replace(',', '.'));
            if (name === '1') homeOdds = odds;
            else if (name === 'X') drawOdds = odds;
            else if (name === '2') awayOdds = odds;
            else if (name === 'Más 2.5') over25Odds = odds;
            else if (name === 'Menos 2.5') under25Odds = odds;
          }

          if (homeOdds === 0) continue;

          // Date/time — "Hoy 19:30", "Mañana 20:30", "28 Feb 16:10", "1 Mar 14:00"
          const dateTimeStr = await matchEl
            .$eval('p.sp-font-size-sm', (el) => el.textContent?.trim() ?? '')
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
      // e.g. "Hoy 19:30", "Mañana 20:30", "28 Feb 16:10", "1 Mar 14:00"
      const now = new Date();
      const timeMatch = dateTimeStr.match(/(\d{1,2}:\d{2})$/);
      if (!timeMatch) return now;
      const time = timeMatch[1];

      if (/hoy/i.test(dateTimeStr)) {
        const parsed = new Date(`${now.toDateString()} ${time}`);
        return isNaN(parsed.getTime()) ? now : parsed;
      }

      if (/ma[ñn]ana/i.test(dateTimeStr)) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const parsed = new Date(`${tomorrow.toDateString()} ${time}`);
        return isNaN(parsed.getTime()) ? now : parsed;
      }

      // Absolute: "28 Feb 16:10" — translate Spanish month to English
      let normalized = dateTimeStr.replace(time, '').trim();
      for (const [es, en] of Object.entries(this.monthMap)) {
        normalized = normalized.replace(new RegExp(es, 'i'), en);
      }
      const parsed = new Date(`${normalized} ${now.getFullYear()} ${time}`);
      return isNaN(parsed.getTime()) ? now : parsed;
    } catch {
      return new Date();
    }
  }
}
