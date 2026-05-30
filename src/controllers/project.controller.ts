import { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { projectService } from '../services/project.service';
import {
  CreateProjectInput,
  ProjectIdParams,
  UpdateProjectInput,
} from '../validators/project.validator';

export class ProjectController {
  private getUser(req: Request) {
    if (!req.user) {
      throw AppError.fromCode('UNAUTHORIZED');
    }
    return req.user;
  }

  async create(req: Request, res: Response): Promise<void> {
    const user = this.getUser(req);
    const body = req.body as CreateProjectInput;
    const project = await projectService.create(user, body);
    res.status(201).json(project);
  }

  async list(req: Request, res: Response): Promise<void> {
    const user = this.getUser(req);
    const projects = await projectService.list(user);
    res.status(200).json(projects);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const user = this.getUser(req);
    const { id } = req.params as ProjectIdParams;
    const project = await projectService.getById(user, id);
    res.status(200).json(project);
  }

  async update(req: Request, res: Response): Promise<void> {
    const user = this.getUser(req);
    const { id } = req.params as ProjectIdParams;
    const body = req.body as UpdateProjectInput;
    const project = await projectService.update(user, id, body);
    res.status(200).json(project);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const user = this.getUser(req);
    const { id } = req.params as ProjectIdParams;
    const result = await projectService.delete(user, id);
    res.status(200).json(result);
  }
}

export const projectController = new ProjectController();
