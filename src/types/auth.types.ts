import { Role } from '@prisma/client';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: Role;
  organizationId: string;
  jti: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutResponse {
  message: string;
}
