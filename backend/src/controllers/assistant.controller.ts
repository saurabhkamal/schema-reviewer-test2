import { Response } from 'express';
import { sendMessage } from '../services/assistant.service';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

export const sendMessageController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, databaseName, conversationId } = req.body;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new AppError('Message is required', 400);
    }

    // Validate message length (max 5000 characters)
    if (message.length > 5000) {
      throw new AppError('Message is too long. Maximum length is 5000 characters', 400);
    }

    // Validate conversationId format if provided
    if (conversationId && (typeof conversationId !== 'string' || conversationId.trim().length === 0)) {
      throw new AppError('Invalid conversationId format', 400);
    }

    // Validate databaseName format if provided
    if (databaseName && (typeof databaseName !== 'string' || databaseName.trim().length === 0)) {
      throw new AppError('Invalid databaseName format', 400);
    }

    const userId = req.user?.userId;

    logger.info('Processing assistant message', {
      messageLength: message.length,
      hasDatabase: !!databaseName,
      hasConversationId: !!conversationId,
      hasUserId: !!userId,
    });

    const response = await sendMessage(
      message.trim(),
      databaseName?.trim(),
      conversationId?.trim(),
      userId
    );

    res.json({
      status: 'success',
      data: response,
    });
  } catch (error) {
    // Log the error for debugging
    logger.error('Error in sendMessageController', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // If it's already an AppError, let it propagate
    if (error instanceof AppError) {
      throw error;
    }

    // For unexpected errors, wrap in AppError
    throw new AppError(
      `Failed to process assistant message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
};

