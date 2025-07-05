import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { DesignLabService } from '../services/design-lab-real.service';
import { AuthenticationService } from '../../iam/services/authentication.service';
import { Project } from '../model/project.entity';
import { DeleteProjectDialogComponent, DeleteProjectDialogData } from '../components/delete-project-dialog/delete-project-dialog.component';

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
    MatSnackBarModule,
    MatDialogModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './design-lab.component.html',
  styleUrls: ['./design-lab.component.css'],
})
export class DesignLabComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  isLoading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private designLabService: DesignLabService,
    private authService: AuthenticationService,
    private translateService: TranslateService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.error = null;

    console.log('🚀 Starting to load projects...');

    // Get userId directly from localStorage to avoid subscription issues
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.error = this.translateService.instant('designLab.tokenExpired');
      this.isLoading = false;
      return;
    }

    console.log('👤 Using user ID from localStorage:', userId);

    this.designLabService.getProjectsByUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects: Project[]) => {
          this.projects = projects;
          this.isLoading = false;
          console.log('✅ Projects loaded successfully:', projects);
        },
        error: (error: any) => {
          this.error = error.message || this.translateService.instant('designLab.errorLoadingProjects');
          this.isLoading = false;

          // Handle specific error cases
          if (error.status === 401) {
            console.error('🔒 Unauthorized - Token might be invalid or expired');
            this.error = this.translateService.instant('designLab.tokenExpired');
          } else if (error.status === 403) {
            console.error('🚫 Forbidden - User might not have required permissions');
            this.error = this.translateService.instant('designLab.noPermissions');
          } else if (error.status === 500) {
            console.error('🔥 Server error');
            this.error = this.translateService.instant('designLab.serverError');
          } else {
            console.error('🔥 Unexpected error:', error);
            this.error = this.translateService.instant('designLab.errorLoadingProjects');
          }
        }
      });
  }

  createNewProject(): void {
    console.log('Creating new project...');
    this.router.navigate(['/home/design-lab/create']);
  }

  /**
   * Método de debugging temporal para verificar los datos del proyecto
   */
  debugProjectData(project: any): void {
    console.log('🔍 DEBUG - Project data:', {
      project: project,
      id: project?.id,
      hasId: !!project?.id,
      type: typeof project?.id,
      keys: project ? Object.keys(project) : 'no project'
    });
  }

  editProject(projectId: string): void {
    console.log('🔧 Editing project:', projectId);
    console.log('🧭 Navigating to:', ['/home/design-lab/edit', projectId]);

    if (!projectId) {
      console.error('❌ Project ID is empty or null');
      this.snackBar.open(
        'Error: Project ID is invalid',
        this.translateService.instant('common.close'),
        {
          duration: 3000,
          panelClass: ['error-snackbar']
        }
      );
      return;
    }

    this.router.navigate(['/home/design-lab/edit', projectId]).then(
      (success) => {
        console.log('🎯 Navigation result:', success);
      },
      (error) => {
        console.error('❌ Navigation error:', error);
      }
    );
  }

  duplicateProject(projectId: string): void {
    // TODO: Implementar duplicación de proyecto
    console.log('Duplicating project:', projectId);
    alert(`${this.translateService.instant('designLab.duplicate')}: ${projectId}`);
  }

  deleteProject(projectId: string): void {
    // Buscar el proyecto en la lista para obtener el título
    const project = this.projects.find(p => p.id === projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return;
    }

    const dialogData: DeleteProjectDialogData = {
      projectTitle: project.title,
      projectId: project.id
    };

    const dialogRef = this.dialog.open(DeleteProjectDialogComponent, {
      width: '450px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.performDeleteProject(projectId);
      }
    });
  }  private performDeleteProject(projectId: string): void {
    console.log('🗑️ Deleting project:', projectId);

    this.designLabService.deleteProject(projectId).subscribe({
      next: (result) => {
        console.log('✅ Project deleted successfully:', result);

        // Remover el proyecto de la lista local
        this.projects = this.projects.filter(p => p.id !== projectId);

        this.snackBar.open(
          this.translateService.instant('designLab.messages.projectDeleted'),
          this.translateService.instant('common.close'),
          {
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );
      },
      error: (error: any) => {
        console.error('❌ Error deleting project:', error);

        this.snackBar.open(
          error || this.translateService.instant('designLab.errors.deleteFailed'),
          this.translateService.instant('common.close'),
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  /**
   * Verifica si un proyecto puede ser editado
   * Los proyectos con estado GARMENT no pueden ser editados
   */
  canEditProject(project: Project): boolean {
    return project.status !== 'GARMENT';
  }

  /**
   * Verifica si un proyecto puede ser puesto a la venta
   * Los proyectos con estado GARMENT no pueden ser puestos a la venta
   */
  canSellProject(project: Project): boolean {
    return project.status !== 'GARMENT';
  }

  /**
   * Verifica si un proyecto está en estado GARMENT
   */
  isGarmentProject(project: Project): boolean {
    return project.status === 'GARMENT';
  }
}
