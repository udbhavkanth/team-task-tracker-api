import { Router } from 'express';
import authRoutes from './auth.routes';
import healthRoutes from './health.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import testRoutes from './test.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/test', testRoutes);
router.use('/api/v1/projects', projectRoutes);
router.use('/api/v1/tasks', taskRoutes);

export default router;
