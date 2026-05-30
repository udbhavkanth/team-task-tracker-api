import { Router } from 'express';
import { healthController } from '../controllers/health.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    healthController.getHealth(req, res);
  })
);

export default router;
