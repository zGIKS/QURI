import { PROJECT_STATUS, GARMENT_COLOR, GARMENT_SIZE, PROJECT_GENDER, LayerType } from '../../const';

// ==================== PROJECT RESPONSES ====================
export interface ProjectResponse {
  id: string;
  title: string;
  userId: string;
  previewUrl: string;
  status: PROJECT_STATUS;
  garmentColor: GARMENT_COLOR;
  garmentSize: GARMENT_SIZE;
  garmentGender: PROJECT_GENDER;
  layers: LayerResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectResponse {
  success: boolean;
  projectId?: string;
  message?: string;
  error?: string;
}

export interface DeleteProjectResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// ==================== LAYER RESPONSES ====================
export interface LayerResponse {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  z: number;
  opacity: number;
  isVisible: boolean;
  details: any;
  createdAt: string;
  updatedAt: string;
}

export interface LayerOperationResponse {
  success: boolean;
  layerId?: string;
  message?: string;
  error?: string;
}

// ==================== COMMON RESULT INTERFACES ====================
export interface ProjectResult {
  success: boolean;
  projectId?: string;
  error?: string;
}

export interface LayerResult {
  success: boolean;
  layerId?: string;
  error?: string;
}

export interface DeleteProjectResult {
  success: boolean;
  error?: string;
}
