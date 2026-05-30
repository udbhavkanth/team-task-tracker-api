import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { ErrorCodes } from '../errors/errorCodes';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ZodError) {
    const { status, code, message } = ErrorCodes.VALIDATION_ERROR;
    res.status(status).json({
      status,
      code,
      message,
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      code: err.code,
      message: err.message,
      ...(err.details !== undefined && { details: err.details }),
    });
    return;
  }

  console.error('Unhandled error:', err);

  res.status(500).json({
    status: 500,
    code: 'INTERNAL_ERROR',
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
