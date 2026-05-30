import { Router } from 'express';
import { testController } from '../controllers/test.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get(
  '/admin',
  authenticate,
  authorize(['ADMIN']),
  asyncHandler(async (req, res) => testController.accessGranted(req, res))
);

router.get(
  '/manager',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(async (req, res) => testController.accessGranted(req, res))
);

router.get(
  '/member',
  authenticate,
  authorize(['ADMIN', 'MANAGER', 'MEMBER']),
  asyncHandler(async (req, res) => testController.accessGranted(req, res))
);

export default router;
