# Team Task Tracker API

A production-oriented REST API for multi-tenant team task management. Supports JWT authentication, role-based access control (RBAC), project and task CRUD, a server-enforced task status workflow, Redis-backed task list caching, and interactive OpenAPI documentation.

**Interactive docs:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Features](#3-features)
4. [Database Schema](#4-database-schema)
5. [Authentication Flow](#5-authentication-flow)
6. [RBAC Matrix](#6-rbac-matrix)
7. [Project APIs](#7-project-apis)
8. [Task APIs](#8-task-apis)
9. [Task Workflow Rules](#9-task-workflow-rules)
10. [Redis Caching Strategy](#10-redis-caching-strategy)
11. [Swagger Documentation](#11-swagger-documentation)
12. [Design Decisions](#12-design-decisions)
13. [Local Setup](#13-local-setup)
14. [Docker Setup](#14-docker-setup)
15. [Environment Variables](#15-environment-variables)
16. [API Examples](#16-api-examples)
17. [Testing Instructions](#17-testing-instructions)

---

## 1. Project Overview

The **Team Task Tracker API** is a backend service that lets organizations manage projects and tasks with strict tenant isolation, role-based permissions, and a controlled task lifecycle. Each user belongs to one organization; all data access is scoped by `organizationId` derived from the JWT — never from the request body.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20+ |
| Language | TypeScript |
| HTTP | Express 5 |
| Database | PostgreSQL 16 + Prisma ORM 6 |
| Cache | Redis 7 |
| Validation | Zod |
| Auth | JWT (access + refresh), bcrypt |
| API Docs | swagger-jsdoc + swagger-ui-express (OpenAPI 3.0) |
| Containerization | Docker & Docker Compose |

---

## 2. Architecture

The application follows a **layered clean architecture**. Business logic lives in services; repositories handle database access only; controllers are thin HTTP adapters.

```
Routes → Controllers → Services → Repositories → Prisma (PostgreSQL)
                              ↘ CacheService → Redis (task list only)
```

| Layer | Responsibility |
|-------|----------------|
| **Routes** | HTTP endpoints, middleware chain (auth, RBAC, validation) |
| **Controllers** | Parse request, call service, send response |
| **Services** | Business rules, org isolation, workflow, caching |
| **Repositories** | Prisma queries only |
| **Config** | Env validation, DB/Redis clients, Swagger setup |

### Request lifecycle

```mermaid
sequenceDiagram
  participant Client
  participant Route
  participant Auth as authenticate
  participant RBAC as authorize
  participant Validate as validate
  participant Controller
  participant Service
  participant Repo as Repository
  participant DB as PostgreSQL

  Client->>Route: HTTP request
  Route->>Auth: Bearer JWT
  Auth->>RBAC: req.user
  RBAC->>Validate: role check
  Validate->>Controller: parsed body/query/params
  Controller->>Service: business call
  Service->>Repo: data access
  Repo->>DB: Prisma query
  DB-->>Client: JSON response
```

### Project structure

```
src/
├── app.ts                      # Express setup, Swagger, routes
├── server.ts                   # Boot, Redis connect, graceful shutdown
├── config/
│   ├── env.ts                  # Zod-validated environment
│   ├── database.ts             # Prisma client
│   ├── redis.ts                # Redis client
│   ├── swagger.ts              # OpenAPI / Swagger UI setup
│   └── taskStatusTransitions.ts
├── controllers/
├── services/
│   ├── auth.service.ts
│   ├── project.service.ts
│   ├── task.service.ts
│   └── cache.service.ts
├── repositories/
├── middlewares/
│   ├── auth.middleware.ts
│   ├── authorize.middleware.ts
│   ├── validate.middleware.ts
│   └── error.middleware.ts
├── routes/
├── validators/
├── utils/
│   ├── jwt.util.ts
│   └── taskListCache.util.ts
├── types/
├── errors/
├── docs/swagger/               # OpenAPI JSDoc annotations
└── prisma/
    ├── schema.prisma
    └── migrations/
```

`app.ts` configures middleware and mounts routes. `server.ts` connects Redis, starts the HTTP server, and handles `SIGTERM` / `SIGINT` shutdown.

---

## 3. Features

| Phase | Capability |
|-------|------------|
| 1 | Express foundation, security middleware, Docker Compose, health check |
| 2 | Prisma schema (Organization, User, Project, Task, RefreshToken) |
| 3 | JWT authentication — register, login, refresh rotation, logout |
| 4 | RBAC middleware (`ADMIN`, `MANAGER`, `MEMBER`) |
| 5 | Project CRUD with organization isolation |
| 6 | Task CRUD with pagination and filters |
| 7 | Server-enforced task status transition engine |
| 8 | Redis cache-aside for `GET /api/v1/tasks` with invalidation |
| 10 | Swagger UI at `/api-docs`, OpenAPI JSON at `/api-docs.json` |

---

## 4. Database Schema

All tenant data is scoped by `organizationId`. UUIDs are used for primary keys.

### Entity relationship

```mermaid
erDiagram
  Organization ||--o{ User : has
  Organization ||--o{ Project : has
  Organization ||--o{ Task : has
  User ||--o{ RefreshToken : has
  User ||--o{ Task : assigns
  User ||--o{ Task : creates
  User ||--o{ Project : creates
  Project ||--o{ Task : contains

  Organization {
    uuid id PK
    string name
  }
  User {
    uuid id PK
    string email UK
    enum role
    uuid organizationId FK
  }
  Project {
    uuid id PK
    string name
    uuid organizationId FK
    uuid createdBy FK
  }
  Task {
    uuid id PK
    enum status
    enum priority
    uuid organizationId FK
    uuid projectId FK
    uuid assigneeId FK
    uuid createdBy FK
  }
  RefreshToken {
    uuid id PK
    string token UK
    uuid userId FK
    boolean isRevoked
  }
```

### Models

| Model | Purpose |
|-------|---------|
| **Organization** | Top-level tenant |
| **User** | Authenticated user with role; belongs to one org |
| **Project** | Project container within an org |
| **Task** | Work item linked to project; optional assignee |
| **RefreshToken** | Persisted refresh tokens for rotation and revocation |

### Enums

| Enum | Values |
|------|--------|
| **Role** | `ADMIN`, `MANAGER`, `MEMBER` |
| **Priority** | `LOW`, `MEDIUM`, `HIGH` |
| **TaskStatus** | `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `BLOCKED` |

### Task indexes

Indexes on `Task`: `status`, `assigneeId`, `dueDate`, `organizationId`, `projectId`, `createdBy`, and composite `(organizationId, status)` for filtered list queries.

---

## 5. Authentication Flow

Authentication uses **stateless JWT access tokens** (15 minutes) and **persisted refresh tokens** (7 days) stored in PostgreSQL.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Create user in existing org |
| POST | `/api/v1/auth/login` | Issue access + refresh tokens |
| POST | `/api/v1/auth/refresh` | Rotate refresh token, issue new pair |
| POST | `/api/v1/auth/logout` | Revoke refresh token |

### Flow

```mermaid
sequenceDiagram
  participant Client
  participant API
  participant DB as PostgreSQL

  Client->>API: POST /auth/login
  API->>DB: verify credentials
  API-->>Client: accessToken + refreshToken

  Client->>API: GET /projects (Authorization: Bearer accessToken)
  API-->>Client: 200 protected data

  Client->>API: POST /auth/refresh { refreshToken }
  API->>DB: verify token, revoke old
  API-->>Client: new accessToken + refreshToken

  Client->>API: POST /auth/logout { refreshToken }
  API->>DB: set isRevoked = true
  API-->>Client: 200 OK
```

### Token details

| Token | Expiry | Storage | Payload |
|-------|--------|---------|---------|
| **Access** | 15 min | Stateless JWT | `userId`, `email`, `role`, `organizationId`, `jti` |
| **Refresh** | 7 days | JWT + DB row | `userId`, `tokenId` |

- Passwords hashed with **bcrypt** (10 rounds).
- **Refresh rotation:** on refresh, the old token is revoked before a new pair is issued.
- **Logout:** sets `isRevoked = true` on the refresh token record (soft revoke; row retained).

Protected routes expect: `Authorization: Bearer <accessToken>`.

---

## 6. RBAC Matrix

RBAC is enforced at two levels: **route middleware** (`authorize`) and **service-layer** resource checks.

### Route-level permissions

| Resource | Create | Read | Update | Delete | Status change |
|----------|--------|------|--------|--------|---------------|
| **Projects** | ADMIN, MANAGER | ADMIN, MANAGER, MEMBER | ADMIN, MANAGER | ADMIN | — |
| **Tasks** | ADMIN, MANAGER | ADMIN, MANAGER, MEMBER | ADMIN, MANAGER, MEMBER* | ADMIN | ADMIN, MANAGER, MEMBER** |

### Service-level rules

| Rule | Applies to |
|------|------------|
| *MEMBER can only **get** and **update** tasks where `assigneeId === userId` | Task get, task update |
| **Status change allowed for: task **assignee**, **ADMIN**, or **MANAGER** | `PATCH /tasks/:id/status` |
| MEMBER task **list** is forced to `assigneeId = userId` (query param ignored) | `GET /tasks` |
| `organizationId` always from JWT — never accepted in request body | All mutations |

---

## 7. Project APIs

Base path: `/api/v1/projects` — all routes require authentication.

| Method | Path | Roles | Request body | Response |
|--------|------|-------|--------------|----------|
| POST | `/` | ADMIN, MANAGER | `{ name, description? }` | `201` Project |
| GET | `/` | ALL | — | `200` ProjectSummary[] |
| GET | `/:id` | ALL | — | `200` Project |
| PATCH | `/:id` | ADMIN, MANAGER | `{ name?, description? }` (≥1 field) | `200` Project |
| DELETE | `/:id` | ADMIN | — | `200` `{ message }` |

**Validation:** `name` min 3 characters on create/update.

**Errors:** `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 PROJECT_NOT_FOUND`, `400 VALIDATION_ERROR`.

---

## 8. Task APIs

Base path: `/api/v1/tasks` — all routes require authentication.

| Method | Path | Roles | Body / params | Response |
|--------|------|-------|---------------|----------|
| POST | `/` | ADMIN, MANAGER | CreateTask body | `201` Task |
| GET | `/` | ALL | Query: see below | `200` PaginatedTaskResponse |
| GET | `/:id` | ALL* | — | `200` Task |
| PATCH | `/:id` | ALL* | UpdateTask body (no `status`) | `200` Task |
| PATCH | `/:id/status` | ALL** | `{ status }` | `200` Task |
| DELETE | `/:id` | ADMIN | — | `200` `{ message }` |

### List query parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | `1` | Page number (positive) |
| `limit` | integer | `10` | Page size (1–100) |
| `status` | TaskStatus | — | Filter by status |
| `priority` | Priority | — | Filter by priority |
| `assigneeId` | uuid | — | Filter by assignee (ADMIN/MANAGER only) |

**Examples:**

```
GET /api/v1/tasks?page=1&limit=10
GET /api/v1/tasks?status=TODO
GET /api/v1/tasks?priority=HIGH
GET /api/v1/tasks?assigneeId=<uuid>
```

### Create task body

```json
{
  "title": "Implement feature",
  "description": "Optional",
  "priority": "HIGH",
  "status": "TODO",
  "projectId": "<uuid>",
  "assigneeId": "<uuid>",
  "dueDate": "2026-06-01T00:00:00.000Z"
}
```

`status`, `description`, `assigneeId`, and `dueDate` are optional on create.

---

## 9. Task Workflow Rules

Status changes are **only** allowed via `PATCH /api/v1/tasks/:id/status`. The general task update endpoint does not accept `status`.

Rules are enforced server-side in `taskStatusTransitions.ts` before any database write.

### Allowed transitions

| From | To |
|------|-----|
| TODO | IN_PROGRESS, BLOCKED |
| IN_PROGRESS | IN_REVIEW, BLOCKED |
| IN_REVIEW | DONE, BLOCKED |
| DONE | *(none — terminal)* |
| BLOCKED | *(none — terminal)* |

### Invalid examples

| Transition | Result |
|------------|--------|
| TODO → DONE | `400 INVALID_STATUS_TRANSITION` |
| TODO → IN_REVIEW | `400 INVALID_STATUS_TRANSITION` |
| DONE → TODO | `400 INVALID_STATUS_TRANSITION` |
| BLOCKED → DONE | `400 INVALID_STATUS_TRANSITION` |
| Same status → same status | `400 INVALID_STATUS_TRANSITION` |

### Permission

Only the **task assignee**, **MANAGER**, or **ADMIN** may change status. Unassigned tasks can only be transitioned by ADMIN or MANAGER.

---

## 10. Redis Caching Strategy

Caching applies **only** to `GET /api/v1/tasks` (paginated task list).

### Pattern: cache-aside

1. Build deterministic cache key from query filters.
2. Check Redis — return on hit.
3. On miss: query PostgreSQL, store in Redis, return response.

Implemented in `task.service.ts` via `cacheService`; repository remains database-only.

### Cache key format

```
tasks:{organizationId}:{assigneeId|all}:status{value|ALL}:priority{value|ALL}:page{N}:limit{N}
```

**Examples:**

```
tasks:org-uuid:user-uuid:statusTODO:priorityALL:page1:limit10
tasks:org-uuid:all:statusALL:priorityHIGH:page2:limit10
```

- `organizationId` ensures multi-tenant isolation.
- `assigneeId` segment uses effective filter (MEMBER forced to own ID; `all` when unfiltered).

### TTL

**300 seconds (5 minutes).** Mutations invalidate cache immediately; TTL is a safety net.

### Invalidation

Organization-wide pattern delete after:

- Task created
- Task updated (including assignee change)
- Task status changed
- Task deleted

```
DELETE pattern: tasks:{organizationId}:*
```

### Graceful degradation

If Redis is unavailable, `cacheService` logs the error and the API falls back to PostgreSQL — requests still succeed.

---

## 11. Swagger Documentation

| URL | Description |
|-----|-------------|
| [http://localhost:3000/api-docs](http://localhost:3000/api-docs) | Interactive Swagger UI |
| [http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json) | OpenAPI 3.0 JSON spec |

### Setup

- Configuration: `src/config/swagger.ts`
- Annotations: `src/docs/swagger/` (components + path files)
- **BearerAuth** security scheme for protected endpoints

### Using Swagger UI

1. Open `/api-docs`.
2. Call **POST /api/v1/auth/login** to get an `accessToken`.
3. Click **Authorize** and paste the token **without** the `Bearer` prefix.
4. Try protected endpoints under Projects and Tasks tags.

### Tags

| Tag | Endpoints |
|-----|-----------|
| Authentication | register, login, refresh, logout |
| Projects | project CRUD |
| Tasks | task CRUD, list filters, status transition |
| System | health check |

---

## 12. Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Layered architecture** | Separates HTTP, business logic, and data access for testability and clarity |
| **Org isolation via JWT** | `organizationId` from token prevents cross-tenant data leaks; never trusted from body |
| **Dedicated status endpoint** | Workflow rules isolated from general PATCH; invalid transitions rejected before DB write |
| **Transition config map** | Single source of truth in `taskStatusTransitions.ts`; easy to extend |
| **Refresh token rotation + DB storage** | Revocation on logout/refresh; stolen tokens can be invalidated |
| **Access token `jti`** | Unique ID per issuance; enables future denylisting |
| **Redis org-scoped keys + broad invalidation** | Correctness over granularity; one pattern delete covers all filter permutations |
| **`res.locals.validatedQuery`** | Express 5 `req.query` is read-only; Zod-coerced types need separate storage |
| **Centralized `AppError` + Zod middleware** | Consistent error shape across all endpoints |
| **Swagger in separate doc files** | Full API documentation without modifying business logic |
| **Repository purity** | DB-only repositories; caching and RBAC stay in services |

---

## 13. Local Setup

### Prerequisites

- Node.js >= 20
- Docker & Docker Compose (recommended for Postgres + Redis)
- npm

### Steps

1. **Clone and install dependencies**

```bash
npm install
```

2. **Configure environment**

```bash
cp .env.example .env
```

When running Postgres via Docker but the app on your host, use port **5433** (Docker maps `5433:5432`):

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/task_tracker?schema=public
REDIS_URL=redis://localhost:6379
```

3. **Start infrastructure**

```bash
docker compose up postgres redis -d
```

4. **Generate Prisma client and run migrations**

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. **Start dev server**

```bash
npm run dev
```

6. **Verify**

```bash
curl http://localhost:3000/health
```

Expected:

```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### NPM scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run production build |
| `npm run lint` | ESLint on `src/` |
| `npm run format` | Prettier format |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run migrations (dev) |

---

## 14. Docker Setup

Run the full stack (app + PostgreSQL + Redis) with one command:

```bash
docker compose up --build
```

The entrypoint script (`docker-entrypoint.sh`) waits for Postgres, runs `prisma migrate deploy`, then starts the app.

### Port mapping

| Service | Host port | Internal port |
|---------|-----------|---------------|
| API | 3000 | 3000 |
| PostgreSQL | **5433** | 5432 |
| Redis | 6379 | 6379 |

Health check:

```bash
curl http://localhost:3000/health
```

Swagger UI:

```bash
open http://localhost:3000/api-docs
```

Stop services:

```bash
docker compose down
```

Remove volumes (reset database):

```bash
docker compose down -v
```

---

## 15. Environment Variables

Copy `.env.example` and adjust for your environment.

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development`, `production`, or `test` |
| `PORT` | Yes | HTTP port (default: `3000`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `JWT_ACCESS_SECRET` | Yes | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Yes | Secret for signing refresh tokens |

### Local development (app on host, infra in Docker)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/task_tracker?schema=public
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=change-me-access
JWT_REFRESH_SECRET=change-me-refresh
```

### Inside Docker Compose network

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/task_tracker?schema=public
REDIS_URL=redis://redis:6379
```

Use strong, unique secrets in production. Never commit `.env` to version control.

---

## 16. API Examples

Replace placeholder UUIDs and tokens with values from your environment.

### Health check

```bash
curl http://localhost:3000/health
```

### Register

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "role": "MANAGER",
    "organizationId": "YOUR_ORG_UUID"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "password123"
  }'
```

Save `accessToken` and `refreshToken` from the response.

### List projects

```bash
curl http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create project

```bash
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Backend API",
    "description": "Core API project"
  }'
```

### Create task

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement caching",
    "priority": "HIGH",
    "projectId": "YOUR_PROJECT_UUID",
    "assigneeId": "YOUR_USER_UUID"
  }'
```

### List tasks (with filters)

```bash
curl "http://localhost:3000/api/v1/tasks?page=1&limit=10&status=TODO" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update task status

```bash
curl -X PATCH "http://localhost:3000/api/v1/tasks/YOUR_TASK_UUID/status" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "status": "IN_PROGRESS" }'
```

### Refresh tokens

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "YOUR_REFRESH_TOKEN" }'
```

### Logout

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "YOUR_REFRESH_TOKEN" }'
```

### Error response format

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email address"]
  }
}
```

```json
{
  "status": 400,
  "code": "INVALID_STATUS_TRANSITION",
  "message": "Invalid status transition"
}
```

### Common error codes

| Code | HTTP | When |
|------|------|------|
| `VALIDATION_ERROR` | 400 | Zod validation failed |
| `INVALID_STATUS_TRANSITION` | 400 | Invalid task status change |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `FORBIDDEN` | 403 | Insufficient role or resource access |
| `PROJECT_NOT_FOUND` | 404 | Project not in org |
| `TASK_NOT_FOUND` | 404 | Task not in org |
| `USER_NOT_FOUND` | 404 | Assignee not in org |
| `USER_ALREADY_EXISTS` | 409 | Duplicate email |

---

## 17. Testing Instructions

There is no automated test suite in this project. Use the checks below for manual verification.

### Static checks

```bash
npm run build
npm run lint
```

Both should exit with code 0.

### Health

```bash
curl http://localhost:3000/health
```

### Authentication flow

1. Register a user (org must exist in DB — create via Prisma Studio or seed).
2. Login — receive `accessToken` and `refreshToken`.
3. Call a protected route with `Authorization: Bearer <accessToken>`.
4. Refresh — old refresh token revoked, new pair issued.
5. Logout — refresh token revoked.

### RBAC

| Scenario | Expected |
|----------|----------|
| MEMBER calls `GET /tasks` | Only own assigned tasks |
| MEMBER calls `GET /tasks/:id` for unassigned task | `403 FORBIDDEN` |
| MEMBER calls `DELETE /tasks/:id` | `403 FORBIDDEN` |
| ADMIN deletes task | `200` |

### Status workflow

| Scenario | Expected |
|----------|----------|
| TODO → IN_PROGRESS (as assignee) | `200` |
| TODO → DONE | `400 INVALID_STATUS_TRANSITION` |
| MEMBER not assignee changes status | `403 FORBIDDEN` |

### Redis caching

1. `GET /api/v1/tasks` twice with same token and query.
2. Inspect Redis: `docker exec task-tracker-redis redis-cli KEYS "tasks:*"`.
3. Create or update a task — keys for that org should be cleared.

### Swagger UI

1. Open [http://localhost:3000/api-docs](http://localhost:3000/api-docs).
2. Confirm **Authorize** button appears.
3. Login via Swagger or curl; paste access token in Authorize dialog.
4. Execute endpoints interactively across all tags.

---

## License

ISC
