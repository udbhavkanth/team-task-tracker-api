import { Priority, Prisma, Task, TaskStatus } from '@prisma/client';
import { prisma } from '../config/database';

export interface CreateTaskData {
  title: string;
  description?: string | null;
  priority: Priority;
  status?: TaskStatus;
  projectId: string;
  organizationId: string;
  assigneeId?: string | null;
  createdBy: string;
  dueDate?: Date | null;
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  priority?: Priority;
  assigneeId?: string | null;
  dueDate?: Date | null;
}

export interface FindManyPaginatedParams {
  organizationId: string;
  page: number;
  limit: number;
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
}

export interface PaginatedTasksResult {
  tasks: Task[];
  total: number;
}

export class TaskRepository {
  async createTask(data: CreateTaskData): Promise<Task> {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        priority: data.priority,
        status: data.status,
        projectId: data.projectId,
        organizationId: data.organizationId,
        assigneeId: data.assigneeId ?? null,
        createdBy: data.createdBy,
        dueDate: data.dueDate ?? null,
      },
    });
  }

  async findById(id: string, organizationId: string): Promise<Task | null> {
    return prisma.task.findFirst({
      where: { id, organizationId },
    });
  }

  async findManyPaginated(params: FindManyPaginatedParams): Promise<PaginatedTasksResult> {
    const where: Prisma.TaskWhereInput = {
      organizationId: params.organizationId,
      ...(params.status !== undefined && { status: params.status }),
      ...(params.priority !== undefined && { priority: params.priority }),
      ...(params.assigneeId !== undefined && { assigneeId: params.assigneeId }),
    };

    const skip = (params.page - 1) * params.limit;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total };
  }

  async updateTask(id: string, organizationId: string, data: UpdateTaskData): Promise<Task> {
    return prisma.task.update({
      where: { id, organizationId },
      data,
    });
  }

  async updateTaskStatus(
    id: string,
    organizationId: string,
    status: TaskStatus
  ): Promise<Task> {
    return prisma.task.update({
      where: { id, organizationId },
      data: { status },
    });
  }

  async deleteTask(id: string, organizationId: string): Promise<Task> {
    return prisma.task.delete({
      where: { id, organizationId },
    });
  }
}

export const taskRepository = new TaskRepository();
