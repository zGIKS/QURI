import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../iam/services/authentication.service';
import { Project } from '../model/project.entity';
import { DesignLabAssembler } from './design-lab.assemblers';

// Imports from project.response.ts - todos los endpoints reales
import {
  CreateProjectRequest,
  CreateProjectResponse,
  CreateTextLayerRequest,
  CreateTextLayerResponse,
  CreateImageLayerResponse,
  DeleteLayerResponse,
  DeleteProjectResponse,
  UpdateLayerCoordinatesResponse,
  UpdateTextLayerDetailsResponse,
  UpdateImageLayerDetailsResponse,
  GetAllUserProjectsResponse
} from './project.response';

const BASE_URL = `${environment.serverBaseUrl}/api/v1/projects`;

export interface LayerResult {
  success: boolean;
  layerId?: string;
  error?: string;
}

export interface ProjectResult {
  success: boolean;
  projectId?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DesignLabService {
  private http = inject(HttpClient);
  private authService = inject(AuthenticationService);
  private assembler = inject(DesignLabAssembler);

  constructor() {
    console.log('🚀 DesignLabService initialized with real endpoints');
  }

  // ==================== PROJECT METHODS ====================

  /**
   * Obtener todos los proyectos de un usuario
   * GET http://localhost:8080/api/v1/projects?userId=cd9b8fcb-b943-40cf-aa90-a5cd1812f602
   */
  getProjectsByUser(userId: string): Observable<Project[]> {
    console.log('📋 DesignLabService - Getting projects for user:', userId);

    const params = new HttpParams().set('userId', userId);

    return this.http.get<GetAllUserProjectsResponse>(BASE_URL, {
      headers: this.getHeaders(),
      params: params
    }).pipe(
      map(responses => {
        console.log('✅ Projects fetched successfully:', responses);
        return this.assembler.toProjectEntities(responses);
      }),
      catchError(error => {
        console.error('❌ Error fetching projects:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Obtener proyecto por ID
   * GET http://localhost:8080/api/v1/projects/{id}
   */
  getProjectById(projectId: string): Observable<Project> {
    console.log('📋 DesignLabService - Getting project:', projectId);

    return this.http.get<any>(`${BASE_URL}/${projectId}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Project fetched successfully:', response);
        return this.assembler.toProjectEntity(response);
      }),
      catchError(error => {
        console.error('❌ Error fetching project:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Crear un nuevo proyecto
   * POST http://localhost:8080/api/v1/projects
   */
  createProject(request: CreateProjectRequest): Observable<ProjectResult> {
    console.log('🆕 DesignLabService - Creating project:', request);

    return this.http.post<CreateProjectResponse>(BASE_URL, request, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Project created successfully:', response);
        return this.assembler.toCreateProjectResult(response);
      }),
      catchError(error => {
        console.error('❌ Error creating project:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Eliminar un proyecto
   * DELETE http://localhost:8080/api/v1/projects/{projectId}
   */
  deleteProject(projectId: string): Observable<DeleteResult> {
    console.log('🗑️ DesignLabService - Deleting project:', projectId);

    const url = `${BASE_URL}/${projectId}`;

    return this.http.delete<DeleteProjectResponse>(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Project deleted successfully:', response);
        return this.assembler.toDeleteProjectResult(response);
      }),
      catchError(error => {
        console.error('❌ Error deleting project:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  // ==================== TEXT LAYER METHODS ====================

  /**
   * Crear una nueva capa de texto
   * POST http://localhost:8080/api/v1/projects/layers/texts
   */
  createTextLayer(projectId: string, request: {
    text: string;
    fontColor: string;
    fontFamily: string;
    fontSize: number;
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
  }): Observable<LayerResult> {
    console.log('📝 DesignLabService - Creating text layer:', { projectId, request });

    const fullRequest: CreateTextLayerRequest = {
      projectId: projectId,
      ...request
    };

    const url = `${BASE_URL}/layers/texts`;

    console.log('📝 DesignLabService - Request URL:', url);
    console.log('📝 DesignLabService - Request body:', fullRequest);

    return this.http.post<CreateTextLayerResponse>(url, fullRequest, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Text layer created successfully:', response);
        return this.assembler.toCreateTextLayerResult(response);
      }),
      catchError(error => {
        console.error('❌ Error creating text layer:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Actualizar detalles de una capa de texto
   * PUT http://localhost:8080/api/v1/projects/{projectId}/layers/{layerId}/text-details
   */
  updateTextLayerDetails(projectId: string, layerId: string, request: {
    text: string;
    fontColor: string;
    fontFamily: string;
    fontSize: number;
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
  }): Observable<LayerResult> {
    console.log('📝 DesignLabService - Updating text layer details:', { projectId, layerId, request });

    const url = `${BASE_URL}/${projectId}/layers/${layerId}/text-details`;
    const requestBody = this.assembler.toUpdateTextLayerDetailsRequest(request);

    return this.http.put<UpdateTextLayerDetailsResponse>(url, requestBody, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Text layer details updated successfully:', response);
        return this.assembler.toUpdateTextLayerResult(response);
      }),
      catchError(error => {
        console.error('❌ Error updating text layer details:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  // ==================== IMAGE LAYER METHODS ====================

  /**
   * Crear una nueva capa de imagen
   * POST http://localhost:8080/api/v1/projects/{projectId}/images
   */
  createImageLayer(projectId: string, request: {
    imageUrl: string;
    width: string;
    height: string;
  }): Observable<LayerResult> {
    console.log('🖼️ DesignLabService - Creating image layer:', { projectId, request });

    const url = `${BASE_URL}/${projectId}/images`;
    const requestBody = this.assembler.toCreateImageLayerRequest(request);

    return this.http.post<CreateImageLayerResponse>(url, requestBody, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Image layer created successfully:', response);
        return this.assembler.toCreateImageLayerResult(response);
      }),
      catchError(error => {
        console.error('❌ Error creating image layer:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Actualizar detalles de una capa de imagen
   * PUT http://localhost:8080/api/v1/projects/{projectId}/layers/{layerId}/image-details
   */
  updateImageLayerDetails(projectId: string, layerId: string, request: {
    imageUrl: string;
    width: number;
    height: number;
  }): Observable<LayerResult> {
    console.log('🖼️ DesignLabService - Updating image layer details:', { projectId, layerId, request });

    const url = `${BASE_URL}/${projectId}/layers/${layerId}/image-details`;
    const requestBody = this.assembler.toUpdateImageLayerDetailsRequest(request);

    return this.http.put<UpdateImageLayerDetailsResponse>(url, requestBody, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Image layer details updated successfully:', response);
        return this.assembler.toUpdateImageLayerResult(response);
      }),
      catchError(error => {
        console.error('❌ Error updating image layer details:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  // ==================== LAYER COORDINATION METHODS ====================

  /**
   * Actualizar coordenadas de una capa
   * PUT http://localhost:8080/api/v1/projects/{projectId}/layers/{layerId}/coordinates
   */
  updateLayerCoordinates(projectId: string, layerId: string, request: {
    x: number;
    y: number;
    z: number;
  }): Observable<LayerResult> {
    console.log('📍 DesignLabService - Updating layer coordinates:', { projectId, layerId, request });

    const url = `${BASE_URL}/${projectId}/layers/${layerId}/coordinates`;
    const requestBody = this.assembler.toUpdateLayerCoordinatesRequest(request);

    return this.http.put<UpdateLayerCoordinatesResponse>(url, requestBody, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Layer coordinates updated successfully:', response);
        return this.assembler.toUpdateLayerCoordinatesResult(response);
      }),
      catchError(error => {
        console.error('❌ Error updating layer coordinates:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Eliminar una capa
   * DELETE http://localhost:8080/api/v1/projects/{projectId}/layers/{layerId}
   */
  deleteLayer(projectId: string, layerId: string): Observable<DeleteResult> {
    console.log('🗑️ DesignLabService - Deleting layer:', { projectId, layerId });

    const url = `${BASE_URL}/${projectId}/layers/${layerId}`;

    return this.http.delete<DeleteLayerResponse>(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Layer deleted successfully:', response);
        return this.assembler.toDeleteLayerResult(response);
      }),
      catchError(error => {
        console.error('❌ Error deleting layer:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Método de prueba para verificar la autenticación
   */
  testAuthentication(): Observable<any> {
    console.log('🧪 DesignLabService - Testing authentication');

    return this.http.get<any>(BASE_URL, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Authentication test successful:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ Authentication test failed:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Obtener headers HTTP con autenticación
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('🔧 DesignLabService - Token exists:', !!token);
    console.log('🔧 DesignLabService - Token preview:', token?.substring(0, 20) + '...');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    console.log('🔧 DesignLabService - Headers created:', headers.keys());
    return headers;
  }

  /**
   * Obtener mensaje de error legible
   */
  private getErrorMessage(error: any): string {
    if (error.status === 401) {
      return 'Token expirado o inválido. Por favor, inicia sesión nuevamente.';
    } else if (error.status === 403) {
      return 'No tienes permisos para realizar esta acción.';
    } else if (error.status === 404) {
      return 'Recurso no encontrado.';
    } else if (error.status === 500) {
      return 'Error interno del servidor. Intenta nuevamente más tarde.';
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return 'Error desconocido. Intenta nuevamente.';
    }
  }
}
