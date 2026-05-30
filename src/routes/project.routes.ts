import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createProjectSchema,
  projectIdParamsSchema,
  updateProjectSchema,
} from '../validators/project.validator';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validate(createProjectSchema),
  asyncHandler(async (req, res) => projectController.create(req, res))
);

router.get(
  '/',
  authenticate,
  authorize(['ADMIN', 'MANAGER', 'MEMBER']),
  asyncHandler(async (req, res) => projectController.list(req, res))
);

router.get(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'MANAGER', 'MEMBER']),
  validate(projectIdParamsSchema, 'params'),
  asyncHandler(async (req, res) => projectController.getById(req, res))
);

router.patch(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validate(projectIdParamsSchema, 'params'),
  validate(updateProjectSchema),
  asyncHandler(async (req, res) => projectController.update(req, res))
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validate(projectIdParamsSchema, 'params'),
  asyncHandler(async (req, res) => projectController.delete(req, res))
);

export default router;
