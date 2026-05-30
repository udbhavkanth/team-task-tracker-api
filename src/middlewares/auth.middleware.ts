import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { verifyAccessToken } from '../utils/jwt.util';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.fromCode('ACCESS_TOKEN_REQUIRED');
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw AppError.fromCode('ACCESS_TOKEN_REQUIRED');
    }

    const payload = verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
    };

    next();
  } catch (error) {
    next(error);
  }
};
