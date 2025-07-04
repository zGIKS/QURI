import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../iam/services/authentication.service';
import { DesignLabAssembler } from './design-lab.assembler';
import {
  CreateProjectCommand,
  UpdateLayerCoordinatesCommand,
  CreateTextLayerCommand,
  CreateImageLayerCommand,
  UpdateTextLayerCommand,
  UpdateImageLayerCommand,
  DeleteProjectCommand,
  ProjectCommandResult,
  LayerCommandResult,
  DeleteProjectResult
} from './design-lab.commands';
import {
  CreateProjectResponse,
  LayerOperationResponse,
  DeleteProjectResponse
} from './design-lab.response';

const BASE_URL = `${environment.serverBaseUrl}/api/v1/projects`;

@Injectable({
  providedIn: 'root',
})
export class DesignLabCommandService {
  private http = inject(HttpClient);
  private authService = inject(AuthenticationService);
  private assembler = inject(DesignLabAssembler);

  constructor() {
    console.log('🆕 DesignLabCommandService initialized');
  }

  /**
   * Crear un nuevo proyecto
   */
  createProject(command: CreateProjectCommand): Observable<ProjectCommandResult> {
    console.log('🆕 DesignLabCommandService - Creating project:', command);

    // Validación de autenticación
    if (!this.authService.hasValidToken()) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const request = this.assembler.toCreateProjectRequest(command);

    return this.http.post<CreateProjectResponse>(BASE_URL, request, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Project created successfully:', response);
        return this.assembler.toProjectCommandResult(response);
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
  deleteProject(command: DeleteProjectCommand): Observable<DeleteProjectResult> {
    console.log('🗑️ DesignLabCommandService - Deleting project:', command);

    if (!this.authService.hasValidToken()) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const url = `${BASE_URL}/${command.projectId}`;

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

  /**
   * Actualizar coordenadas de una capa
   */
  updateLayerCoordinates(command: UpdateLayerCoordinatesCommand): Observable<LayerCommandResult> {
    console.log('📍 DesignLabCommandService - Updating layer coordinates:', command);

    if (!this.authService.hasValidToken()) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const request = this.assembler.toUpdateLayerCoordinatesRequest(command);
    const url = `${BASE_URL}/${command.projectId}/layers/${command.layerId}/coordinates`;

    return this.http.put<LayerOperationResponse>(url, request, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Layer coordinates updated successfully:', response);
        return this.assembler.toLayerCommandResult(response);
      }),
      catchError(error => {
        console.error('❌ Error updating layer coordinates:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Crear una nueva capa de texto
   */
  createTextLayer(command: CreateTextLayerCommand): Observable<LayerCommandResult> {
    console.log('📝 DesignLabCommandService - Creating text layer:', command);

    if (!this.authService.hasValidToken()) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const request = this.assembler.toCreateTextLayerRequest(command);
    const url = `${BASE_URL}/layers/texts`;

    return this.http.post<LayerOperationResponse>(url, request, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Text layer created successfully:', response);
        return this.assembler.toLayerCommandResult(response);
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
  createImageLayer(command: CreateImageLayerCommand): Observable<LayerCommandResult> {
    console.log('🖼️ DesignLabCommandService - Creating image layer:', command);

    if (!this.authService.hasValidToken()) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const request = this.assembler.toCreateImageLayerRequest(command);
    const url = `${BASE_URL}/${command.projectId}/layers/image`;

    return this.http.post<LayerOperationResponse>(url, request, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Image layer created successfully:', response);
        return this.assembler.toLayerCommandResult(response);
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
  updateTextLayer(command: UpdateTextLayerCommand): Observable<LayerCommandResult> {
    console.log('📝 DesignLabCommandService - Updating text layer:', command);

    if (!this.authService.hasValidToken()) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const request = this.assembler.toUpdateTextLayerRequest(command);
    const url = `${BASE_URL}/${command.projectId}/layers/${command.layerId}/text`;

    return this.http.put<LayerOperationResponse>(url, request, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Text layer updated successfully:', response);
        return this.assembler.toLayerCommandResult(response);
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
  updateImageLayer(command: UpdateImageLayerCommand): Observable<LayerCommandResult> {
    console.log('🖼️ DesignLabCommandService - Updating image layer:', command);

    if (!this.authService.hasValidToken()) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const request = this.assembler.toUpdateImageLayerRequest(command);
    const url = `${BASE_URL}/${command.projectId}/layers/${command.layerId}/image`;

    return this.http.put<LayerOperationResponse>(url, request, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Image layer updated successfully:', response);
        return this.assembler.toLayerCommandResult(response);
      }),
      catchError(error => {
        console.error('❌ Error updating image layer:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Eliminar una capa
   */
  deleteLayer(projectId: string, layerId: string): Observable<LayerCommandResult> {
    console.log('🗑️ DesignLabCommandService - Deleting layer:', { projectId, layerId });

    if (!this.authService.hasValidToken()) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const url = `${BASE_URL}/${projectId}/layers/${layerId}`;

    return this.http.delete<LayerOperationResponse>(url, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Layer deleted successfully:', response);
        return this.assembler.toLayerCommandResult(response);
      }),
      catchError(error => {
        console.error('❌ Error deleting layer:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Obtener headers HTTP (sin Authorization ya que el interceptor se encarga)
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
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
