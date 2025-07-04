import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DesignLabApplicationService } from '../../services/design-lab-application.service';
import { DeleteProjectCommand } from '../../services/design-lab.commands';
import { Project } from '../../model/project.entity';
import { Layer, TextLayer, ImageLayer } from '../../model/layer.entity';
import { LayerType, DEFAULT_LAYER_STYLES } from '../../../const';
import { DesignCanvasComponent, LayerEvent } from '../design-canvas/design-canvas.component';
import { LayerToolbarComponent, LayerToolEvent } from '../layer-toolbar/layer-toolbar.component';
import { LayerManagementPanelComponent, LayerManagementEvent } from '../layer-management-panel/layer-management-panel.component';
import { LayerPropertiesPanelComponent, LayerPropertyEvent } from '../layer-properties-panel/layer-properties-panel.component';
import { CanvasToolsComponent, CanvasToolEvent, CanvasTool } from '../canvas-tools/canvas-tools.component';
import { GarmentBackgroundComponent } from '../garment-background/garment-background.component';
import { DeleteProjectDialogComponent, DeleteProjectDialogData } from '../delete-project-dialog/delete-project-dialog.component';

@Component({
  selector: 'app-project-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    TranslateModule,
    DesignCanvasComponent,
    LayerToolbarComponent,
    LayerManagementPanelComponent,
    LayerPropertiesPanelComponent,
    CanvasToolsComponent,
    GarmentBackgroundComponent
  ],
  templateUrl: './project-edit.component.html',
  styleUrl: './project-edit.component.css'
})
export class ProjectEditComponent implements OnInit {
  project: Project | null = null;
  isLoading = false;
  isSaving = false;
  isModified = false;
  error: string | null = null;
  projectId: string | null = null;

  // Canvas properties
  canvasWidth = 800;
  canvasHeight = 600;
  currentTool: CanvasTool = 'select';

  // Layer selection
  selectedLayerId: string | null = null;
  selectedLayer: Layer | null = null;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private designLabService = inject(DesignLabApplicationService);
  private translateService = inject(TranslateService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    console.log('🎨 ProjectEditComponent initialized');
    this.projectId = this.route.snapshot.paramMap.get('id');
    console.log('🆔 Project ID from route:', this.projectId);

    if (this.projectId) {
      this.loadProject();
    } else {
      console.error('❌ No project ID found in route');
      this.error = this.translateService.instant('designLab.errors.projectNotFound');
    }
  }

  loadProject(): void {
    if (!this.projectId) return;

    this.isLoading = true;
    this.error = null;

    console.log('🎨 Loading project with ID:', this.projectId);

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

  /**
   * Abrir diálogo de confirmación para eliminar proyecto
   */
  openDeleteDialog(): void {
    if (!this.project) return;

    const dialogData: DeleteProjectDialogData = {
      projectTitle: this.project.title,
      projectId: this.project.id
    };

    const dialogRef = this.dialog.open(DeleteProjectDialogComponent, {
      width: '450px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteProject();
      }
    });
  }

  /**
   * Eliminar el proyecto
   */
  private deleteProject(): void {
    if (!this.project) return;

    const command: DeleteProjectCommand = {
      projectId: this.project.id
    };

    console.log('🗑️ Deleting project:', command);

    this.designLabService.deleteProject(command).subscribe({
      next: (result) => {
        console.log('✅ Project deleted successfully:', result);

        this.snackBar.open(
          this.translateService.instant('designLab.messages.projectDeleted'),
          this.translateService.instant('common.close'),
          {
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );

        // Navegar de vuelta a la lista de proyectos
        this.router.navigate(['/home/design-lab']);
      },
      error: (error) => {
        console.error('❌ Error deleting project:', error);

        this.snackBar.open(
          error.message || this.translateService.instant('designLab.errors.deleteFailed'),
          this.translateService.instant('common.close'),
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
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

  /**
   * Handle canvas tool events
   */
  onCanvasToolEvent(event: CanvasToolEvent): void {
    console.log('🔧 Canvas tool event:', event);

    switch (event.type) {
      case 'tool-change':
        this.currentTool = event.data.tool;
        break;
      case 'save':
        this.saveProject();
        break;
    }
  }

  /**
   * Handle layer management events
   */
  onLayerManagementEvent(event: LayerManagementEvent): void {
    console.log('🗂️ Layer management event:', event);

    if (!this.project) return;

    switch (event.type) {
      case 'select':
        this.selectLayer(event.layerId!);
        break;
      case 'toggle-visibility':
        this.toggleLayerVisibility(event.layerId!, event.data.isVisible);
        break;
      case 'delete':
        this.removeLayerFromProject(event.layerId!);
        break;
      case 'duplicate':
        this.duplicateLayer(event.layerId!);
        break;
      case 'reorder':
        this.reorderLayers(event.data.layers);
        break;
      case 'bring-to-front':
        this.bringLayerToFront(event.layerId!);
        break;
      case 'send-to-back':
        this.sendLayerToBack(event.layerId!);
        break;
    }
  }

  /**
   * Handle layer property events
   */
  onLayerPropertyEvent(event: LayerPropertyEvent): void {
    console.log('🎨 Layer property event:', event);

    if (!this.project || !this.selectedLayer) return;

    switch (event.type) {
      case 'update-text':
        this.updateTextLayerProperties(event.layerId, event.data);
        break;
      case 'update-image':
        this.updateImageLayerProperties(event.layerId, event.data);
        break;
      case 'update-position':
        this.updateLayerPosition(event.layerId, event.data);
        break;
      case 'update-opacity':
        this.updateLayerOpacity(event.layerId, event.data.opacity);
        break;
      case 'update-visibility':
        this.toggleLayerVisibility(event.layerId, event.data.isVisible);
        break;
    }
  }

  /**
   * Select a layer
   */
  private selectLayer(layerId: string): void {
    this.selectedLayerId = layerId;
    this.selectedLayer = this.project?.layers.find(l => l.id === layerId) || null;
    console.log('📍 Layer selected:', this.selectedLayer);
  }

  /**
   * Toggle layer visibility
   */
  private toggleLayerVisibility(layerId: string, isVisible: boolean): void {
    if (!this.project) return;

    const layer = this.project.layers.find(l => l.id === layerId);
    if (layer) {
      layer.isVisible = isVisible;
      layer.updatedAt = new Date();
      this.project.updatedAt = new Date();
      this.isModified = true;
      console.log('👁️ Layer visibility toggled:', layerId, isVisible);
    }
  }

  /**
   * Duplicate a layer
   */
  private duplicateLayer(layerId: string): void {
    if (!this.project) return;

    const originalLayer = this.project.layers.find(l => l.id === layerId);
    if (!originalLayer) return;

    // Create a new layer based on the original
    const newLayerId = this.generateLayerId();
    const maxZ = Math.max(0, ...this.project.layers.map(l => l.z));

    if (originalLayer.type === LayerType.TEXT) {
      const textLayer = originalLayer as TextLayer;
      const newLayer = new TextLayer(
        newLayerId,
        textLayer.x + 20, // Offset position
        textLayer.y + 20,
        maxZ + 1,
        textLayer.opacity,
        textLayer.isVisible,
        new Date(),
        new Date(),
        { ...textLayer.details } // Copy details
      );
      this.addLayerToProject(newLayer);
    } else if (originalLayer.type === LayerType.IMAGE) {
      const imageLayer = originalLayer as ImageLayer;
      const newLayer = new ImageLayer(
        newLayerId,
        imageLayer.x + 20,
        imageLayer.y + 20,
        maxZ + 1,
        imageLayer.opacity,
        imageLayer.isVisible,
        imageLayer.imageUrl
      );
      this.addLayerToProject(newLayer);
    }
  }

  /**
   * Reorder layers
   */
  private reorderLayers(layers: Layer[]): void {
    if (!this.project) return;

    this.project.layers = layers;
    this.project.updatedAt = new Date();
    this.isModified = true;
    console.log('🔄 Layers reordered');
  }

  /**
   * Bring layer to front
   */
  private bringLayerToFront(layerId: string): void {
    if (!this.project) return;

    const layer = this.project.layers.find(l => l.id === layerId);
    if (layer) {
      const maxZ = Math.max(0, ...this.project.layers.map(l => l.z));
      layer.z = maxZ + 1;
      layer.updatedAt = new Date();
      this.project.updatedAt = new Date();
      this.isModified = true;
      console.log('⬆️ Layer brought to front:', layerId);
    }
  }

  /**
   * Send layer to back
   */
  private sendLayerToBack(layerId: string): void {
    if (!this.project) return;

    const layer = this.project.layers.find(l => l.id === layerId);
    if (layer) {
      const minZ = Math.min(1, ...this.project.layers.map(l => l.z));
      layer.z = minZ - 1;
      layer.updatedAt = new Date();
      this.project.updatedAt = new Date();
      this.isModified = true;
      console.log('⬇️ Layer sent to back:', layerId);
    }
  }

  /**
   * Update text layer properties
   */
  private updateTextLayerProperties(layerId: string, data: any): void {
    if (!this.project) return;

    const layer = this.project.layers.find(l => l.id === layerId) as TextLayer;
    if (layer && layer.type === LayerType.TEXT) {
      // Update layer properties
      layer.x = data.x;
      layer.y = data.y;
      layer.opacity = data.opacity;
      layer.isVisible = data.isVisible;
      layer.details = {
        text: data.text,
        fontFamily: data.fontFamily,
        fontSize: data.fontSize,
        fontColor: data.fontColor,
        isBold: data.isBold,
        isItalic: data.isItalic,
        isUnderlined: data.isUnderlined
      };
      layer.updatedAt = new Date();
      this.project.updatedAt = new Date();
      this.isModified = true;
      console.log('📝 Text layer updated:', layerId);
    }
  }

  /**
   * Update image layer properties
   */
  private updateImageLayerProperties(layerId: string, data: any): void {
    if (!this.project) return;

    const layer = this.project.layers.find(l => l.id === layerId) as ImageLayer;
    if (layer && layer.type === LayerType.IMAGE) {
      // Update layer properties
      layer.x = data.x;
      layer.y = data.y;
      layer.opacity = data.opacity;
      layer.isVisible = data.isVisible;
      layer.imageUrl = data.imageUrl;
      layer.details = {
        width: data.width,
        height: data.height
      };
      layer.updatedAt = new Date();
      this.project.updatedAt = new Date();
      this.isModified = true;
      console.log('🖼️ Image layer updated:', layerId);
    }
  }

  /**
   * Update layer opacity
   */
  private updateLayerOpacity(layerId: string, opacity: number): void {
    if (!this.project) return;

    const layer = this.project.layers.find(l => l.id === layerId);
    if (layer) {
      layer.opacity = opacity;
      layer.updatedAt = new Date();
      this.project.updatedAt = new Date();
      this.isModified = true;
      console.log('💧 Layer opacity updated:', layerId, opacity);
    }
  }

  /**
   * Perform undo operation
   */
  /**
   * Generate a unique layer ID
   */
  private generateLayerId(): string {
    return 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
