export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
}

export interface ProjectDetail extends ProjectSummary {
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeleteProjectResponse {
  message: string;
}
