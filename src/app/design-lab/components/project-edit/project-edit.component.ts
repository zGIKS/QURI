import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DesignLabApplicationService } from '../../services/design-lab-application.service';
import { Project } from '../../model/project.entity';
import { Layer } from '../../model/layer.entity';
import { DesignCanvasComponent, LayerEvent } from '../design-canvas/design-canvas.component';
import { LayerToolbarComponent, LayerToolEvent } from '../layer-toolbar/layer-toolbar.component';

@Component({
  selector: 'app-project-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslateModule,
    DesignCanvasComponent,
    LayerToolbarComponent
  ],
  template: `
    <div class="project-edit-container">
      <mat-toolbar color="primary" class="project-edit-toolbar">
        <button mat-icon-button routerLink="/home/design-lab">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="toolbar-title" *ngIf="project">
          {{ project.title }} - {{ project.garmentColor }} {{ project.garmentSize }}
        </span>
        <span class="toolbar-spacer"></span>
        <button mat-icon-button (click)="saveProject()" [disabled]="isSaving">
          <mat-icon>save</mat-icon>
        </button>
        <button mat-icon-button>
          <mat-icon>more_vert</mat-icon>
        </button>
      </mat-toolbar>

      <div class="project-edit-content">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="loading-container">
          <mat-spinner></mat-spinner>
          <p>{{ 'designLab.loadingProject' | translate }}</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="error-container">
          <mat-icon color="warn">error</mat-icon>
          <p>{{ error }}</p>
          <button mat-raised-button color="primary" (click)="loadProject()">
            <mat-icon>refresh</mat-icon>
            {{ 'common.retry' | translate }}
          </button>
        </div>

        <!-- Project Editor -->
        <div *ngIf="project && !isLoading && !error" class="project-editor">
          <!-- Layer Toolbar -->
          <app-layer-toolbar
            [canSave]="true"
            [canExport]="true"
            (layerToolEvent)="onLayerToolEvent($event)">
          </app-layer-toolbar>

          <!-- Design Canvas -->
          <div class="canvas-container">
            <app-design-canvas
              [layers]="project.layers"
              [garmentColor]="getGarmentColorHex(project.garmentColor)"
              [canvasWidth]="800"
              [canvasHeight]="600"
              [readOnly]="false"
              (layerEvent)="onLayerEvent($event)"
              (layersChange)="onLayersChange($event)">
            </app-design-canvas>
          </div>

          <!-- Project Info Panel -->
          <div class="project-info-panel">
            <mat-card>
              <mat-card-header>
                <mat-card-title>{{ 'designLab.projectInfo' | translate }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">{{ 'designLab.projectTitle' | translate }}:</span>
                    <span class="info-value">{{ project.title }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ 'designLab.color' | translate }}:</span>
                    <span class="info-value">{{ project.garmentColor }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ 'designLab.size' | translate }}:</span>
                    <span class="info-value">{{ project.garmentSize }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ 'designLab.gender' | translate }}:</span>
                    <span class="info-value">{{ project.garmentGender }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ 'designLab.status' | translate }}:</span>
                    <span class="info-value">{{ project.status }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ 'designLab.layers' | translate }}:</span>
                    <span class="info-value">{{ project.layers.length }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">{{ 'designLab.lastModified' | translate }}:</span>
                    <span class="info-value">{{ project.updatedAt | date:'short' }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .project-edit-container {
      min-height: 100vh;
      background-color: #f5f5f5;
      display: flex;
      flex-direction: column;
    }

    .project-edit-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .toolbar-title {
      font-size: 18px;
      font-weight: 500;
      margin-left: 16px;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .project-edit-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      text-align: center;
    }

    .loading-container mat-spinner {
      margin-bottom: 16px;
    }

    .error-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #f44336;
    }

    .project-editor {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .canvas-container {
      flex: 1;
      display: flex;
      min-height: 600px;
    }

    .project-info-panel {
      padding: 16px;
      background: white;
      border-top: 1px solid #e0e0e0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-label {
      font-weight: 500;
      color: #666;
      font-size: 14px;
    }

    .info-value {
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .project-edit-content {
        padding: 8px;
      }

      .canvas-container {
        min-height: 400px;
      }

      .project-info-panel {
        padding: 12px;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProjectEditComponent implements OnInit {
  project: Project | null = null;
  isLoading = false;
  isSaving = false;
  error: string | null = null;
  projectId: string | null = null;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private designLabService = inject(DesignLabApplicationService);
  private translateService = inject(TranslateService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    if (this.projectId) {
      this.loadProject();
    } else {
      this.error = this.translateService.instant('designLab.errors.projectNotFound');
    }
  }

  loadProject(): void {
    if (!this.projectId) return;

    this.isLoading = true;
    this.error = null;

    console.log('🎨 Loading project:', this.projectId);

    this.designLabService.getProjectById(this.projectId).subscribe({
      next: (project: Project) => {
        this.project = project;
        this.isLoading = false;
        console.log('✅ Project loaded successfully:', project);
      },
      error: (error: any) => {
        this.error = error.message || this.translateService.instant('designLab.errors.loadingFailed');
        this.isLoading = false;
        console.error('❌ Error loading project:', error);
      }
    });
  }

  saveProject(): void {
    if (!this.project || this.isSaving) return;

    this.isSaving = true;
    console.log('💾 Saving project:', this.project.id);

    // For now, just simulate saving - in real implementation, call the service
    setTimeout(() => {
      this.isSaving = false;
      this.snackBar.open(
        this.translateService.instant('designLab.messages.projectSaved'),
        this.translateService.instant('common.close'),
        {
          duration: 3000,
          panelClass: ['success-snackbar']
        }
      );
    }, 1000);
  }

  onLayerToolEvent(event: LayerToolEvent): void {
    console.log('🔧 Layer tool event:', event);

    if (!this.project) return;

    switch (event.type) {
      case 'text':
        this.addLayerToProject(event.data);
        break;
      case 'image':
        this.addLayerToProject(event.data);
        break;
      case 'save':
        this.saveProject();
        break;
      case 'export':
        this.exportProject(event.data?.format || 'png');
        break;
    }
  }

  onLayerEvent(event: LayerEvent): void {
    console.log('🎨 Layer event:', event);

    if (!this.project) return;

    switch (event.type) {
      case 'move':
        this.updateLayerPosition(event.layerId, event.data);
        break;
      case 'select':
        console.log('Layer selected:', event.layerId);
        break;
      case 'delete':
        this.removeLayerFromProject(event.layerId);
        break;
      case 'duplicate':
        this.addLayerToProject(event.data);
        break;
    }
  }

  onLayersChange(layers: Layer[]): void {
    if (this.project) {
      this.project.layers = layers;
      this.project.updatedAt = new Date();
      console.log('🔄 Layers updated:', layers.length);
    }
  }

  private addLayerToProject(layer: Layer): void {
    if (!this.project) return;

    // Find the highest z-index and add one
    const maxZ = Math.max(0, ...this.project.layers.map(l => l.z));
    layer.z = maxZ + 1;

    this.project.layers.push(layer);
    this.project.updatedAt = new Date();

    console.log('➕ Layer added to project:', layer.id);

    this.snackBar.open(
      this.translateService.instant('designLab.messages.layerAdded'),
      this.translateService.instant('common.close'),
      {
        duration: 2000,
        panelClass: ['success-snackbar']
      }
    );
  }

  private removeLayerFromProject(layerId: string): void {
    if (!this.project) return;

    const index = this.project.layers.findIndex(l => l.id === layerId);
    if (index > -1) {
      this.project.layers.splice(index, 1);
      this.project.updatedAt = new Date();

      console.log('🗑️ Layer removed from project:', layerId);

      this.snackBar.open(
        this.translateService.instant('designLab.messages.layerRemoved'),
        this.translateService.instant('common.close'),
        {
          duration: 2000,
          panelClass: ['success-snackbar']
        }
      );
    }
  }

  private updateLayerPosition(layerId: string, position: { x: number; y: number }): void {
    if (!this.project) return;

    const layer = this.project.layers.find(l => l.id === layerId);
    if (layer) {
      layer.x = position.x;
      layer.y = position.y;
      layer.updatedAt = new Date();
      this.project.updatedAt = new Date();

      console.log('� Layer position updated:', layerId, position);

      // In a real implementation, you might want to call a service to persist the change
      // For now, we'll just update the local state
    }
  }

  private exportProject(format: string): void {
    if (!this.project) return;

    console.log('📁 Exporting project as:', format);

    // Simulate export functionality
    this.snackBar.open(
      this.translateService.instant('designLab.messages.exportStarted') + ` (${format.toUpperCase()})`,
      this.translateService.instant('common.close'),
      {
        duration: 3000,
        panelClass: ['info-snackbar']
      }
    );
  }

  getGarmentColorHex(color: string): string {
    // Map garment colors to hex values
    const colorMap: { [key: string]: string } = {
      'WHITE': '#FFFFFF',
      'BLACK': '#000000',
      'GRAY': '#6B7280',
      'LIGHT_GRAY': '#D1D5DB',
      'RED': '#DC2626',
      'PINK': '#EC4899',
      'LIGHT_PURPLE': '#A78BFA',
      'PURPLE': '#7C3AED',
      'LIGHT_BLUE': '#60A5FA',
      'CYAN': '#06B6D4',
      'SKY_BLUE': '#0EA5E9',
      'BLUE': '#2563EB',
      'GREEN': '#059669',
      'LIGHT_GREEN': '#34D399',
      'YELLOW': '#FBBF24',
      'DARK_YELLOW': '#D97706'
    };

    return colorMap[color] || '#FFFFFF';
  }
}
