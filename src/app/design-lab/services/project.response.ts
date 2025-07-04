// http://localhost:8080/api/v1/projects
export interface CreateProjectRequest {
  title: string;
  userId: string;
  garmentColor: string;
  garmentGender: string;
  garmentSize: string;
}
export interface CreateProjectResponse {
  id: string;
  title: string;
  userId: string;
  previewUrl: string | null;
  status: string;
  garmentColor: string;
  garmentSize: string;
  garmentGender: string;
  layers: [];
  createdAt: string;
  updatedAt: string;
}

// http://localhost:8080/api/v1/projects/layers/texts
export interface CreateTextLayerRequest {
  projectId: string;
  text: string;
  fontColor: string;
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
}
export interface CreateTextLayerResponse {
  id: string;
  x: number;
  y: number;
  z: number;
  opacity: number;
  isVisible: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
  details: {
    isItalic: boolean;
    fontFamily: string;
    isUnderlined: boolean;
    fontSize: number;
    text: string;
    fontColor: string;
    isBold: boolean;
  };
}

export interface CreateImageLayerRequest {
  projectId: string; // esto ira en el path
  // http://localhost:8080/api/v1/projects/f6e29830-ba1d-4c9e-8f3f-f3934c4edd97/images
  imageUrl: string;
  width: string;
  height: string;
}
export interface CreateImageLayerResponse {
  id: string;
  x: number;
  y: number;
  z: number;
  opacity: number;
  isVisible: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
  details: {
    imageUrl: string;
    width: number;
    height: number;
  };
}

// http://localhost:8080/api/v1/projects/dee03e68-b253-4dc9-a830-319a8e7de282/layers/462f86ed-b8b3-4254-b763-db822da88320
export interface DeleteLayerRequest {
  projectId: string; // esto ira en el path
  layerId: string; // esto ira en el path
}
export interface DeleteLayerResponse {
  message: string;
  timestamp: string;
}

// http://localhost:8080/api/v1/projects/c7b5a719-43f2-4698-baa4-27581ab8a6cb/layers/8de48be3-b80e-41ad-ae9f-03a53e0f2108/coordinates
export interface UpdateLayerCoordinatesRequest {
  projectId: string; // esto ira en el path
  layerId: string; // esto ira en el path
  x: number;
  y: number;
  z: number;
}
export interface UpdateLayerCoordinatesResponse {
  id: string;
  x: number;
  y: number;
  z: number;
  opacity: number;
  isVisible: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
  details: {
    isItalic: boolean;
    fontFamily: string;
    isUnderlined: boolean;
    fontSize: number;
    text: string;
    fontColor: string;
    isBold: boolean;
  };
}

// http://localhost:8080/api/v1/projects/d45ad134-fc3d-4f1b-8cb5-a30caeaf6b82/layers/2ab964bf-84e4-4c15-b064-8af340a56022/text-details
export interface UpdateTextLayerDetailsRequest {
  projectId: string; // esto ira en el path
  layerId: string; // esto ira en el path
  text: string;
  fontColor: string;
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
}
export interface UpdateTextLayerDetailsResponse {
  id: string;
  x: number;
  y: number;
  z: number;
  opacity: number;
  isVisible: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
  details: {
    isItalic: boolean;
    fontFamily: string;
    isUnderlined: boolean;
    fontSize: number;
    text: string;
    fontColor: string;
    isBold: boolean;
  };
}

// http://localhost:8080/api/v1/projects/d45ad134-fc3d-4f1b-8cb5-a30caeaf6b82/layers/805645b4-f178-4806-8f06-d1e745a40376/image-details
export interface UpdateImageLayerDetailsRequest {
  projectId: string; // esto ira en el path
  layerId: string; // esto ira en el path
  imageUrl: string;
  width: number;
  height: number;
}
export interface UpdateImageLayerDetailsResponse {
  id: string;
  x: number;
  y: number;
  z: number;
  opacity: number;
  isVisible: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
  details: {
    imageUrl: string;
    width: number;
    height: number;
  };
}


//http://localhost:8080/api/v1/projects?userId=cd9b8fcb-b943-40cf-aa90-a5cd1812f602
export interface GetAllUserProjectsRequest {
  userId: string;
}
export type GetAllUserProjectsResponse = ProjectResponse[]
export interface ProjectResponse {
  id: string
  title: string
  userId: string
  previewUrl: any
  status: string
  garmentColor: string
  garmentSize: string
  garmentGender: string
  layers: Layer[]
  createdAt: string
  updatedAt: string
}
export interface Layer {
  id: string
  x: number
  y: number
  z: number
  opacity: number
  isVisible: boolean
  type: string
  createdAt: string
  updatedAt: string
  details: Details
}
export interface Details {
  isItalic?: boolean
  fontFamily?: string
  isUnderlined?: boolean
  fontSize?: number
  text?: string
  fontColor?: string
  isBold?: boolean
  imageUrl?: string
  width?: number
  height?: number
}
