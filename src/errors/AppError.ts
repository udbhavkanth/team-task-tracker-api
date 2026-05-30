import { ErrorCodeKey, ErrorCodes } from './errorCodes';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    isOperational = true,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static fromCode(key: ErrorCodeKey, details?: unknown): AppError {
    const { code, status, message } = ErrorCodes[key];
    return new AppError(message, status, code, true, details);
  }
}
