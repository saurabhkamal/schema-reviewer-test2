import { Router } from 'express';
import { sendMessageController } from '../controllers/assistant.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/message', authenticate, sendMessageController);

export default router;

