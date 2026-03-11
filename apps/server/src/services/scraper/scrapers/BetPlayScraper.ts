import { chromium } from 'playwright';
import { BaseScraper } from '../BaseScraper';
import { MatchData } from '../types';
import { logger } from '../../../utils/logger';

export class BetPlayScraper extends BaseScraper {
  name = 'BetPlay';
  // BaseScraper navigates to this.url — we set it to the base URL (no hash) so the
  // SPA loads cleanly. afterNavigate then changes the hash client-side.
  url = 'https://betplay.com.co/apuestas';
  protected readonly leagueName: string;
  private readonly targetHash: string; // the #sports-hub/... part for this league

  constructor(
    leagueName = 'Colombia - Liga BetPlay Dimayor',
    fullUrl = 'https://betplay.com.co/apuestas#sports-hub/football/colombia/liga_betplay_dimayor'
  ) {
    super();
    this.leagueName = leagueName;
    const hashIndex = fullUrl.indexOf('#');
    this.targetHash = hashIndex !== -1 ? fullUrl.slice(hashIndex + 1) : '';
  }

  // Override initBrowser to use stealth context (same as Google scraper) so BetPlay
  // doesn't detect headless Chrome and close the connection mid-navigation.
  protected override async initBrowser(): Promise<void> {
    this.browser = await chromium.launch({
      headless: process.env.SCRAPER_HEADLESS !== 'false',
      args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
    });
    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 },
      locale: 'es-CO',
      timezoneId: 'America/Bogota',
    });
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });
    this.page = await context.newPage();
  }

  // Two-step navigation: load the base URL first, then route via client-side hash change.
  // Navigating directly to a deep hash URL triggers BetPlay's anti-bot detection and
  // closes the page mid-navigation. Loading the shell first avoids that.
  protected override async afterNavigate(): Promise<void> {
    if (!this.page) return;

    // Step 1: wait for the SPA shell to be ready (networkidle on base URL)
    await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {
      logger.warn(`${this.name}: networkidle timeout on base load`);
    });

    // Step 2: change the hash client-side so the Kambi SPA routes to this league
    if (this.targetHash) {
      await this.page.evaluate((h) => { window.location.hash = h; }, this.targetHash);
      logger.info(`${this.name}: navigated to hash "#${this.targetHash}" for "${this.leagueName}"`);

      // Wait for the SPA to re-render competition-specific events after hash change
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await this.page.waitForTimeout(2000);
    }
  }

  protected async extractMatches(): Promise<MatchData[]> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const matches: MatchData[] = [];

    try {
      // Wait for match list items — use a non-throwing wait so we can log diagnostics
      // on timeout rather than letting the outer catch swallow the detail.
      const appeared = await this.page
        .waitForSelector('li.KambiBC-sandwich-filter__event-list-item', { timeout: 30000 })
        .then(() => true)
        .catch(() => false);

      if (!appeared) {
        const currentUrl = this.page.url();
        const title = await this.page.title().catch(() => 'unknown');
        logger.warn(
          `${this.name}: match items never appeared after 30s for "${this.leagueName}". ` +
          `URL: ${currentUrl} | Title: ${title}`
        );
        return matches;
      }

      // BetPlay is a Kambi SPA — the hash route filters events client-side.
      // Events are grouped under competition headers; we only want the group
      // whose header matches our target league.  Walk all groups and collect
      // elements only from the matching one (fall back to all if none found).
      const groups = await this.page.$$('[class*="KambiBC-event-group"]');

      let matchElements: Awaited<ReturnType<typeof this.page.$$>>;

      if (groups.length > 0) {
        const targetNeedle = this.leagueName.toLowerCase();

        let targetGroup = null;
        for (const group of groups) {
          const headerText = await group
            .$eval('[class*="header"], [class*="Header"], [class*="title"], h1, h2, h3', (el) =>
              el.textContent?.trim() ?? ''
            )
            .catch(() => '');

          logger.debug(`${this.name}: group header "${headerText}"`);

          const normalizedHeader = headerText.toLowerCase();
          if (
            normalizedHeader.includes('liga betplay') ||
            normalizedHeader.includes('primera a') ||
            normalizedHeader.includes(targetNeedle) ||
            normalizedHeader.includes('copa libertadores') ||
            normalizedHeader.includes('libertadores')
          ) {
            targetGroup = group;
            break;
          }
        }

        if (targetGroup) {
          matchElements = await targetGroup.$$('li.KambiBC-sandwich-filter__event-list-item');
          logger.info(`${this.name}: Filtered to ${matchElements.length} rows in "${this.leagueName}" group`);
        } else {
          // No matching group header found — return empty to avoid cross-league contamination.
          // (Falling back to all rows on the page risks mixing matches from other competitions.)
          logger.warn(`${this.name}: No group header matched "${this.leagueName}" — skipping to avoid contamination`);
          return matches;
        }
      } else {
        matchElements = await this.page.$$('li.KambiBC-sandwich-filter__event-list-item');
        logger.info(`${this.name}: Found ${matchElements.length} match rows (no group containers)`);
      }

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
            league: this.leagueName,
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
