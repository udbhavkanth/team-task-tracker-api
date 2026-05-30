import { RefreshToken } from '@prisma/client';
import { prisma } from '../config/database';

export interface CreateRefreshTokenData {
  token: string;
  userId: string;
  expiresAt: Date;
}

export class RefreshTokenRepository {
  async create(data: CreateRefreshTokenData): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  async updateToken(id: string, token: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { id },
      data: { token },
    });
  }

  async revokeById(id: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { id },
      data: { isRevoked: true },
    });
  }

  async revokeByToken(token: string): Promise<RefreshToken | null> {
    const existing = await this.findByToken(token);
    if (!existing) {
      return null;
    }
    return this.revokeById(existing.id);
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
