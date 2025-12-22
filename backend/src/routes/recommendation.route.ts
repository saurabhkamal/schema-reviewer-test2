import { Router } from 'express';
import {
  generateRecommendationsController,
  getIssueRecommendationsController,
  getSnapshotRecommendationsController,
} from '../controllers/recommendation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/generate/:issueId', authenticate, generateRecommendationsController);

router.get('/issue/:issueId', authenticate, getIssueRecommendationsController);

router.get('/snapshot/:snapshotId', authenticate, getSnapshotRecommendationsController);

export default router;

