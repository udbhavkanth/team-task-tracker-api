import { Priority, TaskStatus } from '@prisma/client';

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  assigneeId: string | null;
  projectId: string;
  organizationId: string;
  dueDate: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedTasksMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedTasksResponse {
  data: TaskResponse[];
  meta: PaginatedTasksMeta;
}

export interface DeleteTaskResponse {
  message: string;
}
