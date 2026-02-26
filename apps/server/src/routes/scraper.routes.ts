import { Router, Request, Response } from 'express';
import { orchestrator } from '../jobs/scraperCron';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/scraper/run — manually trigger all scrapers
router.post('/run', async (_req: Request, res: Response) => {
  logger.info('Manual scrape triggered via API');
  // Respond immediately so the HTTP connection doesn't time out
  res.json({ status: 'started', message: 'Scraping in progress — check logs for results' });

  try {
    const results = await orchestrator.runAll();
    const summary = results.map((r) => ({
      bookmaker: r.bookmaker,
      success: r.success,
      matchesFound: r.matchesFound,
      error: r.error,
    }));
    logger.info('Manual scrape complete', summary);
  } catch (err) {
    logger.error('Manual scrape error:', err);
  }
});

// GET /api/scraper/run — same but via GET for easy browser testing
router.get('/run', async (_req: Request, res: Response) => {
  logger.info('Manual scrape triggered via GET');
  res.json({ status: 'started', message: 'Scraping in progress — check server logs for results' });

  try {
    const results = await orchestrator.runAll();
    const summary = results.map((r) => ({
      bookmaker: r.bookmaker,
      success: r.success,
      matchesFound: r.matchesFound,
      error: r.error,
    }));
    logger.info('Manual scrape complete', summary);
  } catch (err) {
    logger.error('Manual scrape error:', err);
  }
});

export default router;
