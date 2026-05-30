import { z } from 'zod';

const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);
const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: priorityEnum,
  status: taskStatusEnum.optional(),
  projectId: z.string().uuid('Invalid project ID'),
  assigneeId: z.string().uuid('Invalid assignee ID').optional().nullable(),
  dueDate: z.coerce.date().optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().optional(),
    priority: priorityEnum.optional(),
    assigneeId: z.string().uuid('Invalid assignee ID').optional().nullable(),
    dueDate: z.coerce.date().optional().nullable(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.priority !== undefined ||
      data.assigneeId !== undefined ||
      data.dueDate !== undefined,
    { message: 'At least one field must be provided for update' }
  );

export const listTaskQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: taskStatusEnum.optional(),
  priority: priorityEnum.optional(),
  assigneeId: z.string().uuid('Invalid assignee ID').optional(),
});

export const taskIdParamsSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
});

export const updateTaskStatusSchema = z.object({
  status: taskStatusEnum,
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTaskQuery = z.infer<typeof listTaskQuerySchema>;
export type TaskIdParams = z.infer<typeof taskIdParamsSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
