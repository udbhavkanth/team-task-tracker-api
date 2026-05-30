import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';
import { AccessTokenPayload, RefreshTokenPayload } from '../types/auth.types';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.fromCode('TOKEN_EXPIRED');
    }
    throw AppError.fromCode('INVALID_TOKEN');
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.fromCode('TOKEN_EXPIRED');
    }
    throw AppError.fromCode('UNAUTHORIZED');
  }
}

export function getRefreshTokenExpiry(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return expiresAt;
}
