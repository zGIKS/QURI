import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../iam/services/authentication.service';
import { Project } from '../model/project.entity';
import { DesignLabAssembler } from './design-lab.assemblers';
import { CloudinaryService, ImageUploadWithDimensions } from './cloudinary.service';

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
  private cloudinaryService = inject(CloudinaryService);

  constructor() {
    console.log('🚀 DesignLabService initialized with real endpoints');
  }

  /**
   * Obtener token de autenticación de forma segura
   */
  private getAuthToken(): string {
    console.log('🔑 DesignLabService - Getting auth token...');

    // Intentar obtener el token del AuthenticationService
    let token = this.authService.getToken();
    console.log('🔑 Token from AuthService:', token?.substring(0, 20) + '...');

    // Si no hay token, forzar verificación de localStorage
    if (!token) {
      console.log('🔑 No token from AuthService, checking localStorage directly...');
      token = localStorage.getItem('token');
      console.log('🔑 Token from localStorage:', token?.substring(0, 20) + '...');

      // Si encontramos token en localStorage, forzar restauración en AuthService
      if (token) {
        console.log('🔑 Found token in localStorage, forcing checkStoredAuthentication...');
        this.authService.checkStoredAuthentication();
      }
    }

    // Validar que el token existe
    if (!token) {
      console.error('❌ No authentication token found anywhere!');
      console.error('❌ localStorage token:', localStorage.getItem('token'));
      console.error('❌ AuthService token:', this.authService.getToken());
      return '';
    }

    console.log('✅ Token obtained successfully:', token.substring(0, 20) + '...');
    return token;
  }

  /**
   * Asegurar que la autenticación esté disponible
   */
  private ensureAuthentication(): void {
    console.log('🔧 DesignLabService - Ensuring authentication is available...');

    // Verificar localStorage directamente
    const tokenInStorage = localStorage.getItem('token');
    const userIdInStorage = localStorage.getItem('userId');
    const usernameInStorage = localStorage.getItem('username');

    console.log('🔧 Authentication data in localStorage:');
    console.log('  - token exists:', !!tokenInStorage);
    console.log('  - userId exists:', !!userIdInStorage);
    console.log('  - username exists:', !!usernameInStorage);

    if (tokenInStorage && userIdInStorage && usernameInStorage) {
      console.log('🔧 All auth data found in localStorage, forcing checkStoredAuthentication');
      this.authService.checkStoredAuthentication();
    } else {
      console.error('❌ Missing authentication data in localStorage!');
      console.error('❌ User needs to sign in again');
    }
  }

  // ==================== PROJECT METHODS ====================

  /**
   * Obtener todos los proyectos de un usuario
   * GET http://localhost:8080/api/v1/projects?userId=cd9b8fcb-b943-40cf-aa90-a5cd1812f602
   */
  getProjectsByUser(userId: string): Observable<Project[]> {
    console.log('📋 DesignLabService - Getting projects for user:', userId);

    // SIEMPRE asegurar autenticación antes de hacer petición
    this.ensureAuthentication();

    // Debug del estado completo de autenticación
    this.debugAuthenticationState();

    const params = new HttpParams().set('userId', userId);

    console.log('📋 Making HTTP request with params:', params.toString());
    console.log('📋 Base URL:', BASE_URL);

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
        console.error('❌ URL was:', BASE_URL);
        console.error('❌ Params were:', params.toString());

        // Debug adicional en caso de error
        console.error('❌ Running authentication debug after error:');
        this.debugAuthenticationState();

        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Obtener todos los proyectos de un usuario con retry en caso de problemas de autenticación
   * GET http://localhost:8080/api/v1/projects?userId=cd9b8fcb-b943-40cf-aa90-a5cd1812f602
   */
  getProjectsByUserWithRetry(userId: string): Observable<Project[]> {
    return new Observable(observer => {
      // Primero intentar inmediatamente
      this.getProjectsByUser(userId).subscribe({
        next: (projects) => {
          observer.next(projects);
          observer.complete();
        },
        error: (error) => {
          // Si es error 401, esperar un poco y reintentar una vez
          if (error.includes('Token expirado') || error.includes('401')) {
            console.log('🔄 Retrying after authentication error...');

            setTimeout(() => {
              // Forzar verificación de autenticación
              this.authService.checkStoredAuthentication();

              // Reintentar
              this.getProjectsByUser(userId).subscribe({
                next: (projects) => {
                  observer.next(projects);
                  observer.complete();
                },
                error: (retryError) => {
                  observer.error(retryError);
                }
              });
            }, 1000); // Esperar 1 segundo
          } else {
            observer.error(error);
          }
        }
      });
    });
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
   * Sube una imagen a Cloudinary y crea automáticamente un layer de imagen
   * @param file El archivo de imagen a subir
   * @param projectId El ID del proyecto donde crear el layer
   * @returns Observable con el resultado de la creación del layer
   */
  uploadImageAndCreateLayer(file: File, projectId: string): Observable<LayerResult> {
    console.log('🖼️ DesignLabService - Uploading image and creating layer:', { projectId, fileName: file.name });

    return this.cloudinaryService.uploadImageWithDimensions(file).pipe(
      switchMap((result: ImageUploadWithDimensions) => {
        console.log('📤 Image uploaded, creating layer:', result);

        // Usar las dimensiones calculadas para crear el layer
        const createLayerRequest = {
          imageUrl: result.cloudinaryResult.secure_url,
          width: result.calculatedDimensions.width.toString(),
          height: result.calculatedDimensions.height.toString()
        };

        return this.createImageLayer(projectId, createLayerRequest);
      }),
      catchError(error => {
        console.error('❌ Error uploading image and creating layer:', error);
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

  /**
   * Debug del estado de autenticación
   */
  debugAuthenticationState(): void {
    console.log('🔍 ===== AUTHENTICATION DEBUG =====');
    console.log('🔍 localStorage data:');
    console.log('  - token:', localStorage.getItem('token')?.substring(0, 30) + '...');
    console.log('  - userId:', localStorage.getItem('userId'));
    console.log('  - username:', localStorage.getItem('username'));

    console.log('🔍 AuthenticationService data:');
    console.log('  - getToken():', this.authService.getToken()?.substring(0, 30) + '...');
    console.log('  - hasValidToken():', this.authService.hasValidToken());
    console.log('  - isAuthenticated():', this.isAuthenticated());

    // Forzar check de autenticación y ver resultado
    console.log('🔍 Forcing checkStoredAuthentication...');
    const authResult = this.authService.checkStoredAuthentication();
    console.log('  - checkStoredAuthentication() result:', authResult);

    // Verificar headers que se crearían
    console.log('🔍 Testing token retrieval:');
    const token = this.getAuthToken();
    console.log('  - getAuthToken() result:', token.substring(0, 30) + '...');

    console.log('🔍 ===== END AUTHENTICATION DEBUG =====');
  }

  // ==================== PRIVATE METHODS ====================

  /**
   * Obtener headers HTTP con autenticación
   * SIEMPRE incluye Bearer token
   */
  private getHeaders(): HttpHeaders {
    console.log('🔧 DesignLabService - Creating headers with authentication...');

    // Obtener token de forma robusta
    const token = this.getAuthToken();

    // Crear headers con Bearer token SIEMPRE
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    console.log('🔧 Headers created:');
    console.log('  - Content-Type: application/json');
    console.log('  - Authorization: Bearer', token.substring(0, 20) + '...');
    console.log('  - Full headers keys:', headers.keys());

    // Verificar que el header Authorization se creó correctamente
    const authHeader = headers.get('Authorization');
    console.log('🔧 Authorization header value:', authHeader?.substring(0, 30) + '...');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Authorization header is malformed!');
      console.error('❌ Expected: Bearer <token>');
      console.error('❌ Actual:', authHeader);
    } else {
      console.log('✅ Authorization header is correctly formatted');
    }

    return headers;
  }

  /**
   * Obtener mensaje de error legible
   */
  private getErrorMessage(error: any): string {
    console.log('🔍 DesignLabService - Error details:', error);
    console.log('🔍 DesignLabService - Error status:', error.status);
    console.log('🔍 DesignLabService - Error message:', error.message);
    console.log('🔍 DesignLabService - Error body:', error.error);

    if (error.status === 401) {
      console.error('🔒 Authentication failed - Token might be invalid or expired');
      console.error('🔒 Current token:', this.authService.getToken()?.substring(0, 20) + '...');
      console.error('🔒 Is authenticated:', this.isAuthenticated());

      // Intentar refrescar la autenticación
      this.authService.checkStoredAuthentication();

      return 'Token expirado o inválido. Por favor, inicia sesión nuevamente.';
    } else if (error.status === 403) {
      return 'No tienes permisos para realizar esta acción.';
    } else if (error.status === 404) {
      return 'Recurso no encontrado.';
    } else if (error.status === 500) {
      return 'Error interno del servidor. Intenta nuevamente más tarde.';
    } else if (error.status === 0) {
      console.error('🌐 Network error - No response from server');
      return 'Error de conexión. Verifica tu conexión a internet.';
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return 'Error desconocido. Intenta nuevamente.';
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  private isAuthenticated(): boolean {
    return this.authService.hasValidToken();
  }
}
