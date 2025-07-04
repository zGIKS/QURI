export interface GetProjectByIdQuery {
  projectId: string;
}

export interface GetProjectsByUserQuery {
  userId: string;
}

export interface GetProjectLayersQuery {
  projectId: string;
}

export interface ProjectQueryResult {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}
