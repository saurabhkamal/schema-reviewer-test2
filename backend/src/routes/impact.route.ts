import { Router } from 'express';
import {
  getImpactScoreController,
  getRankedIssuesController,
} from '../controllers/impact.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/score/:snapshotId', authenticate, getImpactScoreController);

router.get('/rank/:snapshotId', authenticate, getRankedIssuesController);

export default router;

