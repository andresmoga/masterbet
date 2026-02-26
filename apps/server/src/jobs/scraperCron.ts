import cron from 'node-cron';
import { ScraperOrchestrator } from '../services/scraper';
import {
  WplayScraper,
  BetPlayScraper,
  BetssonScraper,
  BwinScraper,
  RushbetScraper,
  CodereScraper,
  BetanoScraper,
} from '../services/scraper/scrapers';
import { logger } from '../utils/logger';

const orchestrator = new ScraperOrchestrator();

// Register all scrapers
orchestrator.registerScraper(new WplayScraper());
orchestrator.registerScraper(new BetPlayScraper());
orchestrator.registerScraper(new BetssonScraper());
orchestrator.registerScraper(new BwinScraper());
orchestrator.registerScraper(new RushbetScraper());
orchestrator.registerScraper(new CodereScraper());
orchestrator.registerScraper(new BetanoScraper());

export function startScraperCron(): void {
  // Run every 5 minutes: '*/5 * * * *'
  // For testing, you can use '*/1 * * * *' for every minute
  const schedule = '*/5 * * * *';

  logger.info(`Starting scraper cron job with schedule: ${schedule}`);

  cron.schedule(schedule, async () => {
    logger.info('=== Starting scheduled scrape ===');

    try {
      const results = await orchestrator.runAll();

      const summary = results.map(r => ({
        bookmaker: r.bookmaker,
        success: r.success,
        matches: r.matchesFound,
      }));

      logger.info('=== Scrape complete ===', summary);
    } catch (error) {
      logger.error('Error in scheduled scrape:', error);
    }
  });

  logger.info('Scraper cron job started successfully');
}

// Export orchestrator for manual testing
export { orchestrator };
