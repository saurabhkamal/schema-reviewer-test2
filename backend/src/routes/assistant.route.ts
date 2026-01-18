import { Router, Request, Response } from 'express';
import { sendMessageController } from '../controllers/assistant.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Info endpoint - shows available routes
router.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Assistant API - Available endpoints',
    endpoints: {
      'POST /api/v1/assistant/message': 'Send a message to the AI assistant (requires authentication)',
    },
    note: 'All endpoints require authentication. Include JWT token in Authorization header.',
  });
});

router.post('/message', authenticate, sendMessageController);

export default router;

