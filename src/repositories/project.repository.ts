import { Project } from '@prisma/client';
import { prisma } from '../config/database';

export interface CreateProjectData {
  name: string;
  description?: string | null;
  organizationId: string;
  createdBy: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string | null;
}

export class ProjectRepository {
  async createProject(data: CreateProjectData): Promise<Project> {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        organizationId: data.organizationId,
        createdBy: data.createdBy,
      },
    });
  }

  async findById(id: string, organizationId: string): Promise<Project | null> {
    return prisma.project.findFirst({
      where: { id, organizationId },
    });
  }

  async findAllByOrganization(organizationId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateProject(
    id: string,
    organizationId: string,
    data: UpdateProjectData
  ): Promise<Project> {
    return prisma.project.update({
      where: { id, organizationId },
      data,
    });
  }

  async deleteProject(id: string, organizationId: string): Promise<Project> {
    return prisma.project.delete({
      where: { id, organizationId },
    });
  }
}

export const projectRepository = new ProjectRepository();
