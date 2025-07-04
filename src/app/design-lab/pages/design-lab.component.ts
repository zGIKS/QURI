import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectService } from '../services/project.service';
import { Project } from '../model/project.entity';

@Component({
  selector: 'app-design-lab',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    RouterModule,
    TranslateModule
  ],
  template: `
    <div class="design-lab-container">
      <mat-toolbar color="primary" class="design-lab-toolbar">
        <button mat-icon-button routerLink="/home/dashboard">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="toolbar-title">{{ 'navigation.designLab' | translate }}</span>
        <span class="toolbar-spacer"></span>
        <button mat-icon-button>
          <mat-icon>help</mat-icon>
        </button>
      </mat-toolbar>

      <div class="design-lab-content">
        <!-- Projects Section -->
        <section class="projects-section">
          <div class="section-header">
            <h2>Mis Proyectos</h2>
            <button mat-raised-button color="primary" (click)="createNewProject()">
              <mat-icon>add</mat-icon>
              Nuevo Proyecto
            </button>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoading" class="loading-container">
            <mat-spinner></mat-spinner>
            <p>Cargando proyectos...</p>
          </div>

          <!-- Error State -->
          <div *ngIf="error" class="error-container">
            <mat-icon color="warn">error</mat-icon>
            <p>Error al cargar los proyectos: {{ error }}</p>
            <button mat-raised-button color="primary" (click)="loadProjects()">
              <mat-icon>refresh</mat-icon>
              Reintentar
            </button>
          </div>

          <!-- Projects Grid -->
          <div *ngIf="!isLoading && !error" class="projects-grid">
            <div *ngIf="projects.length === 0" class="empty-state">
              <mat-icon>folder_open</mat-icon>
              <h3>No hay proyectos</h3>
              <p>Crea tu primer proyecto para comenzar a diseñar</p>
              <button mat-raised-button color="primary" (click)="createNewProject()">
                Crear Proyecto
              </button>
            </div>

            <mat-card *ngFor="let project of projects" class="project-card">
              <div class="project-preview">
                <img
                  *ngIf="project.previewUrl"
                  [src]="project.previewUrl"
                  [alt]="project.title"
                  class="preview-image">
                <div *ngIf="!project.previewUrl" class="no-preview">
                  <mat-icon>image</mat-icon>
                  <span>Sin vista previa</span>
                </div>
              </div>

              <mat-card-header>
                <mat-card-title>{{ project.title }}</mat-card-title>
                <mat-card-subtitle>
                  Creado: {{ project.createdAt | date:'short' }}
                </mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <div class="project-details">
                  <mat-chip-set>
                    <mat-chip>{{ project.status }}</mat-chip>
                    <mat-chip>{{ project.garmentColor }}</mat-chip>
                    <mat-chip>{{ project.garmentSize }}</mat-chip>
                  </mat-chip-set>
                  <p class="layers-count">{{ project.layers.length }} capas</p>
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-button color="primary" (click)="editProject(project.id)">
                  <mat-icon>edit</mat-icon>
                  Editar
                </button>
                <button mat-button (click)="duplicateProject(project.id)">
                  <mat-icon>content_copy</mat-icon>
                  Duplicar
                </button>
                <button mat-button color="warn" (click)="deleteProject(project.id)">
                  <mat-icon>delete</mat-icon>
                  Eliminar
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .design-lab-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .design-lab-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .toolbar-title {
      font-size: 20px;
      font-weight: 500;
      margin-left: 16px;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .design-lab-content {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section {
      margin-bottom: 32px;
    }

    .welcome-card {
      text-align: center;
    }

    .welcome-avatar {
      background-color: #673ab7 !important;
      color: white !important;
    }

    /* Projects Section */
    .projects-section {
      margin-bottom: 32px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .section-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      text-align: center;
    }

    .loading-container mat-spinner {
      margin-bottom: 16px;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      text-align: center;
      color: #f44336;
    }

    .error-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      text-align: center;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      color: #ccc;
    }

    .project-card {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .project-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .project-preview {
      width: 100%;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      overflow: hidden;
    }

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #999;
    }

    .no-preview mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }

    .project-details {
      margin: 16px 0;
    }

    .layers-count {
      margin: 8px 0 0 0;
      font-size: 14px;
      color: #666;
    }

    mat-chip-set {
      margin-bottom: 8px;
    }

    mat-card-actions {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }

    mat-card-actions button {
      flex: 1;
      min-width: 0;
    }

    @media (max-width: 768px) {
      .design-lab-content {
        padding: 16px;
      }

      .projects-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .section-header h2 {
        text-align: center;
      }

      mat-card-actions {
        flex-direction: column;
      }

      mat-card-actions button {
        width: 100%;
      }
    }
  `]
})
export class DesignLabComponent implements OnInit {
  projects: Project[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.error = null;

    console.log('🚀 Starting to load projects...');
    console.log('🔑 Current token:', localStorage.getItem('token')?.substring(0, 20) + '...');
    console.log('👤 Current user ID:', localStorage.getItem('userId'));
    console.log('📝 Current username:', localStorage.getItem('username'));

    this.projectService.getUserBlueprints().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoading = false;
        console.log('✅ Projects loaded successfully:', projects);
      },
      error: (error) => {
        this.error = error.message || 'Error al cargar los proyectos';
        this.isLoading = false;

        // Agregar más información sobre el error
        if (error.status === 401) {
          console.error('🔒 Unauthorized - Token might be invalid or expired');
          this.error = 'Token expirado o inválido. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 403) {
          console.error('🚫 Forbidden - User might not have required permissions');
          this.error = 'No tienes permisos para acceder a esta funcionalidad.';
        } else if (error.status === 500) {
          console.error('🔥 Server error');
          this.error = 'Error interno del servidor. Intenta nuevamente más tarde.';
        }
      }
    });
  }

  createNewProject(): void {
    // TODO: Implementar navegación a la creación de proyecto
    console.log('Creating new project...');
    // Por ahora, mostrar un mensaje
    alert('Funcionalidad de crear proyecto en desarrollo');
  }

  editProject(projectId: string): void {
    // TODO: Implementar navegación al editor de proyecto
    console.log('Editing project:', projectId);
    alert(`Editando proyecto: ${projectId}`);
  }

  duplicateProject(projectId: string): void {
    // TODO: Implementar duplicación de proyecto
    console.log('Duplicating project:', projectId);
    alert(`Duplicando proyecto: ${projectId}`);
  }

  deleteProject(projectId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      // TODO: Implementar eliminación de proyecto
      console.log('Deleting project:', projectId);
      alert(`Eliminando proyecto: ${projectId}`);
    }
  }
}
