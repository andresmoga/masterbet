import { BaseScraper } from '../BaseScraper';
import { MatchData } from '../types';
import { logger } from '../../../utils/logger';
import { ScraperOrchestrator } from '../ScraperOrchestrator';

export class GoogleLeagueScraper extends BaseScraper {
  name = 'Google';
  url: string; // standings search URL → used for team extraction
  protected readonly leagueName: string;
  private readonly fixturesUrl: string;

  constructor(leagueName: string, standingsUrl: string, fixturesUrl: string) {
    super();
    this.leagueName = leagueName;
    this.url = standingsUrl;
    this.fixturesUrl = fixturesUrl;
  }

  // Google renders everything via JS — wait for network to settle after navigation
  protected override async afterNavigate(): Promise<void> {
    if (!this.page) return;
    await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {
      logger.warn(`${this.name}: networkidle timeout on standings page`);
    });
  }

  protected async extractMatches(): Promise<MatchData[]> {
    if (!this.page) throw new Error('Page not initialized');

    // ── Phase 1: extract team names from standings ───────────────────────────
    const teams = await this.extractTeamsFromPage();
    if (teams.size > 0) {
      ScraperOrchestrator.updateKnownTeams(this.leagueName, teams);
      logger.info(`${this.name}: registered ${teams.size} teams for "${this.leagueName}"`);
    } else {
      logger.warn(`${this.name}: no teams found on standings page for "${this.leagueName}"`);
    }

    // ── Phase 2: navigate to fixtures and extract upcoming matches ───────────
    const matches: MatchData[] = [];

    try {
      await this.page.goto(this.fixturesUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {
        logger.warn(`${this.name}: networkidle timeout on fixtures page`);
      });

      // Try to find match rows — Google sports panels use a few different patterns
      const fixtureMatches = await this.extractFixturesFromPage();
      matches.push(...fixtureMatches);

      logger.info(`${this.name}: extracted ${matches.length} upcoming fixtures for "${this.leagueName}"`);
    } catch (error) {
      logger.error(`${this.name}: fixtures page failed`, error);
    }

    return matches;
  }

  // ── Team extraction ─────────────────────────────────────────────────────────
  // Supports two Google formats:
  //   Format A — standings table:  tr[data-team-mid] with aria-label (Liga Betplay, UCL…)
  //   Format B — team list page:   ul.KsbFXc li.dF3vjf  "Country: Team1, Team2…" (Libertadores)
  private async extractTeamsFromPage(): Promise<Set<string>> {
    const teams = new Set<string>();
    if (!this.page) return teams;

    try {
      await this.page.waitForSelector('tr[data-team-mid], ul.KsbFXc', {
        timeout: 15000,
      }).catch(() => {});

      // ── Format A: standings table ──────────────────────────────────────────
      const rows = await this.page.$$('tr[data-team-mid]');
      for (const row of rows) {
        const ariaLabel = await row.getAttribute('aria-label').catch(() => null);
        if (ariaLabel?.trim()) {
          teams.add(ariaLabel.trim());
          continue;
        }
        const nameEl = await row.$('span.ellipsisize, span.hsKSJe').catch(() => null);
        if (nameEl) {
          const text = await nameEl.textContent().catch(() => null);
          if (text?.trim()) teams.add(text.trim());
        }
      }

      if (teams.size > 0) return teams;

      // ── Format B: "Country: Team1, Team2, …" list (e.g. Libertadores) ──────
      const listItems = await this.page.$$('ul.KsbFXc li.dF3vjf');
      for (const item of listItems) {
        // Linked team names
        const links = await item.$$('a.H23r4e');
        for (const link of links) {
          const text = await link.textContent().catch(() => null);
          if (text?.trim()) teams.add(text.trim());
        }

        // Plain-text team names (after the "Country: " prefix)
        const fullText = await item
          .$eval('span.T286Pc', (el) => el.textContent?.trim() ?? '')
          .catch(() => '');
        const afterColon = fullText.split(':').slice(1).join(':').trim();
        if (afterColon) {
          afterColon
            .split(',')
            .map((t) => t.replace(/\.$/, '').trim())
            .filter((t) => t.length > 0)
            .forEach((name) => teams.add(name));
        }
      }
    } catch (error) {
      logger.warn(`${this.name}: extractTeamsFromPage error`, error);
    }

    return teams;
  }

  // ── Fixtures extraction ─────────────────────────────────────────────────────
  // Selectors confirmed from Google Sports knowledge panel HTML:
  //   Match container : div.imso-loa[data-start-time]  ← ISO date in attribute
  //   Team name       : div.xNfnlf                      ← first = home, second = away
  //   Finished marker : span[aria-label="FT"]           ← skip played matches
  private async extractFixturesFromPage(): Promise<MatchData[]> {
    const matches: MatchData[] = [];
    if (!this.page) return matches;

    try {
      await this.page.waitForSelector('div.imso-loa[data-start-time], div.imso-loa[data-df-match-mid]', {
        timeout: 15000,
      }).catch(() => {});

      const matchEls = await this.page.$$('div.imso-loa[data-start-time]');
      logger.info(`${this.name}: found ${matchEls.length} match elements on fixtures page`);

      for (const el of matchEls) {
        try {
          // Skip already-played matches (FT, AET, etc.)
          const isFinished = await el.$('span[aria-label="FT"], span[aria-label="AET"], .imspo_mt__fin-s').catch(() => null);
          if (isFinished) continue;

          // ISO date from data-start-time attribute — e.g. "2026-03-10T17:45:00Z"
          const startTime = await el.getAttribute('data-start-time').catch(() => null);
          const matchDate = startTime ? new Date(startTime) : new Date();

          // Team names: two div.xNfnlf elements (home first, away second)
          const nameEls = await el.$$('div.xNfnlf');
          if (nameEls.length < 2) {
            // Fallback: aria-hidden spans inside div.ellipsisize[data-df-team-mid]
            const spanEls = await el.$$('div.ellipsisize[data-df-team-mid] span[aria-hidden="true"]');
            if (spanEls.length < 2) continue;
            const homeTeam = (await spanEls[0].textContent())?.trim() ?? '';
            const awayTeam = (await spanEls[1].textContent())?.trim() ?? '';
            if (!homeTeam || !awayTeam) continue;
            matches.push({ homeTeam, awayTeam, matchDate, league: this.leagueName, odds: [] });
            continue;
          }

          const homeTeam = (await nameEls[0].textContent())?.trim() ?? '';
          const awayTeam = (await nameEls[1].textContent())?.trim() ?? '';
          if (!homeTeam || !awayTeam) continue;

          matches.push({ homeTeam, awayTeam, matchDate, league: this.leagueName, odds: [] });
        } catch (e) {
          logger.debug(`${this.name}: error parsing match element`, e);
        }
      }
    } catch (error) {
      logger.warn(`${this.name}: extractFixturesFromPage error`, error);
    }

    return matches;
  }

}

