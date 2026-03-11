import { Router } from 'express';
import { getOddsComparison, triggerScrape } from '../controllers/odds.controller';

const router = Router();

router.get('/comparison', getOddsComparison);
router.post('/scrape', triggerScrape);

export default router;
