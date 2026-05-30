import { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { taskService } from '../services/task.service';
import {
  CreateTaskInput,
  ListTaskQuery,
  TaskIdParams,
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from '../validators/task.validator';

export class TaskController {
  private getUser(req: Request) {
    if (!req.user) {
      throw AppError.fromCode('UNAUTHORIZED');
    }
    return req.user;
  }

  async create(req: Request, res: Response): Promise<void> {
    const user = this.getUser(req);
    const body = req.body as CreateTaskInput;
    const task = await taskService.create(user, body);
    res.status(201).json(task);
  }

  async list(req: Request, res: Response): Promise<void> {
    const user = this.getUser(req);
    const query = res.locals.validatedQuery as ListTaskQuery;
    const result = await taskService.list(user, query);
    res.status(200).json(result);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const user = this.getUser(req);
    const { id } = req.params as TaskIdParams;
    const task = await taskService.getById(user, id);
    res.status(200).json(task);
  }

  async update(req: Request, res: Response): Promise<void> {
    const user = this.getUser(req);
    const { id } = req.params as TaskIdParams;
    const body = req.body as UpdateTaskInput;
    const task = await taskService.update(user, id, body);
    res.status(200).json(task);
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    const user = this.getUser(req);
    const { id } = req.params as TaskIdParams;
    const body = req.body as UpdateTaskStatusInput;
    const task = await taskService.updateStatus(user, id, body);
    res.status(200).json(task);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const user = this.getUser(req);
    const { id } = req.params as TaskIdParams;
    const result = await taskService.delete(user, id);
    res.status(200).json(result);
  }
}

export const taskController = new TaskController();
