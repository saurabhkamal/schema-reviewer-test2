import { Response } from 'express';
import { sendMessage } from '../services/assistant.service';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';

export const sendMessageController = async (req: AuthRequest, res: Response): Promise<void> => {
  const { message, databaseName, conversationId } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new AppError('Message is required', 400);
  }

  const response = await sendMessage(message.trim(), databaseName, conversationId);

  res.json({
    status: 'success',
    data: response,
  });
};

