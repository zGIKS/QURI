import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DesignLabCommandService } from './design-lab-command.service';
import { DesignLabQueryService } from './design-lab-query.service';
import { Project } from '../model/project.entity';
import {
  CreateProjectCommand,
  UpdateLayerCoordinatesCommand,
  CreateTextLayerCommand,
  CreateImageLayerCommand,
  UpdateTextLayerCommand,
  UpdateImageLayerCommand,
  ProjectCommandResult,
  LayerCommandResult
} from './design-lab.commands';
import {
  GetProjectByIdQuery,
  GetProjectsByUserQuery
} from './design-lab.queries';

/**
 * Servicio de aplicación para Design Lab
 * Coordinador principal que delega a Command y Query services
 * Implementa el patrón CQRS (Command Query Responsibility Segregation)
 */
@Injectable({
  providedIn: 'root',
})
export class DesignLabApplicationService {
  private commandService = inject(DesignLabCommandService);
  private queryService = inject(DesignLabQueryService);

  constructor() {
    console.log('🏗️ DesignLabApplicationService initialized with CQRS pattern');
  }

  // ==================== COMMANDS ====================

  /**
   * Crear un nuevo proyecto
   */
  createProject(command: CreateProjectCommand): Observable<ProjectCommandResult> {
    console.log('🏗️ ApplicationService - Delegating createProject command');
    return this.commandService.createProject(command);
  }

  /**
   * Actualizar coordenadas de una capa
   */
  updateLayerCoordinates(command: UpdateLayerCoordinatesCommand): Observable<LayerCommandResult> {
    console.log('🏗️ ApplicationService - Delegating updateLayerCoordinates command');
    return this.commandService.updateLayerCoordinates(command);
  }

  /**
   * Crear una nueva capa de texto
   */
  createTextLayer(command: CreateTextLayerCommand): Observable<LayerCommandResult> {
    console.log('🏗️ ApplicationService - Delegating createTextLayer command');
    return this.commandService.createTextLayer(command);
  }

  /**
   * Crear una nueva capa de imagen
   */
  createImageLayer(command: CreateImageLayerCommand): Observable<LayerCommandResult> {
    console.log('🏗️ ApplicationService - Delegating createImageLayer command');
    return this.commandService.createImageLayer(command);
  }

  /**
   * Actualizar una capa de texto
   */
  updateTextLayer(command: UpdateTextLayerCommand): Observable<LayerCommandResult> {
    console.log('🏗️ ApplicationService - Delegating updateTextLayer command');
    return this.commandService.updateTextLayer(command);
  }

  /**
   * Actualizar una capa de imagen
   */
  updateImageLayer(command: UpdateImageLayerCommand): Observable<LayerCommandResult> {
    console.log('🏗️ ApplicationService - Delegating updateImageLayer command');
    return this.commandService.updateImageLayer(command);
  }

  /**
   * Eliminar una capa
   */
  deleteLayer(projectId: string, layerId: string): Observable<LayerCommandResult> {
    console.log('🏗️ ApplicationService - Delegating deleteLayer command');
    return this.commandService.deleteLayer(projectId, layerId);
  }

  // ==================== QUERIES ====================

  /**
   * Obtener proyecto por ID
   */
  getProjectById(projectId: string): Observable<Project> {
    console.log('🏗️ ApplicationService - Delegating getProjectById query');
    const query: GetProjectByIdQuery = { projectId };
    return this.queryService.getProjectById(query);
  }

  /**
   * Obtener proyectos de un usuario
   */
  getProjectsByUser(userId: string): Observable<Project[]> {
    console.log('🏗️ ApplicationService - Delegating getProjectsByUser query');
    const query: GetProjectsByUserQuery = { userId };
    return this.queryService.getProjectsByUser(query);
  }

  /**
   * Obtener todos los proyectos públicos
   */
  getAllPublicProjects(): Observable<Project[]> {
    console.log('🏗️ ApplicationService - Delegating getAllPublicProjects query');
    return this.queryService.getAllPublicProjects();
  }

  // ==================== HELPER METHODS ====================

  /**
   * Obtener el ID del usuario actual desde localStorage
   */
  getCurrentUserId(): string | null {
    const userId = localStorage.getItem('userId');
    console.log('🏗️ ApplicationService - Current user ID:', userId);
    return userId;
  }

  /**
   * Validar que el usuario esté autenticado
   */
  isUserAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const isAuthenticated = !!(token && userId);
    console.log('🏗️ ApplicationService - User authenticated:', isAuthenticated);
    return isAuthenticated;
  }
}
