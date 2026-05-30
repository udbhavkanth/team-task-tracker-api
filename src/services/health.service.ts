import { HealthResponse } from '../types';

export class HealthService {
  getHealthStatus(): HealthResponse {
    return {
      status: 'ok',
      message: 'Server is running',
    };
  }
}

export const healthService = new HealthService();
