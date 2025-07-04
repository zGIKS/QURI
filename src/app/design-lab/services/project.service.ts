import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { AuthenticationService } from '../../iam/services/authentication.service';
import { ProjectAssembler } from './project.assembler';
import { ProjectResponse } from './project.response';
import { CreateProjectRequest } from './project.request';
import { Project } from '../model/project.entity';
import { environment } from '../../../environments/environment';

// API Endpoints
const GET_ALL_USER_PROJECTS_URL = `${environment.serverBaseUrl}/api/v1/projects`;

const GET_PROJECT_BY_ID = (id: string) =>
  `${environment.serverBaseUrl}/api/v1/projects/${id}`;

const CREATE_PROJECT_URL = `${environment.serverBaseUrl}/api/v1/projects`;

// New endpoints for layers
const CREATE_TEXT_LAYER_URL = `${environment.serverBaseUrl}/api/v1/projects/layers/texts`;
const CREATE_IMAGE_LAYER_URL = (projectId: string) =>
  `${environment.serverBaseUrl}/api/v1/projects/${projectId}/images`;

// Update endpoints for layers
const UPDATE_TEXT_LAYER_URL = (projectId: string, layerId: string) =>
  `${environment.serverBaseUrl}/api/v1/projects/${projectId}/layers/${layerId}/text-details`;
const UPDATE_IMAGE_LAYER_URL = (projectId: string, layerId: string) =>
  `${environment.serverBaseUrl}/api/v1/projects/${projectId}/layers/${layerId}/image-details`;

// Update project details endpoint
const UPDATE_PROJECT_DETAILS_URL = (projectId: string) =>
  `${environment.serverBaseUrl}/api/v1/projects/${projectId}/details`;

// Layer request interfaces
interface CreateTextLayerRequest {
  projectId: string;
  text: string;
  fontColor: string;
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
}

interface CreateImageLayerRequest {
  imageUrl: string;
  width: string;
  height: string;
}

// Update layer request interfaces
interface UpdateTextLayerRequest {
  text: string;
  fontColor: string;
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
}

interface UpdateImageLayerRequest {
  imageUrl: string;
  width: string;
  height: string;
}

// Update project details request interface
interface UpdateProjectDetailsRequest {
  previewUrl?: string;
  status?: string;
  garmentColor?: string;
  garmentSize?: string;
  garmentGender?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private http = inject(HttpClient);
  private authService = inject(AuthenticationService);

  constructor() {
    console.log('🎨 ProjectService initialized with IAM integration');
  }

  private getCurrentUserId(): string | null {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    console.log('🔍 ProjectService - Current user ID from IAM:', userId);
    console.log('🔑 ProjectService - Auth token present:', !!token);
    if (token) {
      console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    }
    return userId;
  }

  getAllPublicProjects(): Observable<Project[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('No authenticated user found');
    }

    const params = new HttpParams().set('userId', userId);
    console.log('📡 Fetching all public projects for user:', userId);

    return this.http
      .get<ProjectResponse[]>(GET_ALL_USER_PROJECTS_URL, { params })
      .pipe(
        map((projects: ProjectResponse[]) => {
          console.log('✅ Projects fetched successfully:', projects);
          return ProjectAssembler.toEntitiesFromResponse(projects);
        })
      );
  }

  getUserBlueprints(): Observable<Project[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('No authenticated user found');
    }

    const params = new HttpParams().set('userId', userId);
    console.log('📡 Fetching user blueprints for user:', userId);
    console.log('🌐 GET URL:', GET_ALL_USER_PROJECTS_URL + '?userId=' + userId);

    return this.http
      .get<ProjectResponse[]>(GET_ALL_USER_PROJECTS_URL, { params })
      .pipe(
        map((projects: ProjectResponse[]) => {
          console.log('✅ User blueprints fetched successfully:', projects);
          console.log('🔍 First project sample:', projects[0]);
          return ProjectAssembler.toEntitiesFromResponse(projects);
        })
      );
  }

  getUserBlueprintById(id: string): Observable<Project> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('No authenticated user found');
    }

    console.log('📡 Fetching user blueprint by ID:', id, 'for user:', userId);
    return this.http
      .get<ProjectResponse>(GET_PROJECT_BY_ID(id))
      .pipe(
        map((project: ProjectResponse) => {
          console.log('✅ User blueprint fetched successfully:', project);
          return ProjectAssembler.toEntityFromResponse(project);
        })
      );
  }

  getProjectById(id: string): Observable<Project> {
    console.log('📡 Fetching project by ID:', id);
    return this.http
      .get<ProjectResponse>(GET_PROJECT_BY_ID(id))
      .pipe(
        map((project: ProjectResponse) => {
          console.log('✅ Project response:', project);
          return ProjectAssembler.toEntityFromResponse(project);
        })
      );
  }

  createProject(request: CreateProjectRequest): Observable<Project> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('No authenticated user found');
    }

    // Use the authenticated user ID
    const projectPayload = { ...request, userId };

    console.log('📡 Creating project for user:', userId, 'with payload:', projectPayload);
    console.log('🌐 POST URL:', CREATE_PROJECT_URL);

    return this.http
      .post<ProjectResponse>(CREATE_PROJECT_URL, projectPayload)
      .pipe(
        map((response: ProjectResponse) => {
          console.log('✅ Project created successfully:', response);
          return ProjectAssembler.toEntityFromResponse(response);
        })
      );
  }

  getAllPublicProjectsForUser(): Observable<Project[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('No authenticated user found');
    }

    const params = new HttpParams().set('userId', userId);
    console.log('📡 Fetching all public projects for authenticated user:', userId);
    console.log('🌐 GET URL:', GET_ALL_USER_PROJECTS_URL + '?userId=' + userId);

    return this.http
      .get<ProjectResponse[]>(GET_ALL_USER_PROJECTS_URL, { params })
      .pipe(
        map((projects: ProjectResponse[]) => {
          console.log('✅ Public projects fetched successfully:', projects);
          return ProjectAssembler.toEntitiesFromResponse(projects);
        })
      );
  }

  updateProject(id: string, projectData: ProjectResponse): Observable<Project> {
    const userId = this.getCurrentUserId();
    const token = localStorage.getItem('token');

    if (!userId) {
      console.error('❌ No authenticated user found for project update');
      throw new Error('No authenticated user found');
    }

    if (!token) {
      console.error('❌ No authentication token found for project update');
      throw new Error('User not authenticated - no token');
    }

    const url = `${environment.serverBaseUrl}/api/v1/projects/${id}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    return this.http
      .put<ProjectResponse>(url, projectData, { headers })
      .pipe(
        map((response: ProjectResponse) => {
          return ProjectAssembler.toEntityFromResponse(response);
        })
      );
  }

  createTextLayer(request: CreateTextLayerRequest): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User not authenticated');
    }
    return this.http
      .post<any>(CREATE_TEXT_LAYER_URL, request)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  createImageLayer(projectId: string, request: CreateImageLayerRequest): Observable<any> {
    const endpoint = CREATE_IMAGE_LAYER_URL(projectId);
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token) {
      throw new Error('User not authenticated');
    }
    return this.http
      .post<any>(endpoint, request)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  // Update text layer details
  updateTextLayer(projectId: string, layerId: string, request: UpdateTextLayerRequest): Observable<any> {
    const endpoint = UPDATE_TEXT_LAYER_URL(projectId, layerId);
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User not authenticated');
    }
    return this.http
      .put<any>(endpoint, request)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  // Update image layer details
  updateImageLayer(projectId: string, layerId: string, request: UpdateImageLayerRequest): Observable<any> {
    const endpoint = UPDATE_IMAGE_LAYER_URL(projectId, layerId);
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User not authenticated');
    }
    return this.http
      .put<any>(endpoint, request)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  // Update project preview URL
  updateProjectPreview(projectId: string, previewUrl: string): Observable<any> {
    const endpoint = `${environment.serverBaseUrl}/api/v1/projects/${projectId}/preview`;
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User not authenticated');
    }
    const requestBody = { previewUrl };
    return this.http
      .put<any>(endpoint, requestBody)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  // Update project details (new endpoint)
  updateProjectDetails(projectId: string, request: UpdateProjectDetailsRequest): Observable<any> {
    const endpoint = UPDATE_PROJECT_DETAILS_URL(projectId);
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User not authenticated');
    }
    return this.http
      .put<any>(endpoint, request)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }
}
