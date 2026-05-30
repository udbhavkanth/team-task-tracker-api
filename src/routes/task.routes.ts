import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createTaskSchema,
  listTaskQuerySchema,
  taskIdParamsSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../validators/task.validator';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validate(createTaskSchema),
  asyncHandler(async (req, res) => taskController.create(req, res))
);

router.get(
  '/',
  authenticate,
  authorize(['ADMIN', 'MANAGER', 'MEMBER']),
  validate(listTaskQuerySchema, 'query'),
  asyncHandler(async (req, res) => taskController.list(req, res))
);

router.get(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'MANAGER', 'MEMBER']),
  validate(taskIdParamsSchema, 'params'),
  asyncHandler(async (req, res) => taskController.getById(req, res))
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(['ADMIN', 'MANAGER', 'MEMBER']),
  validate(taskIdParamsSchema, 'params'),
  validate(updateTaskStatusSchema),
  asyncHandler(async (req, res) => taskController.updateStatus(req, res))
);

router.patch(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'MANAGER', 'MEMBER']),
  validate(taskIdParamsSchema, 'params'),
  validate(updateTaskSchema),
  asyncHandler(async (req, res) => taskController.update(req, res))
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validate(taskIdParamsSchema, 'params'),
  asyncHandler(async (req, res) => taskController.delete(req, res))
);

export default router;
