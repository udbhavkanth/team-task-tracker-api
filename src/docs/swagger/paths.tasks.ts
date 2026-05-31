/**
 * @openapi
 * /api/v1/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a task
 *     description: "**RBAC:** ADMIN, MANAGER only."
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Project or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   get:
 *     tags: [Tasks]
 *     summary: List tasks with pagination and filters
 *     description: |
 *       **RBAC:** ADMIN, MANAGER, MEMBER.
 *
 *       MEMBER users are automatically scoped to their own assigneeId server-side.
 *
 *       **Examples:**
 *       - `GET /api/v1/tasks?page=1&limit=10`
 *       - `GET /api/v1/tasks?status=TODO`
 *       - `GET /api/v1/tasks?priority=HIGH`
 *       - `GET /api/v1/tasks?assigneeId={uuid}`
 *
 *       Responses are cached in Redis (5 minute TTL) per organization and filter combination.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         example: 10
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/TaskStatus'
 *         example: TODO
 *       - in: query
 *         name: priority
 *         schema:
 *           $ref: '#/components/schemas/Priority'
 *         example: HIGH
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by assignee (ADMIN/MANAGER only; ignored for MEMBER)
 *     responses:
 *       200:
 *         description: Paginated task list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedTaskResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/v1/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task by ID
 *     description: "**RBAC:** ADMIN, MANAGER, MEMBER. MEMBER can only view assigned tasks."
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: MEMBER accessing unassigned task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     tags: [Tasks]
 *     summary: Update task fields
 *     description: |
 *       **RBAC:** ADMIN, MANAGER, MEMBER. MEMBER can only update assigned tasks.
 *
 *       Status cannot be changed via this endpoint — use `PATCH /api/v1/tasks/{id}/status`.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *     responses:
 *       200:
 *         description: Task updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task
 *     description: "**RBAC:** ADMIN only."
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Task deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               message: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/v1/tasks/{id}/status:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update task status (workflow transition)
 *     description: |
 *       **Permission:** Only the task assignee, MANAGER, or ADMIN can change task status.
 *
 *       **Allowed transitions:**
 *       - TODO → IN_PROGRESS
 *       - IN_PROGRESS → IN_REVIEW
 *       - IN_REVIEW → DONE
 *       - TODO → BLOCKED
 *       - IN_PROGRESS → BLOCKED
 *       - IN_REVIEW → BLOCKED
 *
 *       Invalid transitions return `400 INVALID_STATUS_TRANSITION`.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskStatusRequest'
 *           example:
 *             status: IN_PROGRESS
 *     responses:
 *       200:
 *         description: Task status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid status transition or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 400
 *               code: INVALID_STATUS_TRANSITION
 *               message: Invalid status transition
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: MEMBER is not the task assignee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export {};
