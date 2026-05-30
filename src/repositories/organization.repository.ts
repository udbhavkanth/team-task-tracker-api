import { Organization } from '@prisma/client';
import { prisma } from '../config/database';

export class OrganizationRepository {
  async findById(id: string): Promise<Organization | null> {
    return prisma.organization.findUnique({ where: { id } });
  }
}

export const organizationRepository = new OrganizationRepository();
