import { TaskStatus } from '@prisma/client';

export const allowedTransitions: Record<TaskStatus, readonly TaskStatus[]> = {
  TODO: ['IN_PROGRESS', 'BLOCKED'],
  IN_PROGRESS: ['IN_REVIEW', 'BLOCKED'],
  IN_REVIEW: ['DONE', 'BLOCKED'],
  DONE: [],
  BLOCKED: [],
};

export function isValidStatusTransition(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) {
    return false;
  }
  return allowedTransitions[from].includes(to);
}
