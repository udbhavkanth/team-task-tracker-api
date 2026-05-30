import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
  organizationId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }

    interface Locals {
      /** Zod-validated query (Express 5 req.query is read-only) */
      validatedQuery?: unknown;
    }
  }
}

export {};
