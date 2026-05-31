/**
 * Task list cache key strategy:
 * tasks:{organizationId}:{assigneeSegment}:status{status|ALL}:priority{priority|ALL}:page{N}:limit{N}
 *
 * - organizationId: tenant isolation (required)
 * - assigneeSegment: effective assignee UUID, or "all" when unfiltered (ADMIN/MANAGER)
 * - status/priority: filter value or "ALL" when omitted
 *
 * Invalidation: organization-wide pattern delete (tasks:{organizationId}:*)
 * after any task create, update, delete, assignee change, or status change.
 */
import { Priority, TaskStatus } from '@prisma/client';
import { cacheService } from '../services/cache.service';

export const TASK_LIST_CACHE_TTL = 300;
export const TASK_LIST_CACHE_PREFIX = 'tasks';

export interface TaskListCacheKeyParams {
  organizationId: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: Priority;
  page: number;
  limit: number;
}

export function buildTaskListCacheKey(params: TaskListCacheKeyParams): string {
  const assigneeSegment = params.assigneeId ?? 'all';
  const statusSegment = params.status ?? 'ALL';
  const prioritySegment = params.priority ?? 'ALL';

  return [
    TASK_LIST_CACHE_PREFIX,
    params.organizationId,
    assigneeSegment,
    `status${statusSegment}`,
    `priority${prioritySegment}`,
    `page${params.page}`,
    `limit${params.limit}`,
  ].join(':');
}

export async function invalidateTaskListCache(organizationId: string): Promise<void> {
  await cacheService.deleteByPattern(`${TASK_LIST_CACHE_PREFIX}:${organizationId}:*`);
}
