import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from '../errors/AppError';

export const authorize =
  (allowedRoles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.fromCode('UNAUTHORIZED'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(AppError.fromCode('FORBIDDEN'));
      return;
    }

    next();
  };
