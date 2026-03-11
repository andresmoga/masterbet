import { Router } from 'express';
import { getOddsComparison, getScraperStatus, getTeamMap, debugScraper, triggerScrape } from '../controllers/odds.controller';

const router = Router();

router.get('/comparison', getOddsComparison);
router.get('/status', getScraperStatus);
router.get('/team-map', getTeamMap);
router.get('/debug-scraper', debugScraper);
router.get('/scrape', triggerScrape);
router.post('/scrape', triggerScrape);

export default router;
