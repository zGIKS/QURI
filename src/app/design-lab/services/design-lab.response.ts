import { GARMENT_COLOR, GARMENT_SIZE, PROJECT_GENDER, PROJECT_STATUS } from '../../const';

export interface ProjectResponse {
  id: string;
  title: string;
  userId: string;
  previewUrl: string | null;
  status: PROJECT_STATUS;
  garmentColor: GARMENT_COLOR;
  garmentSize: GARMENT_SIZE;
  garmentGender: PROJECT_GENDER;
  layers: LayerResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface LayerResponse {
  id: string;
  x: number;
  y: number;
  z: number;
  opacity: number;
  isVisible: boolean;
  type: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  details?: any;
}

export interface CreateProjectResponse {
  success: boolean;
  projectId?: string;
  message?: string;
  error?: string;
}

export interface DeleteProjectResponse {
  message: string;
  error?: string;
  status?: number;
}

export interface LayerOperationResponse {
  success: boolean;
  layerId?: string;
  message?: string;
  error?: string;
}
