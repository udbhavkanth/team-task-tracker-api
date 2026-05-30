import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
});

export const updateProjectSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters').optional(),
    description: z.string().optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: 'At least one field must be provided for update',
  });

export const projectIdParamsSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectIdParams = z.infer<typeof projectIdParamsSchema>;
