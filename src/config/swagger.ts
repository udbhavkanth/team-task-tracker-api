import path from 'path';
import { Application, Request, Response } from 'express';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Team Task Tracker API',
      version: '1.0.0',
      description:
        'REST API for team-based task management with authentication, RBAC, task workflow management, Redis caching and Docker deployment.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User registration, login, token refresh, and logout',
      },
      {
        name: 'Projects',
        description: 'Project CRUD with role-based access control',
      },
      {
        name: 'Tasks',
        description: 'Task CRUD, pagination, filters, and status workflow transitions',
      },
      {
        name: 'System',
        description: 'Health and system endpoints',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT access token from login (without Bearer prefix)',
        },
      },
    },
  },
  apis: [
    path.join(process.cwd(), 'src/docs/swagger/components.ts'),
    path.join(process.cwd(), 'src/docs/swagger/paths.auth.ts'),
    path.join(process.cwd(), 'src/docs/swagger/paths.projects.ts'),
    path.join(process.cwd(), 'src/docs/swagger/paths.tasks.ts'),
    path.join(process.cwd(), 'src/docs/swagger/paths.system.ts'),
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

export function setupSwagger(app: Application): void {
  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  app.use(
    '/api-docs',
    helmet({ contentSecurityPolicy: false }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: 'Team Task Tracker API',
    })
  );
}
