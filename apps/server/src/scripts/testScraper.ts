/**
 * Manual test script for the scraper service
 * Run with: npx tsx src/scripts/testScraper.ts
 */

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

async function testScrapers() {
  logger.info('=== Starting Manual Scraper Test ===');

  const orchestrator = new ScraperOrchestrator();

  // Register all scrapers
  orchestrator.registerScraper(new WplayScraper());
  orchestrator.registerScraper(new BetPlayScraper());
  orchestrator.registerScraper(new BetssonScraper());
  orchestrator.registerScraper(new BwinScraper());
  orchestrator.registerScraper(new RushbetScraper());
  orchestrator.registerScraper(new CodereScraper());
  orchestrator.registerScraper(new BetanoScraper());

  try {
    const results = await orchestrator.runAll();

    console.log('\n=== RESULTS ===\n');

    for (const result of results) {
      console.log(`\n${result.bookmaker}:`);
      console.log(`  Success: ${result.success}`);
      console.log(`  Matches Found: ${result.matchesFound}`);

      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }

      if (result.matches.length > 0) {
        console.log(`  Sample Match:`);
        const sample = result.matches[0];
        console.log(`    ${sample.homeTeam} vs ${sample.awayTeam}`);
        console.log(`    Odds: ${sample.odds[0]?.homeOdds} / ${sample.odds[0]?.drawOdds} / ${sample.odds[0]?.awayOdds}`);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalMatches = results.reduce((sum, r) => sum + r.matchesFound, 0);

    console.log(`\n=== SUMMARY ===`);
    console.log(`Successful Scrapers: ${successCount}/${results.length}`);
    console.log(`Total Matches: ${totalMatches}`);

  } catch (error) {
    logger.error('Test failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

testScrapers();
