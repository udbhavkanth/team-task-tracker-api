# Team Task Tracker API

Production-grade backend foundation for a Team Task Tracker API (Phase 1).

## Tech Stack

- Node.js + TypeScript
- Express.js
- PostgreSQL + Prisma ORM
- Redis
- Zod validation
- Docker & Docker Compose

## Project Structure

```
src/
├── app.ts                 # Express app setup (middleware, routes)
├── server.ts              # Server bootstrap & graceful shutdown
├── config/                # Centralized configuration
├── controllers/           # HTTP request handlers
├── services/              # Business logic layer
├── repositories/          # Data access layer (placeholder)
├── middlewares/           # Reusable Express middlewares
├── routes/                # API route definitions
├── validators/            # Zod schemas
├── utils/                 # Shared utilities
├── types/                 # TypeScript type definitions
├── errors/                # Custom error classes
└── prisma/                # Prisma schema
```

## Architecture

This project follows **clean architecture** with a layered pattern:

```
Routes → Controllers → Services → Repositories → (Prisma / Redis)
```

- **Routes**: Define HTTP endpoints and delegate to controllers
- **Controllers**: Thin layer; parse requests and return responses
- **Services**: Application/business logic
- **Repositories**: Data access (Phase 2+)
- **Config**: Zod-validated environment variables, Prisma & Redis clients

`app.ts` configures Express; `server.ts` handles boot, Redis connection, and graceful shutdown.

## Prerequisites

- Node.js >= 20
- Docker & Docker Compose (for containerized setup)
- PostgreSQL and Redis (for local development without Docker)

## Environment Variables

Copy the example file and adjust values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development`, `production`, or `test` |
| `PORT` | HTTP server port (default: 3000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_ACCESS_SECRET` | JWT access token secret (Phase 2) |
| `JWT_REFRESH_SECRET` | JWT refresh token secret (Phase 2) |

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start PostgreSQL and Redis locally (or use Docker for infra only):

```bash
docker compose up postgres redis -d
```

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Run migrations (when available):

```bash
npm run prisma:migrate
```

5. Start the dev server:

```bash
npm run dev
```

6. Verify health check:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Docker

Run the full stack (app + PostgreSQL + Redis) with one command:

```bash
docker compose up --build
```

Health check:

```bash
curl http://localhost:3000/health
```

Stop services:

```bash
docker compose down
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run Prisma migrations (dev) |

## Phase 1 Scope

Included:

- Project scaffolding and folder structure
- Express server with security middleware
- Centralized Zod-validated configuration
- Prisma + PostgreSQL setup
- Redis client connection
- Docker Compose for one-command startup
- `GET /health` endpoint

Not included (future phases):

- Authentication & JWT
- RBAC
- Task CRUD and business logic

## License

ISC
