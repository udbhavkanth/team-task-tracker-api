import { Role, Task } from '@prisma/client';
import { isValidStatusTransition } from '../config/taskStatusTransitions';
import { AppError } from '../errors/AppError';
import { projectRepository } from '../repositories/project.repository';
import { taskRepository } from '../repositories/task.repository';
import { userRepository } from '../repositories/user.repository';
import { cacheService } from '../services/cache.service';
import { AuthenticatedUser } from '../types/express';
import {
  DeleteTaskResponse,
  PaginatedTasksResponse,
  TaskResponse,
} from '../types/task.types';
import {
  buildTaskListCacheKey,
  invalidateTaskListCache,
  TASK_LIST_CACHE_TTL,
} from '../utils/taskListCache.util';
import {
  CreateTaskInput,
  ListTaskQuery,
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from '../validators/task.validator';

export class TaskService {
  async create(user: AuthenticatedUser, input: CreateTaskInput): Promise<TaskResponse> {
    const project = await projectRepository.findById(input.projectId, user.organizationId);
    if (!project) {
      throw AppError.fromCode('PROJECT_NOT_FOUND');
    }

    if (input.assigneeId) {
      const assignee = await userRepository.findByIdInOrganization(
        input.assigneeId,
        user.organizationId
      );
      if (!assignee) {
        throw AppError.fromCode('USER_NOT_FOUND');
      }
    }

    const task = await taskRepository.createTask({
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
      status: input.status,
      projectId: input.projectId,
      organizationId: user.organizationId,
      assigneeId: input.assigneeId ?? null,
      createdBy: user.userId,
      dueDate: input.dueDate ?? null,
    });

    await invalidateTaskListCache(user.organizationId);

    return this.toTaskResponse(task);
  }

  async list(user: AuthenticatedUser, query: ListTaskQuery): Promise<PaginatedTasksResponse> {
    const assigneeId =
      user.role === Role.MEMBER ? user.userId : query.assigneeId;

    const cacheKey = buildTaskListCacheKey({
      organizationId: user.organizationId,
      assigneeId,
      status: query.status,
      priority: query.priority,
      page: query.page,
      limit: query.limit,
    });

    const cached = await cacheService.get<PaginatedTasksResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const { tasks, total } = await taskRepository.findManyPaginated({
      organizationId: user.organizationId,
      page: query.page,
      limit: query.limit,
      status: query.status,
      priority: query.priority,
      assigneeId,
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);

    const response: PaginatedTasksResponse = {
      data: tasks.map((task) => this.toTaskResponse(task)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };

    await cacheService.set(cacheKey, response, TASK_LIST_CACHE_TTL);

    return response;
  }

  async getById(user: AuthenticatedUser, id: string): Promise<TaskResponse> {
    const task = await this.findTaskOrThrow(id, user.organizationId);
    this.assertMemberTaskAccess(user, task);
    return this.toTaskResponse(task);
  }

  async update(
    user: AuthenticatedUser,
    id: string,
    input: UpdateTaskInput
  ): Promise<TaskResponse> {
    const existing = await this.findTaskOrThrow(id, user.organizationId);
    this.assertMemberTaskAccess(user, existing);

    if (input.assigneeId) {
      const assignee = await userRepository.findByIdInOrganization(
        input.assigneeId,
        user.organizationId
      );
      if (!assignee) {
        throw AppError.fromCode('USER_NOT_FOUND');
      }
    }

    const task = await taskRepository.updateTask(id, user.organizationId, {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
    });

    await invalidateTaskListCache(user.organizationId);

    return this.toTaskResponse(task);
  }

  async updateStatus(
    user: AuthenticatedUser,
    id: string,
    input: UpdateTaskStatusInput
  ): Promise<TaskResponse> {
    const existing = await this.findTaskOrThrow(id, user.organizationId);
    this.assertStatusChangePermission(user, existing);

    if (!isValidStatusTransition(existing.status, input.status)) {
      throw AppError.fromCode('INVALID_STATUS_TRANSITION');
    }

    const task = await taskRepository.updateTaskStatus(
      id,
      user.organizationId,
      input.status
    );

    await invalidateTaskListCache(user.organizationId);

    return this.toTaskResponse(task);
  }

  async delete(user: AuthenticatedUser, id: string): Promise<DeleteTaskResponse> {
    await this.findTaskOrThrow(id, user.organizationId);
    await taskRepository.deleteTask(id, user.organizationId);
    await invalidateTaskListCache(user.organizationId);
    return { message: 'Task deleted successfully' };
  }

  private async findTaskOrThrow(id: string, organizationId: string): Promise<Task> {
    const task = await taskRepository.findById(id, organizationId);
    if (!task) {
      throw AppError.fromCode('TASK_NOT_FOUND');
    }
    return task;
  }

  private assertMemberTaskAccess(user: AuthenticatedUser, task: Task): void {
    if (user.role === Role.MEMBER && task.assigneeId !== user.userId) {
      throw AppError.fromCode('FORBIDDEN');
    }
  }

  private assertStatusChangePermission(user: AuthenticatedUser, task: Task): void {
    if (user.role === Role.ADMIN || user.role === Role.MANAGER) {
      return;
    }

    if (task.assigneeId === user.userId) {
      return;
    }

    throw AppError.fromCode('FORBIDDEN');
  }

  private toTaskResponse(task: Task): TaskResponse {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      assigneeId: task.assigneeId,
      projectId: task.projectId,
      organizationId: task.organizationId,
      dueDate: task.dueDate,
      createdBy: task.createdBy,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}

export const taskService = new TaskService();
