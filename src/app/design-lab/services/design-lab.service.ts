import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../iam/services/authentication.service';
import { Project } from '../model/project.entity';
import { TextLayer, ImageLayer, Layer } from '../model/layer.entity';
import { LayerType } from '../../const';
import {
  CreateProjectRequest,
  CreateTextLayerRequest,
  CreateImageLayerRequest,
  UpdateTextLayerRequest,
  UpdateImageLayerRequest,
  UpdateLayerCoordinatesRequest
} from './design-lab.requests';
import {
  ProjectResponse,
  CreateProjectResponse,
  DeleteProjectResponse,
  LayerOperationResponse,
  LayerResponse,
  ProjectResult,
  LayerResult,
  DeleteProjectResult
} from './design-lab.responses';

const BASE_URL = `${environment.serverBaseUrl}/api/v1/projects`;

@Injectable({
  providedIn: 'root',
})
export class DesignLabService {
  private http = inject(HttpClient);
  private authService = inject(AuthenticationService);

  constructor() {
    console.log('🚀 DesignLabService initialized');
  }

  // ==================== PROJECT METHODS ====================

  /**
   * Obtener todos los proyectos de un usuario
   */
  getProjectsByUser(userId: string): Observable<Project[]> {
    console.log('📋 DesignLabService - Getting projects for user:', userId);

    const params = new HttpParams().set('userId', userId);

    return this.http.get<ProjectResponse[]>(BASE_URL, {
      headers: this.getHeaders(),
      params: params
    }).pipe(
      map(responses => {
        console.log('✅ Projects fetched successfully:', responses);
        return responses.map(response => this.mapToProject(response));
      }),
      catchError(error => {
        console.error('❌ Error fetching projects:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Obtener proyecto por ID
   */
  getProjectById(projectId: string): Observable<Project> {
    console.log('📋 DesignLabService - Getting project:', projectId);

    return this.http.get<ProjectResponse>(`${BASE_URL}/${projectId}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Project fetched successfully:', response);
        return this.mapToProject(response);
      }),
      catchError(error => {
        console.error('❌ Error fetching project:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Crear un nuevo proyecto
   */
  createProject(request: CreateProjectRequest): Observable<ProjectResult> {
    console.log('🆕 DesignLabService - Creating project:', request);

    return this.http.post<CreateProjectResponse>(BASE_URL, request, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Project created successfully:', response);
        return {
          success: response.success,
          projectId: response.projectId,
          error: response.error
        };
      }),
      catchError(error => {
        console.error('❌ Error creating project:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Eliminar un proyecto
   */
  deleteProject(projectId: string): Observable<DeleteProjectResult> {
    console.log('🗑️ DesignLabService - Deleting project:', projectId);

    const url = `${BASE_URL}/${projectId}`;

    return this.http.delete<DeleteProjectResponse>(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Project deleted successfully:', response);
        return {
          success: response.success,
          error: response.error
        };
      }),
      catchError(error => {
        console.error('❌ Error deleting project:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Actualizar los detalles de un proyecto (incluyendo preview URL)
   */
  updateProjectDetails(projectId: string, details: {
    previewUrl?: string;
    status?: string;
    garmentColor?: string;
    garmentSize?: string;
    garmentGender?: string;
  }): Observable<ProjectResult> {
    console.log('🖼️ DesignLabService - Updating project details:', { projectId, details });

    const url = `${BASE_URL}/${projectId}/details`;

    return this.http.put<{ message: string; timestamp: string }>(url, details, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Project details updated successfully:', response);
        return {
          success: true,
          projectId: projectId,
          error: undefined
        };
      }),
      catchError(error => {
        console.error('❌ Error updating project details:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Actualizar solo el preview URL de un proyecto
   * Este método es un wrapper que actualiza el previewUrl manteniendo los demás campos
   */
  updateProjectPreview(projectId: string, previewUrl: string, currentProject?: Project): Observable<ProjectResult> {
    console.log('🖼️ DesignLabService - Updating project preview only:', { projectId, previewUrl });

    // Si tenemos el proyecto actual, incluimos todos sus campos para no perder datos
    const updateData: any = { previewUrl };

    if (currentProject) {
      updateData.status = currentProject.status;
      updateData.garmentColor = currentProject.garmentColor;
      updateData.garmentSize = currentProject.garmentSize;
      updateData.garmentGender = currentProject.garmentGender;

      console.log('🔄 Preserving current project fields:', {
        status: currentProject.status,
        garmentColor: currentProject.garmentColor,
        garmentSize: currentProject.garmentSize,
        garmentGender: currentProject.garmentGender
      });
    }

    return this.updateProjectDetails(projectId, updateData);
  }

  /**
   * Actualizar el status de un proyecto a GARMENT
   */
  updateProjectStatus(projectId: string, status: string, currentProject?: Project): Observable<ProjectResult> {
    console.log('🔄 DesignLabService - Updating project status:', { projectId, status });

    // Construir el body con todos los campos para no perder datos
    const updateData: any = { status };

    if (currentProject) {
      updateData.previewUrl = currentProject.previewUrl;
      updateData.garmentColor = currentProject.garmentColor;
      updateData.garmentSize = currentProject.garmentSize;
      updateData.garmentGender = currentProject.garmentGender;

      console.log('🔄 Preserving current project fields:', {
        previewUrl: currentProject.previewUrl,
        garmentColor: currentProject.garmentColor,
        garmentSize: currentProject.garmentSize,
        garmentGender: currentProject.garmentGender
      });
    }

    return this.updateProjectDetails(projectId, updateData);
  }

  // ==================== LAYER METHODS ====================

  /**
   * Crear una nueva capa de texto
   */
  createTextLayer(request: CreateTextLayerRequest): Observable<LayerResult> {
    console.log('📝 DesignLabService - Creating text layer:', request);

    const url = `${BASE_URL}/layers/texts`;

    console.log('📝 DesignLabService - Request URL:', url);
    console.log('📝 DesignLabService - Request body:', request);

    return this.http.post<LayerOperationResponse>(url, request, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Text layer created successfully:', response);
        return {
          success: response.success,
          layerId: response.layerId,
          error: response.error
        };
      }),
      catchError(error => {
        console.error('❌ Error creating text layer:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Crear una nueva capa de imagen
   */
  createImageLayer(request: CreateImageLayerRequest): Observable<LayerResult> {
    console.log('🖼️ DesignLabService - Creating image layer:', request);

    const url = `${BASE_URL}/${request.projectId}/layers/image`;

    return this.http.post<LayerOperationResponse>(url, request, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Image layer created successfully:', response);
        return {
          success: response.success,
          layerId: response.layerId,
          error: response.error
        };
      }),
      catchError(error => {
        console.error('❌ Error creating image layer:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Actualizar una capa de texto
   */
  updateTextLayer(projectId: string, layerId: string, request: UpdateTextLayerRequest): Observable<LayerResult> {
    console.log('📝 DesignLabService - Updating text layer:', { projectId, layerId, request });

    const url = `${BASE_URL}/${projectId}/layers/${layerId}/text`;

    return this.http.put<LayerOperationResponse>(url, request, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Text layer updated successfully:', response);
        return {
          success: response.success,
          layerId: response.layerId,
          error: response.error
        };
      }),
      catchError(error => {
        console.error('❌ Error updating text layer:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Actualizar una capa de imagen
   */
  updateImageLayer(projectId: string, layerId: string, request: UpdateImageLayerRequest): Observable<LayerResult> {
    console.log('🖼️ DesignLabService - Updating image layer:', { projectId, layerId, request });

    const url = `${BASE_URL}/${projectId}/layers/${layerId}/image`;

    return this.http.put<LayerOperationResponse>(url, request, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Image layer updated successfully:', response);
        return {
          success: response.success,
          layerId: response.layerId,
          error: response.error
        };
      }),
      catchError(error => {
        console.error('❌ Error updating image layer:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Actualizar coordenadas de una capa
   */
  updateLayerCoordinates(projectId: string, layerId: string, request: UpdateLayerCoordinatesRequest): Observable<LayerResult> {
    console.log('📍 DesignLabService - Updating layer coordinates:', { projectId, layerId, request });

    const url = `${BASE_URL}/${projectId}/layers/${layerId}/coordinates`;

    return this.http.put<LayerOperationResponse>(url, request, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Layer coordinates updated successfully:', response);
        return {
          success: response.success,
          layerId: response.layerId,
          error: response.error
        };
      }),
      catchError(error => {
        console.error('❌ Error updating layer coordinates:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Eliminar una capa
   */
  deleteLayer(projectId: string, layerId: string): Observable<LayerResult> {
    console.log('🗑️ DesignLabService - Deleting layer:', { projectId, layerId });

    const url = `${BASE_URL}/${projectId}/layers/${layerId}`;

    return this.http.delete<LayerOperationResponse>(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Layer deleted successfully:', response);
        return {
          success: response.success,
          layerId: response.layerId,
          error: response.error
        };
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
   * Mapear ProjectResponse a Project entity
   */
  private mapToProject(response: ProjectResponse): Project {
    return new Project(
      response.id,
      response.title,
      response.userId,
      response.previewUrl,
      response.status,
      response.garmentColor,
      response.garmentSize,
      response.garmentGender,
      response.layers?.map(layer => this.mapToLayer(layer)) || [],
      new Date(response.createdAt),
      new Date(response.updatedAt)
    );
  }

  /**
   * Mapear LayerResponse a Layer entity
   */
  private mapToLayer(response: LayerResponse): Layer {
    if (response.type === LayerType.TEXT) {
      return new TextLayer(
        response.id,
        response.x,
        response.y,
        response.z,
        response.opacity,
        response.isVisible,
        new Date(response.createdAt),
        new Date(response.updatedAt),
        response.details || {
          text: '',
          fontFamily: 'Arial',
          fontSize: 16,
          fontColor: '#000000',
          isBold: false,
          isItalic: false,
          isUnderlined: false
        }
      );
    }

    if (response.type === LayerType.IMAGE) {
      return new ImageLayer(
        response.id,
        response.x,
        response.y,
        response.z,
        response.opacity,
        response.isVisible,
        response.details?.imageUrl || ''
      );
    }

    // Fallback para tipos no reconocidos
    return new TextLayer(
      response.id,
      response.x,
      response.y,
      response.z,
      response.opacity,
      response.isVisible,
      new Date(response.createdAt),
      new Date(response.updatedAt),
      { text: '', fontFamily: 'Arial', fontSize: 16, fontColor: '#000000', isBold: false, isItalic: false, isUnderlined: false }
    );
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
