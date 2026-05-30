import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import {
  LoginInput,
  LogoutInput,
  RefreshInput,
  RegisterInput,
} from '../validators/auth.schema';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const body = req.body as RegisterInput;
    const user = await authService.register(body);
    res.status(201).json(user);
  }

  async login(req: Request, res: Response): Promise<void> {
    const body = req.body as LoginInput;
    const result = await authService.login(body);
    res.status(200).json(result);
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const body = req.body as RefreshInput;
    const result = await authService.refresh(body);
    res.status(200).json(result);
  }

  async logout(req: Request, res: Response): Promise<void> {
    const body = req.body as LogoutInput;
    const result = await authService.logout(body);
    res.status(200).json(result);
  }
}

export const authController = new AuthController();
