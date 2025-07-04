import { GARMENT_COLOR, GARMENT_SIZE, PROJECT_GENDER } from '../../const';

export interface CreateProjectRequest {
  title: string;
  garmentColor: GARMENT_COLOR;
  garmentSize: GARMENT_SIZE;
  garmentGender: PROJECT_GENDER;
  userId: string;
}

export interface UpdateLayerCoordinatesRequest {
  x: number;
  y: number;
  z: number;
}

export interface CreateTextLayerRequest {
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

export interface CreateImageLayerRequest {
  projectId: string;
  x: number;
  y: number;
  z: number;
  imageUrl: string;
  width: number;
  height: number;
}

export interface UpdateTextLayerRequest {
  text: string;
  fontColor: string;
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
}

export interface UpdateImageLayerRequest {
  imageUrl: string;
  width: number;
  height: number;
}
