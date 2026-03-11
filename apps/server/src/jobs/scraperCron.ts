import cron from 'node-cron';
import { ScraperOrchestrator } from '../services/scraper';
import { IScraper } from '../services/scraper/types';
import {
  WplayScraper,
  BetPlayScraper,
  BetssonScraper,
  BwinScraper,
  RushbetScraper,
  BetanoScraper,
  GoogleLeagueScraper,
} from '../services/scraper/scrapers';
import { logger } from '../utils/logger';

const orchestrator = new ScraperOrchestrator();

// Map from URL slug → list of scrapers for that league (populated below)
const leagueScraperMap = new Map<string, IScraper[]>();

// League canonical name → URL slug
const LEAGUE_SLUG: Record<string, string> = {
  'Colombia - Liga BetPlay Dimayor': 'liga-betplay',
  'CONMEBOL Libertadores': 'libertadores',
  'UEFA Champions League': 'champions',
  'UEFA Europa League': 'europa-league',
  'UEFA Conference League': 'conference-league',
  'Premier League': 'premier-league',
  'La Liga': 'la-liga',
  'Serie A': 'serie-a',
  'Bundesliga': 'bundesliga',
  'Ligue 1': 'ligue-1',
  'Copa del Mundo 2026': 'world-cup-2026',
};

function register(leagueName: string, scraper: IScraper): void {
  orchestrator.registerScraper(scraper);
  const slug = LEAGUE_SLUG[leagueName];
  if (slug) {
    if (!leagueScraperMap.has(slug)) leagueScraperMap.set(slug, []);
    leagueScraperMap.get(slug)!.push(scraper);
  }
}

// ── Google (event manager — runs first to build team list + fixture schedule) ─
// Standings URL → extracts official team roster for the league
// Fixtures URL  → extracts upcoming match schedule (no odds)
// Both are registered first so their team lists are ready when bookmakers run.
register(
  'Colombia - Liga BetPlay Dimayor',
  new GoogleLeagueScraper(
    'Colombia - Liga BetPlay Dimayor',
    'https://www.google.com/search?q=categoria+primera+a+tabla+posiciones&hl=es&gl=co',
    'https://www.google.com/search?q=categoria+primera+a+partidos+proximos&hl=es&gl=co'
  )
);
register(
  'UEFA Champions League',
  new GoogleLeagueScraper(
    'UEFA Champions League',
    'https://www.google.com/search?q=uefa+champions+league+table&hl=es&gl=co',
    'https://www.google.com/search?q=uefa+champions+league+matches&hl=es&gl=co'
  )
);
register(
  'CONMEBOL Libertadores',
  new GoogleLeagueScraper(
    'CONMEBOL Libertadores',
    'https://www.google.com/search?q=copa+libertadores+2026+equipos+participantes&hl=es&gl=co',
    'https://www.google.com/search?q=copa+libertadores+partidos&hl=es&gl=co'
  )
);
register(
  'UEFA Europa League',
  new GoogleLeagueScraper(
    'UEFA Europa League',
    'https://www.google.com/search?q=europa+league+standings&hl=es&gl=co',
    'https://www.google.com/search?q=europa+league+games&hl=es&gl=co'
  )
);
register(
  'UEFA Conference League',
  new GoogleLeagueScraper(
    'UEFA Conference League',
    'https://www.google.com/search?q=conference+league+standings&hl=es&gl=co',
    'https://www.google.com/search?q=conference+league+games&hl=es&gl=co'
  )
);
register(
  'La Liga',
  new GoogleLeagueScraper(
    'La Liga',
    'https://www.google.com/search?q=la+liga+espana+standings&hl=es&gl=co',
    'https://www.google.com/search?q=la+liga+espana+partidos&hl=es&gl=co'
  )
);
register(
  'Premier League',
  new GoogleLeagueScraper(
    'Premier League',
    'https://www.google.com/search?q=premier+league+standings&hl=es&gl=co',
    'https://www.google.com/search?q=premier+league+games&hl=es&gl=co'
  )
);
register(
  'Bundesliga',
  new GoogleLeagueScraper(
    'Bundesliga',
    'https://www.google.com/search?q=bundesliga+standings&hl=es&gl=co',
    'https://www.google.com/search?q=bundesliga+games&hl=es&gl=co'
  )
);
register(
  'Serie A',
  new GoogleLeagueScraper(
    'Serie A',
    'https://www.google.com/search?q=serie+a+table&hl=es&gl=co',
    'https://www.google.com/search?q=serie+a+italy+games&hl=es&gl=co'
  )
);
register(
  'Ligue 1',
  new GoogleLeagueScraper(
    'Ligue 1',
    'https://www.google.com/search?q=ligue+1+france+standings&hl=es&gl=co',
    'https://www.google.com/search?q=ligue+1+france+games&hl=es&gl=co'
  )
);

// ── Wplay ──────────────────────────────────────────────────────────────────
register('Colombia - Liga BetPlay Dimayor', new WplayScraper('Colombia - Liga BetPlay Dimayor', 'https://apuestas.wplay.co/es/PrimeraAColombia'));
register('CONMEBOL Libertadores', new WplayScraper('CONMEBOL Libertadores', 'https://apuestas.wplay.co/es/t/19462/Copa-Libertadores'));
register('UEFA Champions League', new WplayScraper('UEFA Champions League', 'https://apuestas.wplay.co/es/t/19161/UEFA-Champions-League'));
register('UEFA Europa League', new WplayScraper('UEFA Europa League', 'https://apuestas.wplay.co/es/t/19162/UEFA-Liga-Europa'));
register('UEFA Conference League', new WplayScraper('UEFA Conference League', 'https://apuestas.wplay.co/es/t/413776/UEFA-Europa-Conference-League'));
register('Premier League', new WplayScraper('Premier League', 'https://apuestas.wplay.co/es/t/19157/Inglaterra-Premier-League'));
register('La Liga', new WplayScraper('La Liga', 'https://apuestas.wplay.co/es/t/19160/La-Liga'));
register('Serie A', new WplayScraper('Serie A', 'https://apuestas.wplay.co/es/t/19159/Serie-A'));
register('Bundesliga', new WplayScraper('Bundesliga', 'https://apuestas.wplay.co/es/t/19158/Bundesliga-1'));
register('Ligue 1', new WplayScraper('Ligue 1', 'https://apuestas.wplay.co/es/t/19327/Ligue-1'));
register('Copa del Mundo 2026', new WplayScraper('Copa del Mundo 2026', 'https://apuestas.wplay.co/es/t/296772/World-Cup-2026-Matches'));

// ── BetPlay ────────────────────────────────────────────────────────────────
register('Colombia - Liga BetPlay Dimayor', new BetPlayScraper('Colombia - Liga BetPlay Dimayor', 'https://betplay.com.co/apuestas#sports-hub/football/colombia/liga_betplay_dimayor'));
register('CONMEBOL Libertadores', new BetPlayScraper('CONMEBOL Libertadores', 'https://betplay.com.co/apuestas#sports-hub/football/copa_libertadores'));
register('UEFA Champions League', new BetPlayScraper('UEFA Champions League', 'https://betplay.com.co/apuestas#sports-hub/football/champions_league'));
register('UEFA Europa League', new BetPlayScraper('UEFA Europa League', 'https://betplay.com.co/apuestas#sports-hub/football/europa_league'));
register('Premier League', new BetPlayScraper('Premier League', 'https://betplay.com.co/apuestas#sports-hub/football/england/premier_league'));
register('La Liga', new BetPlayScraper('La Liga', 'https://betplay.com.co/apuestas#sports-hub/football/spain/la_liga'));
register('Serie A', new BetPlayScraper('Serie A', 'https://betplay.com.co/apuestas#sports-hub/football/italy/serie_a'));
register('Bundesliga', new BetPlayScraper('Bundesliga', 'https://betplay.com.co/apuestas#sports-hub/football/germany/bundesliga'));
register('Ligue 1', new BetPlayScraper('Ligue 1', 'https://betplay.com.co/apuestas#sports-hub/football/france/ligue_1'));

// ── Rushbet ────────────────────────────────────────────────────────────────
register('Colombia - Liga BetPlay Dimayor', new RushbetScraper('Colombia - Liga BetPlay Dimayor', 'https://www.rushbet.co/?page=sportsbook#filter/football/colombia/liga_betplay_dimayor'));
register('CONMEBOL Libertadores', new RushbetScraper('CONMEBOL Libertadores', 'https://www.rushbet.co/?page=sportsbook#filter/football/copa_libertadores'));
register('UEFA Champions League', new RushbetScraper('UEFA Champions League', 'https://www.rushbet.co/?page=sportsbook#filter/football/champions_league'));
register('UEFA Europa League', new RushbetScraper('UEFA Europa League', 'https://www.rushbet.co/?page=sportsbook#filter/football/europa_league'));
register('UEFA Conference League', new RushbetScraper('UEFA Conference League', 'https://www.rushbet.co/?page=sportsbook#filter/football/conference_league'));
register('Premier League', new RushbetScraper('Premier League', 'https://www.rushbet.co/?page=sportsbook#filter/football/england/premier_league'));
register('La Liga', new RushbetScraper('La Liga', 'https://www.rushbet.co/?page=sportsbook#filter/football/[spain]/[[la_liga]]'));
register('Serie A', new RushbetScraper('Serie A', 'https://www.rushbet.co/?page=sportsbook#filter/football/[italy]/[[serie_a]]'));
register('Bundesliga', new RushbetScraper('Bundesliga', 'https://www.rushbet.co/?page=sportsbook#filter/football/germany/bundesliga'));
register('Ligue 1', new RushbetScraper('Ligue 1', 'https://www.rushbet.co/?page=sportsbook#filter/football/france/ligue_1'));
register('Copa del Mundo 2026', new RushbetScraper('Copa del Mundo 2026', 'https://www.rushbet.co/?page=sportsbook#filter/football/world_cup_2026'));

// ── Betsson ────────────────────────────────────────────────────────────────
register('Colombia - Liga BetPlay Dimayor', new BetssonScraper('Colombia - Liga BetPlay Dimayor', 'https://www.betsson.co/apuestas-deportivas/futbol/colombia/colombia-primera-a?tab=liveAndUpcoming'));
register('CONMEBOL Libertadores', new BetssonScraper('CONMEBOL Libertadores', 'https://www.betsson.co/apuestas-deportivas/futbol/copa-libertadores/copa-libertadores?tab=liveAndUpcoming'));
register('UEFA Champions League', new BetssonScraper('UEFA Champions League', 'https://www.betsson.co/apuestas-deportivas/futbol/champions-league/uefa-champions-league?tab=liveAndUpcoming'));
register('UEFA Europa League', new BetssonScraper('UEFA Europa League', 'https://www.betsson.co/apuestas-deportivas/futbol/europa-league/uefa-europa-league?tab=liveAndUpcoming'));
register('UEFA Conference League', new BetssonScraper('UEFA Conference League', 'https://www.betsson.co/apuestas-deportivas/futbol/conference-league/uefa-conference-league?tab=liveAndUpcoming'));
register('Premier League', new BetssonScraper('Premier League', 'https://www.betsson.co/apuestas-deportivas/futbol/inglaterra/inglaterra-premier-league?tab=liveAndUpcoming'));
register('La Liga', new BetssonScraper('La Liga', 'https://www.betsson.co/apuestas-deportivas/futbol/espana/espana-la-liga?tab=liveAndUpcoming'));
register('Serie A', new BetssonScraper('Serie A', 'https://www.betsson.co/apuestas-deportivas/futbol/italia/italia-serie-a?tab=liveAndUpcoming'));
register('Bundesliga', new BetssonScraper('Bundesliga', 'https://www.betsson.co/apuestas-deportivas/futbol/alemania/alemania-bundesliga?tab=liveAndUpcoming'));
register('Ligue 1', new BetssonScraper('Ligue 1', 'https://www.betsson.co/apuestas-deportivas/futbol/francia/francia-ligue-1?tab=liveAndUpcoming'));
register('Copa del Mundo 2026', new BetssonScraper('Copa del Mundo 2026', 'https://www.betsson.co/apuestas-deportivas/futbol/mundial/copa-del-mundo?tab=liveAndUpcoming'));

// ── bwin ───────────────────────────────────────────────────────────────────
register('Colombia - Liga BetPlay Dimayor', new BwinScraper('Colombia - Liga BetPlay Dimayor', 'https://www.bwin.co/es/sports/f%C3%BAtbol-4/apuestas/colombia-45/primera-a-apertura-102161'));
register('CONMEBOL Libertadores', new BwinScraper('CONMEBOL Libertadores', 'https://www.bwin.co/es/sports/f%C3%BAtbol-4/apuestas/sudam%C3%A9rica-42/conmebol-libertadores-0:15'));
register('UEFA Champions League', new BwinScraper('UEFA Champions League', 'https://www.bwin.co/es/sports/f%C3%BAtbol-4/apuestas/europa-7/uefa-champions-league-102855'));
register('UEFA Europa League', new BwinScraper('UEFA Europa League', 'https://www.bwin.co/es/sports/f%C3%BAtbol-4/apuestas/europa-7/uefa-europa-league-102856'));
register('UEFA Conference League', new BwinScraper('UEFA Conference League', 'https://www.bwin.co/es/sports/f%C3%BAtbol-4/apuestas/europa-7/conference-league-102919'));
register('Premier League', new BwinScraper('Premier League', 'https://www.bwin.co/es/sports/f%C3%BAtbol-4/apuestas/inglaterra-14/premier-league-102841'));
register('La Liga', new BwinScraper('La Liga', 'https://www.bwin.co/es/sports/f%C3%BAtbol-4/apuestas/espa%C3%B1a-28/laliga-102829'));
register('Serie A', new BwinScraper('Serie A', 'https://www.bwin.co/es/sports/f%C3%BAtbol-4/apuestas/italia-20/serie-a-102846'));
register('Bundesliga', new BwinScraper('Bundesliga', 'https://www.bwin.co/es/sports/f%C3%BAtbol-4/apuestas/alemania-17/bundesliga-102842'));
register('Ligue 1', new BwinScraper('Ligue 1', 'https://www.bwin.co/es/sports/f%C3%BAtbol-4/apuestas/francia-16/ligue-1-102843'));
register('Copa del Mundo 2026', new BwinScraper('Copa del Mundo 2026', 'https://www.bwin.co/es/sports/f%C3%BAtbol-4/apuestas/mundo-6/mundial-2026-0:14'));

// ── Codere ─────────────────────────────────────────────────────────────────
// Temporarily disabled — scraping approach differs; causing league mix-ups
// register('Colombia - Liga BetPlay Dimayor', new CodereScraper('Colombia - Liga BetPlay Dimayor', 'Primera A'));
// register('CONMEBOL Libertadores', new CodereScraper('CONMEBOL Libertadores', 'Copa Libertadores'));
// register('UEFA Champions League', new CodereScraper('UEFA Champions League', 'Champions League'));
// register('UEFA Europa League', new CodereScraper('UEFA Europa League', 'Europa League'));

// ── Betano ─────────────────────────────────────────────────────────────────
register('Colombia - Liga BetPlay Dimayor', new BetanoScraper('Colombia - Liga BetPlay Dimayor', 'https://www.betano.co/sport/futbol/colombia/categoria-primera-a/16940/'));
register('CONMEBOL Libertadores', new BetanoScraper('CONMEBOL Libertadores', 'https://www.betano.co/sport/futbol/campeonatos/copa-libertadores/189817/'));
register('UEFA Champions League', new BetanoScraper('UEFA Champions League', 'https://www.betano.co/sport/futbol/campeonatos/champions-league/188566/'));
register('UEFA Conference League', new BetanoScraper('UEFA Conference League', 'https://www.betano.co/sport/futbol/campeonatos/conference-league/189602/'));
register('Premier League', new BetanoScraper('Premier League', 'https://www.betano.co/sport/futbol/inglaterra/premier-league/1/'));
register('La Liga', new BetanoScraper('La Liga', 'https://www.betano.co/sport/futbol/espana/laliga/5/'));
register('Serie A', new BetanoScraper('Serie A', 'https://www.betano.co/sport/futbol/italia/serie-a/1635/'));
register('Bundesliga', new BetanoScraper('Bundesliga', 'https://www.betano.co/sport/futbol/alemania/bundesliga/216/'));
register('Ligue 1', new BetanoScraper('Ligue 1', 'https://www.betano.co/sport/futbol/campeonatos/francia/23/?sl=215'));
register('Copa del Mundo 2026', new BetanoScraper('Copa del Mundo 2026', 'https://www.betano.co/sport/futbol/campeonatos/mundial/189813/'));

// Track in-progress on-demand scrapes to avoid duplicate concurrent runs
const scrapingInProgress = new Set<string>();

/**
 * Trigger a scrape for a specific league on demand.
 * Returns immediately — scraping runs in background.
 * No-ops if a scrape for this slug is already running.
 */
export function triggerLeagueScrape(slug: string): boolean {
  const scrapers = leagueScraperMap.get(slug);
  if (!scrapers || scrapers.length === 0) {
    logger.warn(`triggerLeagueScrape: no scrapers found for slug "${slug}"`);
    return false;
  }

  if (scrapingInProgress.has(slug)) {
    logger.info(`triggerLeagueScrape: scrape already running for "${slug}", skipping`);
    return false;
  }

  scrapingInProgress.add(slug);
  logger.info(`triggerLeagueScrape: starting on-demand scrape for "${slug}" (${scrapers.length} scrapers)`);

  // Run Google scraper first so knownLeagueTeams is populated before bookmakers save.
  const googleScrapers = scrapers.filter((s) => (s as { name?: string }).name === 'Google');
  const bookmakerScrapers = scrapers.filter((s) => (s as { name?: string }).name !== 'Google');

  const run = async () => {
    if (googleScrapers.length > 0) {
      await orchestrator.runScrapers(googleScrapers);
    }
    return orchestrator.runScrapers(bookmakerScrapers);
  };

  run()
    .then((results) => {
      const ok = results.filter((r) => r.success).length;
      logger.info(`triggerLeagueScrape: "${slug}" done — ${ok}/${results.length} succeeded`);
    })
    .catch((err) => {
      logger.error(`triggerLeagueScrape: "${slug}" failed`, err);
    })
    .finally(() => {
      scrapingInProgress.delete(slug);
    });

  return true;
}

// ── Scraper groups by tier ───────────────────────────────────────────────────
// Each group collects all scrapers (Google + bookmakers) for a set of leagues.
function scrapersForSlugs(...slugs: string[]): IScraper[] {
  return slugs.flatMap((slug) => leagueScraperMap.get(slug) ?? []);
}

const GROUPS = {
  // All Google scrapers — refresh team lists + upcoming fixtures
  google: scrapersForSlugs(
    'liga-betplay', 'libertadores', 'champions', 'europa-league',
    'conference-league', 'premier-league', 'la-liga', 'serie-a',
    'bundesliga', 'ligue-1'
  ).filter((s) => (s as { name?: string }).name === 'Google'),

  // Colombia — default landing page, highest priority
  colombia: scrapersForSlugs('liga-betplay')
    .filter((s) => (s as { name?: string }).name !== 'Google'),

  // UEFA competitions — European match windows
  european: scrapersForSlugs('champions', 'europa-league', 'conference-league')
    .filter((s) => (s as { name?: string }).name !== 'Google'),

  // South American competition
  southAmerica: scrapersForSlugs('libertadores')
    .filter((s) => (s as { name?: string }).name !== 'Google'),

  // Top 5 European leagues
  big5: scrapersForSlugs('premier-league', 'la-liga', 'serie-a', 'bundesliga', 'ligue-1')
    .filter((s) => (s as { name?: string }).name !== 'Google'),
};

async function runGroup(name: string, scrapers: IScraper[]): Promise<void> {
  if (scrapers.length === 0) return;
  logger.info(`[cron] Starting "${name}" group (${scrapers.length} scrapers)`);
  try {
    const results = await orchestrator.runScrapers(scrapers);
    const ok = results.filter((r) => r.success).length;
    logger.info(`[cron] "${name}" done — ${ok}/${results.length} succeeded`);
  } catch (err) {
    logger.error(`[cron] "${name}" failed`, err);
  }
}

export function startScraperCron(): void {
  // ── Startup warm-up: Google first, then Colombia ───────────────────────────
  // Run immediately on server start so the default page has data right away.
  setTimeout(() => {
    runGroup('startup:google', GROUPS.google)
      .then(() => runGroup('startup:colombia', GROUPS.colombia));
  }, 5000); // 5s delay to let the server finish initializing

  // ── Daily morning refresh: all Google scrapers at 06:00 ───────────────────
  // Refreshes team rosters and fixture lists for all leagues.
  cron.schedule('0 6 * * *', () => runGroup('daily:google', GROUPS.google), { timezone: 'America/Bogota' });

  // ── Liga BetPlay (Colombia) — 4× daily during active hours ───────────────
  // 10:00, 14:00, 18:00, 21:00 Colombia time
  for (const hour of [10, 14, 18, 21]) {
    cron.schedule(`0 ${hour} * * *`, () => runGroup('colombia', GROUPS.colombia), { timezone: 'America/Bogota' });
  }

  // ── UEFA (Champions / Europa / Conference) — 3× daily ────────────────────
  // 11:00, 17:00, 21:00 Colombia time (covers pre-match + evening kick-offs)
  for (const hour of [11, 17, 21]) {
    cron.schedule(`0 ${hour} * * *`, () => runGroup('european', GROUPS.european), { timezone: 'America/Bogota' });
  }

  // ── CONMEBOL Libertadores — 3× daily ─────────────────────────────────────
  // 16:00, 20:00, 23:00 Colombia time
  for (const hour of [16, 20, 23]) {
    cron.schedule(`0 ${hour} * * *`, () => runGroup('southAmerica', GROUPS.southAmerica), { timezone: 'America/Bogota' });
  }

  // ── Big 5 European leagues — 3× daily ────────────────────────────────────
  // 08:00, 15:00, 21:00 Colombia time
  for (const hour of [8, 15, 21]) {
    cron.schedule(`0 ${hour} * * *`, () => runGroup('big5', GROUPS.big5), { timezone: 'America/Bogota' });
  }

  logger.info('[cron] Tiered scraper schedule started (timezone: America/Bogota)');
  logger.info('[cron] Groups: google(06:00), colombia(10/14/18/21), european(11/17/21), southAmerica(16/20/23), big5(08/15/21)');
}

/**
 * Run a single scraper by slug + bookmaker name and return the raw result.
 * Does NOT save to DB — only for debugging.
 * bookmaker is matched case-insensitively against scraper.name.
 */
export async function debugRunScraper(slug: string, bookmaker: string): Promise<{ found: boolean; result?: unknown; error?: string }> {
  const scrapers = leagueScraperMap.get(slug);
  if (!scrapers || scrapers.length === 0) {
    return { found: false, error: `No scrapers registered for slug "${slug}"` };
  }

  const target = scrapers.find(
    (s) => (s as { name?: string }).name?.toLowerCase() === bookmaker.toLowerCase()
  );

  if (!target) {
    const names = scrapers.map((s) => (s as { name?: string }).name ?? '?');
    return { found: false, error: `No scraper named "${bookmaker}" for slug "${slug}". Available: ${names.join(', ')}` };
  }

  try {
    const result = await target.scrape();
    return { found: true, result };
  } catch (err) {
    return { found: true, error: err instanceof Error ? err.message : String(err) };
  }
}

// Export orchestrator for manual testing
export { orchestrator };
