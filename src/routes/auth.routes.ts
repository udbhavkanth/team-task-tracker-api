import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  loginSchema,
  logoutSchema,
  refreshSchema,
  registerSchema,
} from '../validators/auth.schema';

const router = Router();

router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => authController.register(req, res))
);

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => authController.login(req, res))
);

router.post(
  '/refresh',
  validate(refreshSchema),
  asyncHandler(async (req, res) => authController.refresh(req, res))
);

router.post(
  '/logout',
  validate(logoutSchema),
  asyncHandler(async (req, res) => authController.logout(req, res))
);

export default router;
