import { Router } from 'express';
import {
  getSchemaController,
  getMetricsController,
  getTimeSeriesController,
  getDistributionController,
  getTopNController,
} from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);
router.use(authorize('ADMIN', 'DEVELOPER', 'VIEWER'));

// Get database schema
router.post('/schema', getSchemaController);

// Get summary metrics
router.post('/metrics', getMetricsController);

// Get time-series data
router.post('/time-series', getTimeSeriesController);

// Get category distribution
router.post('/distribution', getDistributionController);

// Get top-N entities
router.post('/top-n', getTopNController);

export default router;
