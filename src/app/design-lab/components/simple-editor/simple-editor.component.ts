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
import { DesignLabService } from '../../services/design-lab-real.service';
import { LayerResult } from '../../services/design-lab-real.service';
import { Project } from '../../model/project.entity';
import { TextLayer } from '../../model/layer.entity';
import { GARMENT_COLOR } from '../../../const';
import { ImageUploadComponent, ImageUploadResult, DirectImageUploadResult } from '../image-upload/image-upload.component';

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
    TranslateModule,
    ImageUploadComponent
  ],
  templateUrl: './simple-editor.component.html',
  styleUrls: [ './simple-editor.component.css',  './simple-editor.component.extend.css']
})
export class SimpleEditorComponent implements OnInit {
  project: Project | null = null;
  isLoading = false;
  isSaving = false;
  error: string | null = null;
  projectId: string | null = null;

  // Text editing state
  selectedTextLayer: TextLayer | null = null;
  selectedLayerId: string | null = null;
  isEditingText = false;
  textContent = '';
  fontSize = 24;
  fontColor = '#000000';
  fontFamily = 'Arial';
  isBold = false;
  isItalic = false;
  isUnderlined = false;

  // Drag and drop state
  isDragging = false;
  dragOffset = { x: 0, y: 0 };
  dragLayer: TextLayer | null = null;

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
  private designLabService = inject(DesignLabService);
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
        console.log('📋 Project layers:', project.layers);

        // Debug específico para image layers
        const imageLayers = project.layers.filter(layer => layer.type === 'IMAGE');
        if (imageLayers.length > 0) {
          console.log('🖼️ Image layers found:', imageLayers);
          imageLayers.forEach((layer, index) => {
            console.log(`🖼️ Image layer ${index}:`, {
              id: layer.id,
              type: layer.type,
              details: layer.details,
              x: layer.x,
              y: layer.y,
              z: layer.z,
              opacity: layer.opacity,
              isVisible: layer.isVisible
            });
          });
        }
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
      // Update existing layer using text-details endpoint
      const updateRequest = {
        text: this.textContent,
        fontColor: this.fontColor,
        fontFamily: this.fontFamily,
        fontSize: this.fontSize,
        isBold: this.isBold,
        isItalic: this.isItalic,
        isUnderlined: this.isUnderlined
      };

      this.designLabService.updateTextLayerDetails(this.projectId, this.selectedTextLayer.id, updateRequest).subscribe({
        next: (result: LayerResult) => {
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
        error: (error: any) => {
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
      // Create new layer using layers/texts endpoint
      const createRequest = {
        text: this.textContent,
        fontColor: this.fontColor,
        fontFamily: this.fontFamily,
        fontSize: this.fontSize,
        isBold: this.isBold,
        isItalic: this.isItalic,
        isUnderlined: this.isUnderlined
      };

      this.designLabService.createTextLayer(this.projectId, createRequest).subscribe({
        next: (result: LayerResult) => {
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

            // Select the newly created layer
            this.selectedLayerId = newLayer.id;
            this.selectedTextLayer = newLayer;

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
        error: (error: any) => {
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
      next: (result: LayerResult) => {
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
      error: (error: any) => {
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
    this.selectedLayerId = null;
  }

  // Layer selection and drag methods
  selectLayer(layer: TextLayer): void {
    this.selectedLayerId = layer.id;
    this.selectedTextLayer = layer;
  }

  startDrag(event: MouseEvent, layer: TextLayer): void {
    event.preventDefault();
    event.stopPropagation();

    this.isDragging = true;
    this.dragLayer = layer;
    this.selectedLayerId = layer.id;
    this.selectedTextLayer = layer;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.dragOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    // Add global mouse event listeners
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);

    // Change cursor
    document.body.style.cursor = 'grabbing';
  }

  onMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging || !this.dragLayer) return;

    const container = document.querySelector('.tshirt-preview') as HTMLElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    // Calculate new position relative to container
    const newX = event.clientX - containerRect.left - this.dragOffset.x;
    const newY = event.clientY - containerRect.top - this.dragOffset.y;

    // Ensure layer stays within bounds
    const maxX = container.offsetWidth - 100; // Approximate text width
    const maxY = container.offsetHeight - 30; // Approximate text height

    this.dragLayer.x = Math.max(0, Math.min(newX, maxX));
    this.dragLayer.y = Math.max(0, Math.min(newY, maxY));
  }

  onMouseUp = (_event: MouseEvent): void => {
    if (!this.isDragging || !this.dragLayer) return;

    this.isDragging = false;
    document.body.style.cursor = 'default';

    // Remove global event listeners
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);

    // Update layer coordinates on server
    if (this.projectId && this.dragLayer) {
      this.updateLayerCoordinates(this.dragLayer);
    }

    this.dragLayer = null;
  }

  updateLayerCoordinates(layer: TextLayer): void {
    if (!this.projectId) return;

    const updateRequest = {
      x: layer.x,
      y: layer.y,
      z: layer.z
    };

    console.log('🚀 Update layer coordinates request:', updateRequest);

    this.designLabService.updateLayerCoordinates(this.projectId, layer.id, updateRequest).subscribe({
      next: (result: LayerResult) => {
        if (result.success) {
          console.log('✅ Layer coordinates updated');
        } else {
          console.error('❌ Failed to update layer coordinates:', result.error);
        }
      },
      error: (error: any) => {
        console.error('❌ Error updating layer coordinates:', error);
      }
    });
  }

  private generateLayerId(): string {
    return 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Test method to verify authentication
  testAuthentication(): void {
    console.log('🧪 Testing authentication...');
    this.designLabService.testAuthentication().subscribe({
      next: (result: any) => {
        console.log('✅ Authentication test successful:', result);
        this.snackBar.open(
          'Authentication test successful',
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      },
      error: (error: any) => {
        console.error('❌ Authentication test failed:', error);
        this.snackBar.open(
          'Authentication test failed: ' + error,
          'Close',
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  // Enhanced logging for debugging
  logRequestDetails(): void {
    console.log('🔍 DEBUG - Current state:');
    console.log('  - Project ID:', this.projectId);
    console.log('  - Project exists:', !!this.project);
    console.log('  - Token exists:', !!localStorage.getItem('token'));
    console.log('  - Token preview:', localStorage.getItem('token')?.substring(0, 20) + '...');
    console.log('  - User authenticated:', this.designLabService.constructor.name);
    console.log('  - Base URL:', 'http://localhost:8080/api/v1/projects');
  }

  // Image upload handling
  onImageUploaded(result: ImageUploadResult): void {
    if (!this.project || !this.projectId) return;

    console.log('🖼️ Image uploaded with calculated dimensions:', result);
    console.log('📐 Cloudinary dimensions:', { width: result.width, height: result.height });
    console.log('📐 Calculated dimensions:', { width: result.calculatedWidth, height: result.calculatedHeight });

    this.isSaving = true;

    // Usar las dimensiones calculadas que son más precisas
    const imageLayerRequest = {
      imageUrl: result.imageUrl,
      width: result.calculatedWidth.toString(),
      height: result.calculatedHeight.toString()
    };

    this.designLabService.createImageLayer(this.projectId, imageLayerRequest).subscribe({
      next: (layerResult: LayerResult) => {
        if (layerResult.success) {
          // Reload the project to get the updated layers
          this.loadProject();

          this.snackBar.open(
            this.translateService.instant('designLab.messages.imageLayerCreated'),
            this.translateService.instant('common.close'),
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        } else {
          this.snackBar.open(
            layerResult.error || 'Error creating image layer',
            this.translateService.instant('common.close'),
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
        this.isSaving = false;
      },
      error: (error: any) => {
        console.error('❌ Error creating image layer:', error);
        this.snackBar.open(
          this.translateService.instant('designLab.errors.imageLayerCreationFailed'),
          this.translateService.instant('common.close'),
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
        this.isSaving = false;
      }
    });
  }

  // Direct image upload handling
  onDirectImageUpload(result: DirectImageUploadResult): void {
    console.log('🖼️ Direct image upload completed:', result);

    if (result.success) {
      // Reload the project to get the updated layers
      this.loadProject();

      this.snackBar.open(
        this.translateService.instant('designLab.messages.imageLayerCreated'),
        this.translateService.instant('common.close'),
        { duration: 3000, panelClass: ['success-snackbar'] }
      );
    } else {
      this.snackBar.open(
        result.error || 'Error creating image layer',
        this.translateService.instant('common.close'),
        { duration: 3000, panelClass: ['error-snackbar'] }
      );
    }
  }

  // File selection handling
  onFileSelected(file: File): void {
    console.log('📁 File selected:', file.name, file.size, 'bytes');
    // Here you could add additional validation or processing if needed
  }

  // Alternative method using integrated upload and layer creation
  onImageUploadedIntegrated(file: File): void {
    if (!this.project || !this.projectId) return;

    console.log('🖼️ Using integrated image upload and layer creation for:', file.name);

    this.isSaving = true;

    this.designLabService.uploadImageAndCreateLayer(file, this.projectId).subscribe({
      next: (layerResult: LayerResult) => {
        if (layerResult.success) {
          // Reload the project to get the updated layers
          this.loadProject();

          this.snackBar.open(
            this.translateService.instant('designLab.messages.imageLayerCreated'),
            this.translateService.instant('common.close'),
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
        } else {
          this.snackBar.open(
            layerResult.error || 'Error creating image layer',
            this.translateService.instant('common.close'),
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
        this.isSaving = false;
      },
      error: (error: any) => {
        console.error('❌ Error with integrated image upload and layer creation:', error);
        this.snackBar.open(
          this.translateService.instant('designLab.errors.imageLayerCreationFailed'),
          this.translateService.instant('common.close'),
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
        this.isSaving = false;
      }
    });
  }

  // Image error handling
  onImageError(event: Event, layer: any): void {
    console.error('❌ Image failed to load for layer:', layer);
    console.error('❌ Image src was:', layer.details?.imageUrl);
    console.error('❌ Image error event:', event);

    // Opcional: Mostrar un placeholder o notificación
    this.snackBar.open(
      'Image failed to load. Please try uploading again.',
      'Close',
      { duration: 5000, panelClass: ['error-snackbar'] }
    );
  }
}
