import { Router } from 'express';
import * as summaryController from './summary.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.use(requireAuth);
router.get('/', summaryController.getSummary);

export default router;
