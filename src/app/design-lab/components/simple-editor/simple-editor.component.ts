import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DesignLabApplicationService } from '../../services/design-lab-application.service';
import {
  CreateTextLayerCommand,
  UpdateTextLayerCommand,
  LayerCommandResult
} from '../../services/design-lab.commands';
import { Project } from '../../model/project.entity';
import { TextLayer } from '../../model/layer.entity';
import { GARMENT_COLOR } from '../../../const';

@Component({
  selector: 'app-simple-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSliderModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './simple-editor.component.html',
  styleUrl: './simple-editor.component.css'
})
export class SimpleEditorComponent implements OnInit {
  project: Project | null = null;
  isLoading = false;
  isSaving = false;
  error: string | null = null;
  projectId: string | null = null;

  // Text editing state
  selectedTextLayer: TextLayer | null = null;
  isEditingText = false;
  textContent = '';
  fontSize = 24;
  fontColor = '#000000';
  fontFamily = 'Arial';
  isBold = false;
  isItalic = false;
  isUnderlined = false;

  // Available font families
  fontFamilies = [
    { value: 'Arial', display: 'Arial' },
    { value: 'Times New Roman', display: 'Times New Roman' },
    { value: 'Helvetica', display: 'Helvetica' },
    { value: 'Georgia', display: 'Georgia' },
    { value: 'Verdana', display: 'Verdana' },
    { value: 'Courier New', display: 'Courier New' }
  ];

  // Color mapping for t-shirt preview with Cloudinary positioning
  private colorMap: { [key in GARMENT_COLOR]: { hex: string; position: { x: number; y: number } } } = {
    [GARMENT_COLOR.BLACK]: { hex: '#000000', position: { x: 0, y: 0 } },
    [GARMENT_COLOR.GRAY]: { hex: '#808080', position: { x: 600, y: 0 } },
    [GARMENT_COLOR.LIGHT_GRAY]: { hex: '#D3D3D3', position: { x: 1200, y: 0 } },
    [GARMENT_COLOR.WHITE]: { hex: '#FFFFFF', position: { x: 1800, y: 0 } },
    [GARMENT_COLOR.RED]: { hex: '#DC143C', position: { x: 0, y: 600 } },
    [GARMENT_COLOR.PINK]: { hex: '#FF69B4', position: { x: 600, y: 600 } },
    [GARMENT_COLOR.LIGHT_PURPLE]: { hex: '#DDA0DD', position: { x: 1200, y: 600 } },
    [GARMENT_COLOR.PURPLE]: { hex: '#800080', position: { x: 1800, y: 600 } },
    [GARMENT_COLOR.CYAN]: { hex: '#00FFFF', position: { x: 0, y: 1200 } },
    [GARMENT_COLOR.SKY_BLUE]: { hex: '#87CEEB', position: { x: 600, y: 1200 } },
    [GARMENT_COLOR.LIGHT_BLUE]: { hex: '#87CEEB', position: { x: 1200, y: 1200 } },
    [GARMENT_COLOR.BLUE]: { hex: '#0000FF', position: { x: 1800, y: 1200 } },
    [GARMENT_COLOR.GREEN]: { hex: '#008000', position: { x: 0, y: 1800 } },
    [GARMENT_COLOR.LIGHT_GREEN]: { hex: '#90EE90', position: { x: 600, y: 1800 } },
    [GARMENT_COLOR.YELLOW]: { hex: '#FFFF00', position: { x: 1200, y: 1800 } },
    [GARMENT_COLOR.DARK_YELLOW]: { hex: '#FFD700', position: { x: 1800, y: 1800 } }
  };

  // Base Cloudinary URL
  private baseImageUrl = 'https://res.cloudinary.com/dkkfv72vo/image/upload/v1747000549/Frame_530_hfhrko.webp';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private designLabService = inject(DesignLabApplicationService);
  private translateService = inject(TranslateService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    if (this.projectId) {
      this.loadProject();
    }
  }

  loadProject(): void {
    if (!this.projectId) return;

    this.isLoading = true;
    this.error = null;

    this.designLabService.getProjectById(this.projectId).subscribe({
      next: (project: Project) => {
        this.project = project;
        this.isLoading = false;
        console.log('✅ Project loaded:', project);
      },
      error: (error: any) => {
        console.error('❌ Error loading project:', error);
        this.error = this.translateService.instant('designLab.errorLoadingProject');
        this.isLoading = false;
      }
    });
  }

  saveProject(): void {
    if (!this.project || this.isSaving) return;

    this.isSaving = true;
    // Por ahora solo mostramos mensaje de guardado, implementaremos la lógica después
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

  getTshirtColor(): string {
    if (!this.project) return '#FFFFFF';
    return this.colorMap[this.project.garmentColor]?.hex || '#FFFFFF';
  }

  getTshirtImageUrl(): string {
    if (!this.project) return '';
    const colorData = this.colorMap[this.project.garmentColor];
    if (!colorData) return '';

    // Cloudinary crop transformation: crop 600x600 from the specified position
    const { x, y } = colorData.position;
    return `https://res.cloudinary.com/dkkfv72vo/image/upload/c_crop,w_600,h_600,x_${x},y_${y}/v1747000549/Frame_530_hfhrko.webp`;
  }

  getColorOptions(): { color: GARMENT_COLOR; hex: string; name: string }[] {
    return Object.values(GARMENT_COLOR).map(color => ({
      color,
      hex: this.colorMap[color]?.hex || '#FFFFFF',
      name: color.toLowerCase().replace(/_/g, ' ')
    }));
  }

  selectColor(color: GARMENT_COLOR): void {
    if (this.project) {
      this.project.garmentColor = color;
      this.project.updatedAt = new Date();
    }
  }

  // Text layer management
  addTextLayer(): void {
    if (!this.project) return;

    // Reset editing state
    this.textContent = 'New Text';
    this.fontSize = 24;
    this.fontColor = '#000000';
    this.fontFamily = 'Arial';
    this.isBold = false;
    this.isItalic = false;
    this.isUnderlined = false;
    this.selectedTextLayer = null;
    this.isEditingText = true;
  }

  saveTextLayer(): void {
    if (!this.project || !this.projectId) return;

    this.isSaving = true;

    if (this.selectedTextLayer) {
      // Update existing layer
      const updateCommand: UpdateTextLayerCommand = {
        projectId: this.projectId,
        layerId: this.selectedTextLayer.id,
        text: this.textContent,
        fontColor: this.fontColor,
        fontFamily: this.fontFamily,
        fontSize: this.fontSize,
        isBold: this.isBold,
        isItalic: this.isItalic,
        isUnderlined: this.isUnderlined
      };

      this.designLabService.updateTextLayer(updateCommand).subscribe({
        next: (result: LayerCommandResult) => {
          if (result.success) {
            // Update local layer
            this.selectedTextLayer!.details = {
              text: this.textContent,
              fontSize: this.fontSize,
              fontColor: this.fontColor,
              fontFamily: this.fontFamily,
              isBold: this.isBold,
              isItalic: this.isItalic,
              isUnderlined: this.isUnderlined
            };
            this.selectedTextLayer!.updatedAt = new Date();
            this.project!.updatedAt = new Date();

            this.snackBar.open(
              this.translateService.instant('designLab.messages.layerUpdated'),
              this.translateService.instant('common.close'),
              { duration: 3000, panelClass: ['success-snackbar'] }
            );
            this.cancelTextEditing();
          } else {
            this.snackBar.open(
              result.error || 'Error updating text layer',
              this.translateService.instant('common.close'),
              { duration: 3000, panelClass: ['error-snackbar'] }
            );
          }
          this.isSaving = false;
        },
        error: (error) => {
          console.error('❌ Error updating text layer:', error);
          this.snackBar.open(
            this.translateService.instant('designLab.errors.layerUpdateFailed'),
            this.translateService.instant('common.close'),
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
          this.isSaving = false;
        }
      });
    } else {
      // Create new layer
      const createCommand: CreateTextLayerCommand = {
        projectId: this.projectId,
        x: 100,
        y: 100,
        z: this.project.layers.length + 1,
        text: this.textContent,
        fontColor: this.fontColor,
        fontFamily: this.fontFamily,
        fontSize: this.fontSize,
        isBold: this.isBold,
        isItalic: this.isItalic,
        isUnderlined: this.isUnderlined
      };

      this.designLabService.createTextLayer(createCommand).subscribe({
        next: (result: LayerCommandResult) => {
          if (result.success && result.layerId) {
            // Create local layer representation
            const newLayer = new TextLayer(
              result.layerId,
              100,
              100,
              this.project!.layers.length + 1,
              1,
              true,
              new Date(),
              new Date(),
              {
                text: this.textContent,
                fontSize: this.fontSize,
                fontColor: this.fontColor,
                fontFamily: this.fontFamily,
                isBold: this.isBold,
                isItalic: this.isItalic,
                isUnderlined: this.isUnderlined
              }
            );

            this.project!.layers.push(newLayer);
            this.project!.updatedAt = new Date();

            this.snackBar.open(
              this.translateService.instant('designLab.messages.layerAdded'),
              this.translateService.instant('common.close'),
              { duration: 3000, panelClass: ['success-snackbar'] }
            );
            this.cancelTextEditing();
          } else {
            this.snackBar.open(
              result.error || 'Error creating text layer',
              this.translateService.instant('common.close'),
              { duration: 3000, panelClass: ['error-snackbar'] }
            );
          }
          this.isSaving = false;
        },
        error: (error) => {
          console.error('❌ Error creating text layer:', error);
          this.snackBar.open(
            this.translateService.instant('designLab.errors.layerCreationFailed'),
            this.translateService.instant('common.close'),
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
          this.isSaving = false;
        }
      });
    }
  }

  editTextLayer(layer: TextLayer): void {
    if (layer.type !== 'TEXT') return;

    this.selectedTextLayer = layer;
    this.textContent = layer.details?.text || 'Text';
    this.fontSize = layer.details?.fontSize || 24;
    this.fontColor = layer.details?.fontColor || '#000000';
    this.fontFamily = layer.details?.fontFamily || 'Arial';
    this.isBold = layer.details?.isBold || false;
    this.isItalic = layer.details?.isItalic || false;
    this.isUnderlined = layer.details?.isUnderlined || false;
    this.isEditingText = true;
  }  deleteTextLayer(layer: TextLayer): void {
    if (!this.project || !this.projectId) return;

    this.isSaving = true;

    this.designLabService.deleteLayer(this.projectId, layer.id).subscribe({
      next: (result: LayerCommandResult) => {
        if (result.success) {
          // Remove from local project
          const index = this.project!.layers.indexOf(layer);
          if (index > -1) {
            this.project!.layers.splice(index, 1);
            this.project!.updatedAt = new Date();
          }

          this.snackBar.open(
            this.translateService.instant('designLab.messages.layerRemoved'),
            this.translateService.instant('common.close'),
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        } else {
          this.snackBar.open(
            result.error || 'Error deleting text layer',
            this.translateService.instant('common.close'),
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
        this.isSaving = false;
      },
      error: (error) => {
        console.error('❌ Error deleting text layer:', error);
        this.snackBar.open(
          this.translateService.instant('designLab.errors.layerDeleteFailed'),
          this.translateService.instant('common.close'),
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
        this.isSaving = false;
      }
    });
  }

  cancelTextEditing(): void {
    this.isEditingText = false;
    this.selectedTextLayer = null;
  }

  private generateLayerId(): string {
    return 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
