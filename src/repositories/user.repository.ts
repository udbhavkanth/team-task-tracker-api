import { Prisma, User } from '@prisma/client';
import { prisma } from '../config/database';
import { UserResponse } from '../types/auth.types';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByIdInOrganization(id: string, organizationId: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id, organizationId },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  toSafeUser(user: User): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}

export const userRepository = new UserRepository();
