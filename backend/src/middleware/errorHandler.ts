import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  status: string;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? 'error' : 'fail';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ZodError) {
    const statusCode = 400;
    logger.warn('Validation error', { errors: err.errors });
    res.status(statusCode).json({
      status: 'fail',
      message: 'Validation error',
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';
    logger.error('Application error', { message: err.message, statusCode });
    res.status(statusCode).json({
      status,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  logger.error('Unexpected error', { message: err.message, stack: err.stack });
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

