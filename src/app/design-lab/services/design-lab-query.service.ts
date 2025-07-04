import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../iam/services/authentication.service';
import { DesignLabAssembler } from './design-lab.assembler';
import { Project } from '../model/project.entity';
import {
  GetProjectByIdQuery,
  GetProjectsByUserQuery
} from './design-lab.queries';
import { ProjectResponse } from './design-lab.response';

const BASE_URL = `${environment.serverBaseUrl}/api/v1/projects`;

@Injectable({
  providedIn: 'root',
})
export class DesignLabQueryService {
  private http = inject(HttpClient);
  private authService = inject(AuthenticationService);
  private assembler = inject(DesignLabAssembler);

  constructor() {
    console.log('🔍 DesignLabQueryService initialized');
  }

  /**
   * Obtener proyecto por ID
   */
  getProjectById(query: GetProjectByIdQuery): Observable<Project> {
    console.log('🔍 DesignLabQueryService - Getting project:', query.projectId);

    if (!this.authService.hasValidToken()) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    return this.http.get<ProjectResponse>(`${BASE_URL}/${query.projectId}`, {
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
   * Obtener proyectos de un usuario
   */
  getProjectsByUser(query: GetProjectsByUserQuery): Observable<Project[]> {
    console.log('🔍 DesignLabQueryService - Getting projects for user:', query.userId);

    if (!this.authService.hasValidToken()) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const params = new HttpParams().set('userId', query.userId);

    return this.http.get<ProjectResponse[]>(BASE_URL, {
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
   * Obtener todos los proyectos públicos
   */
  getAllPublicProjects(): Observable<Project[]> {
    console.log('🔍 DesignLabQueryService - Getting all public projects');

    if (!this.authService.hasValidToken()) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    return this.http.get<ProjectResponse[]>(BASE_URL, {
      headers: this.getHeaders()
    }).pipe(
      map(responses => {
        console.log('✅ Public projects fetched successfully:', responses);
        return this.assembler.toProjectEntities(responses);
      }),
      catchError(error => {
        console.error('❌ Error fetching public projects:', error);
        return throwError(() => this.getErrorMessage(error));
      })
    );
  }

  /**
   * Obtener headers HTTP con autenticación
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Obtener mensaje de error legible
   */
  private getErrorMessage(error: any): string {
    if (error.status === 401) {
      return 'Token expirado o inválido. Por favor, inicia sesión nuevamente.';
    } else if (error.status === 403) {
      return 'No tienes permisos para acceder a este recurso.';
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
