import { Request, Response } from 'express';

export class TestController {
  accessGranted(req: Request, res: Response): void {
    res.status(200).json({
      message: 'Access granted',
      user: req.user,
    });
  }
}

export const testController = new TestController();
