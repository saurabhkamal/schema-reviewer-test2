import { Router } from 'express';
import {
  ingestSchemaController,
  getSchemaController,
  getSnapshotController,
  getAllSnapshotsController,
  compareSchemasController,
  deleteSnapshotController,
  deleteAllSnapshotsController,
} from '../controllers/schema.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { schemaIngestSchema, compareSchemasSchema } from '../utils/validation';

const router = Router();

router.post(
  '/ingest',
  authenticate,
  authorize('ADMIN', 'DEVELOPER', 'VIEWER'),
  validate(schemaIngestSchema),
  ingestSchemaController
);

router.get('/:dbName', authenticate, getSchemaController);

router.get('/snapshot/:snapshotId', authenticate, getSnapshotController);

router.get('/', authenticate, getAllSnapshotsController);

router.post(
  '/compare',
  authenticate,
  validate(compareSchemasSchema),
  compareSchemasController
);

router.delete(
  '/snapshot/:snapshotId',
  authenticate,
  authorize('ADMIN', 'DEVELOPER'),
  deleteSnapshotController
);

router.delete(
  '/all',
  authenticate,
  authorize('ADMIN', 'DEVELOPER'),
  deleteAllSnapshotsController
);

export default router;

