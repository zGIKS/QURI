import { GARMENT_COLOR, GARMENT_SIZE, PROJECT_GENDER } from '../../const';

export interface CreateProjectCommand {
  title: string;
  garmentColor: GARMENT_COLOR;
  garmentSize: GARMENT_SIZE;
  garmentGender: PROJECT_GENDER;
  userId: string;
}

export interface UpdateLayerCoordinatesCommand {
  projectId: string;
  layerId: string;
  x: number;
  y: number;
  z: number;
}

export interface CreateTextLayerCommand {
  projectId: string;
  x: number;
  y: number;
  z: number;
  text: string;
  fontColor: string;
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
}

export interface CreateImageLayerCommand {
  projectId: string;
  x: number;
  y: number;
  z: number;
  imageUrl: string;
  width: number;
  height: number;
}

export interface UpdateTextLayerCommand {
  projectId: string;
  layerId: string;
  text: string;
  fontColor: string;
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
}

export interface UpdateImageLayerCommand {
  projectId: string;
  layerId: string;
  imageUrl: string;
  width: number;
  height: number;
}

export interface ProjectCommandResult {
  success: boolean;
  projectId?: string;
  message?: string;
  error?: string;
}

export interface LayerCommandResult {
  success: boolean;
  layerId?: string;
  message?: string;
  error?: string;
}
