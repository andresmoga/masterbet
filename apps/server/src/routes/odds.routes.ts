import { Router } from 'express';
import { getOddsComparison } from '../controllers/odds.controller';

const router = Router();

router.get('/comparison', getOddsComparison);

export default router;
