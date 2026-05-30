import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { AppError } from '../errors/AppError';
import { organizationRepository } from '../repositories/organization.repository';
import { refreshTokenRepository } from '../repositories/refresh-token.repository';
import { userRepository } from '../repositories/user.repository';
import {
  LoginInput,
  LogoutInput,
  RefreshInput,
  RegisterInput,
} from '../validators/auth.schema';
import {
  LoginResponse,
  LogoutResponse,
  RefreshResponse,
  UserResponse,
} from '../types/auth.types';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  verifyRefreshToken,
} from '../utils/jwt.util';

const BCRYPT_ROUNDS = 10;

export class AuthService {
  async register(input: RegisterInput): Promise<UserResponse> {
    const organization = await organizationRepository.findById(input.organizationId);
    if (!organization) {
      throw AppError.fromCode('ORGANIZATION_NOT_FOUND');
    }

    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw AppError.fromCode('USER_ALREADY_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      organization: { connect: { id: input.organizationId } },
    });

    return userRepository.toSafeUser(user);
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw AppError.fromCode('INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw AppError.fromCode('INVALID_CREDENTIALS');
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      jti: randomUUID(),
    });

    const refreshToken = await this.issueRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: userRepository.toSafeUser(user),
    };
  }

  async refresh(input: RefreshInput): Promise<RefreshResponse> {
    const payload = verifyRefreshToken(input.refreshToken);

    const storedToken = await refreshTokenRepository.findByToken(input.refreshToken);
    if (!storedToken) {
      throw AppError.fromCode('UNAUTHORIZED');
    }

    if (storedToken.id !== payload.tokenId) {
      throw AppError.fromCode('UNAUTHORIZED');
    }

    if (storedToken.isRevoked) {
      throw AppError.fromCode('TOKEN_REVOKED');
    }

    if (storedToken.expiresAt < new Date()) {
      throw AppError.fromCode('TOKEN_EXPIRED');
    }

    const user = await userRepository.findById(storedToken.userId);
    if (!user) {
      throw AppError.fromCode('UNAUTHORIZED');
    }

    await refreshTokenRepository.revokeById(storedToken.id);

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      jti : randomUUID(),
    });

    const newRefreshToken = await this.issueRefreshToken(user.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(input: LogoutInput): Promise<LogoutResponse> {
    const storedToken = await refreshTokenRepository.findByToken(input.refreshToken);
    if (storedToken && !storedToken.isRevoked) {
      await refreshTokenRepository.revokeById(storedToken.id);
    }

    return { message: 'Logged out successfully' };
  }

  private async issueRefreshToken(userId: string): Promise<string> {
    const expiresAt = getRefreshTokenExpiry();
    const provisionalToken = randomUUID();

    const record = await refreshTokenRepository.create({
      token: provisionalToken,
      userId,
      expiresAt,
    });

    const refreshToken = generateRefreshToken({
      userId,
      tokenId: record.id,
    });

    await refreshTokenRepository.updateToken(record.id, refreshToken);

    return refreshToken;
  }
}

export const authService = new AuthService();
