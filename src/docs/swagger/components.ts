/**
 * @openapi
 * components:
 *   schemas:
 *     Role:
 *       type: string
 *       enum: [ADMIN, MANAGER, MEMBER]
 *       description: User role for RBAC
 *
 *     Priority:
 *       type: string
 *       enum: [LOW, MEDIUM, HIGH]
 *       description: Task priority level
 *
 *     TaskStatus:
 *       type: string
 *       enum: [TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED]
 *       description: Task workflow status
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           $ref: '#/components/schemas/Role'
 *
 *     ProjectSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *
 *     Project:
 *       allOf:
 *         - $ref: '#/components/schemas/ProjectSummary'
 *         - type: object
 *           properties:
 *             organizationId:
 *               type: string
 *               format: uuid
 *             createdBy:
 *               type: string
 *               format: uuid
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         priority:
 *           $ref: '#/components/schemas/Priority'
 *         status:
 *           $ref: '#/components/schemas/TaskStatus'
 *         assigneeId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         projectId:
 *           type: string
 *           format: uuid
 *         organizationId:
 *           type: string
 *           format: uuid
 *         dueDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdBy:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     PaginatedTaskMeta:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         total:
 *           type: integer
 *           example: 42
 *         totalPages:
 *           type: integer
 *           example: 5
 *
 *     PaginatedTaskResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *         meta:
 *           $ref: '#/components/schemas/PaginatedTaskMeta'
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: JWT access token (15 minute expiry)
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token (7 day expiry)
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     RefreshResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *
 *     MessageResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *
 *     HealthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: ok
 *         message:
 *           type: string
 *           example: Server is running
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           example: 400
 *         code:
 *           type: string
 *           example: VALIDATION_ERROR
 *         message:
 *           type: string
 *           example: Validation failed
 *
 *     ValidationErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             errors:
 *               type: object
 *               additionalProperties:
 *                 type: array
 *                 items:
 *                   type: string
 *
 *     RegisterRequest:
 *       type: object
 *       required: [name, email, password, role, organizationId]
 *       properties:
 *         name:
 *           type: string
 *           example: Jane Doe
 *         email:
 *           type: string
 *           format: email
 *           example: jane@example.com
 *         password:
 *           type: string
 *           minLength: 8
 *           example: password123
 *         role:
 *           $ref: '#/components/schemas/Role'
 *         organizationId:
 *           type: string
 *           format: uuid
 *
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: jane@example.com
 *         password:
 *           type: string
 *           example: password123
 *
 *     RefreshRequest:
 *       type: object
 *       required: [refreshToken]
 *       properties:
 *         refreshToken:
 *           type: string
 *
 *     CreateProjectRequest:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           example: Backend API
 *         description:
 *           type: string
 *           example: Core API project
 *
 *     UpdateProjectRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *         description:
 *           type: string
 *
 *     CreateTaskRequest:
 *       type: object
 *       required: [title, priority, projectId]
 *       properties:
 *         title:
 *           type: string
 *           example: Implement caching
 *         description:
 *           type: string
 *         priority:
 *           $ref: '#/components/schemas/Priority'
 *         status:
 *           $ref: '#/components/schemas/TaskStatus'
 *         projectId:
 *           type: string
 *           format: uuid
 *         assigneeId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         dueDate:
 *           type: string
 *           format: date-time
 *
 *     UpdateTaskRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         priority:
 *           $ref: '#/components/schemas/Priority'
 *         assigneeId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         dueDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     UpdateTaskStatusRequest:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           $ref: '#/components/schemas/TaskStatus'
 */

export {};
