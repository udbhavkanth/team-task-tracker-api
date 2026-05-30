import { Project } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { projectRepository } from '../repositories/project.repository';
import { AuthenticatedUser } from '../types/express';
import {
  DeleteProjectResponse,
  ProjectDetail,
  ProjectSummary,
} from '../types/project.types';
import {
  CreateProjectInput,
  UpdateProjectInput,
} from '../validators/project.validator';

export class ProjectService {
  async create(user: AuthenticatedUser, input: CreateProjectInput): Promise<ProjectDetail> {
    const project = await projectRepository.createProject({
      name: input.name,
      description: input.description ?? null,
      organizationId: user.organizationId,
      createdBy: user.userId,
    });

    return this.toProjectDetail(project);
  }

  async list(user: AuthenticatedUser): Promise<ProjectSummary[]> {
    const projects = await projectRepository.findAllByOrganization(user.organizationId);
    return projects.map((project) => this.toProjectSummary(project));
  }

  async getById(user: AuthenticatedUser, id: string): Promise<ProjectSummary> {
    const project = await this.findProjectOrThrow(id, user.organizationId);
    return this.toProjectSummary(project);
  }

  async update(
    user: AuthenticatedUser,
    id: string,
    input: UpdateProjectInput
  ): Promise<ProjectDetail> {
    await this.findProjectOrThrow(id, user.organizationId);

    const project = await projectRepository.updateProject(id, user.organizationId, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
    });

    return this.toProjectDetail(project);
  }

  async delete(user: AuthenticatedUser, id: string): Promise<DeleteProjectResponse> {
    await this.findProjectOrThrow(id, user.organizationId);
    await projectRepository.deleteProject(id, user.organizationId);
    return { message: 'Project deleted successfully' };
  }

  private async findProjectOrThrow(id: string, organizationId: string): Promise<Project> {
    const project = await projectRepository.findById(id, organizationId);
    if (!project) {
      throw AppError.fromCode('PROJECT_NOT_FOUND');
    }
    return project;
  }

  private toProjectSummary(project: Project): ProjectSummary {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
    };
  }

  private toProjectDetail(project: Project): ProjectDetail {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      organizationId: project.organizationId,
      createdBy: project.createdBy,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}

export const projectService = new ProjectService();
