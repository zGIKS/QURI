import { Component, Input, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageLayer } from '../../model/layer.entity';
import { DesignLabService } from '../../services/design-lab-real.service';
import { Subscription } from 'rxjs';

export interface ImageLayerEvent {
  layerId: string;
  type: 'select' | 'move' | 'resize' | 'update' | 'delete';
  data?: any;
}

@Component({
  selector: 'app-image-layer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="image-layer-wrapper"
      [class.selected]="isSelected"
      [class.dragging]="isDragging"
      [class.resizing]="isResizing"
      [style.transform]="'translate(' + layer.x + 'px, ' + layer.y + 'px)'"
      [style.z-index]="layer.z"
      [style.opacity]="layer.opacity"
      [style.visibility]="layer.isVisible ? 'visible' : 'hidden'"
      [style.width.px]="layer.details?.width || 100"
      [style.height.px]="layer.details?.height || 100"
      (mousedown)="onMouseDown($event)"
      (click)="onSelect($event)">

      <!-- Image Content -->
      <img
        class="image-layer-content"
        [src]="layer.details?.imageUrl || layer.imageUrl"
        [style.width.px]="layer.details?.width || 100"
        [style.height.px]="layer.details?.height || 100"
        [alt]="'Image layer'"
        [style.user-select]="'none'"
        [style.pointer-events]="'none'"
        draggable="false"
        (load)="onImageLoad($event)"
        (error)="onImageError($event)">

      <!-- Corner Resize Handles (only corners) -->
      <div class="resize-handles" *ngIf="isSelected && showHandles && !isDragging">
        <div class="resize-handle nw" (mousedown)="onResizeStart($event, 'nw')"></div>
        <div class="resize-handle ne" (mousedown)="onResizeStart($event, 'ne')"></div>
        <div class="resize-handle sw" (mousedown)="onResizeStart($event, 'sw')"></div>
        <div class="resize-handle se" (mousedown)="onResizeStart($event, 'se')"></div>
      </div>
    </div>
  `,
  styles: [`
    .image-layer-wrapper {
      position: absolute;
      cursor: move;
      user-select: none;
      transition: all 0.1s ease;
    }

    .image-layer-wrapper.selected {
      outline: 2px solid #2196F3;
      outline-offset: 2px;
    }

    .image-layer-wrapper.dragging {
      transform-origin: 0 0;
      z-index: 10000 !important;
      opacity: 0.8;
    }

    .image-layer-wrapper.resizing {
      z-index: 10000 !important;
    }

    .image-layer-content {
      display: block;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .resize-handles {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }

    .resize-handle {
      position: absolute;
      width: 12px;
      height: 12px;
      background: #2196F3;
      border: 2px solid white;
      border-radius: 50%;
      pointer-events: all;
      cursor: pointer;
      z-index: 1001;
      transition: all 0.2s ease;
    }

    .resize-handle:hover {
      background: #1976D2;
      transform: scale(1.2);
    }

    /* Only corner handles */
    .resize-handle.nw {
      top: -6px;
      left: -6px;
      cursor: nw-resize;
    }

    .resize-handle.ne {
      top: -6px;
      right: -6px;
      cursor: ne-resize;
    }

    .resize-handle.sw {
      bottom: -6px;
      left: -6px;
      cursor: sw-resize;
    }

    .resize-handle.se {
      bottom: -6px;
      right: -6px;
      cursor: se-resize;
    }

    .image-layer-wrapper:hover {
      outline: 1px solid #2196F3;
      outline-offset: 1px;
    }

    .image-layer-wrapper.dragging .image-layer-content {
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    }

    .image-layer-wrapper.resizing .image-layer-content {
      box-shadow: 0 4px 16px rgba(33, 150, 243, 0.3);
    }
  `]
})
export class ImageLayerComponent implements OnDestroy {
  @Input() layer!: ImageLayer;
  @Input() projectId!: string;
  @Input() isSelected = false;
  @Input() showHandles = true;
  @Output() layerEvent = new EventEmitter<ImageLayerEvent>();

  isDragging = false;
  isResizing = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private layerStartX = 0;
  private layerStartY = 0;
  private resizeHandle = '';
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeStartWidth = 0;
  private resizeStartHeight = 0;
  private originalAspectRatio = 1;
  private subscriptions: Subscription[] = [];

  constructor(
    private designLabService: DesignLabService,
    private cdr: ChangeDetectorRef
  ) {
    this.setupGlobalListeners();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.removeGlobalListeners();
  }

  private setupGlobalListeners() {
    document.addEventListener('mousemove', this.onMouseMove.bind(this), true);
    document.addEventListener('mouseup', this.onMouseUp.bind(this), true);
  }

  private removeGlobalListeners() {
    document.removeEventListener('mousemove', this.onMouseMove.bind(this), true);
    document.removeEventListener('mouseup', this.onMouseUp.bind(this), true);
  }

  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    console.log('🖼️ Image loaded:', {
      layerId: this.layer.id,
      naturalSize: { width: img.naturalWidth, height: img.naturalHeight }
    });

    // Calculate aspect ratio from natural dimensions
    this.originalAspectRatio = img.naturalWidth / img.naturalHeight;
  }

  onImageError(event: Event) {
    console.error('❌ Image failed to load:', {
      layerId: this.layer.id,
      imageUrl: this.layer.details?.imageUrl || this.layer.imageUrl
    });
  }

  onMouseDown(event: MouseEvent) {
    // Skip if clicking on resize handle
    if ((event.target as HTMLElement).classList.contains('resize-handle')) return;

    event.preventDefault();
    event.stopPropagation();

    // Only handle primary mouse button
    if (event.button !== 0) return;

    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.layerStartX = this.layer.x;
    this.layerStartY = this.layer.y;

    this.cdr.detectChanges();
  }

  onResizeStart(event: MouseEvent, handle: string) {
    event.preventDefault();
    event.stopPropagation();

    this.isResizing = true;
    this.resizeHandle = handle;
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    this.resizeStartWidth = this.layer.details?.width || 100;
    this.resizeStartHeight = this.layer.details?.height || 100;

    console.log('🔄 Starting resize from corner:', handle);
    this.cdr.detectChanges();
  }

  private onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      this.handleDrag(event);
    } else if (this.isResizing) {
      this.handleResize(event);
    }
  }

  private handleDrag(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;

    this.layer.x = this.layerStartX + deltaX;
    this.layer.y = this.layerStartY + deltaY;

    this.layerEvent.emit({
      layerId: this.layer.id,
      type: 'move',
      data: { x: this.layer.x, y: this.layer.y }
    });

    this.cdr.detectChanges();
  }

  private handleResize(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const deltaX = event.clientX - this.resizeStartX;
    const deltaY = event.clientY - this.resizeStartY;

    let newWidth = this.resizeStartWidth;
    let newHeight = this.resizeStartHeight;
    let newX = this.layer.x;
    let newY = this.layer.y;

    // Handle corner resize while maintaining aspect ratio
    switch (this.resizeHandle) {
      case 'nw':
        newWidth = this.resizeStartWidth - deltaX;
        newHeight = this.resizeStartHeight - deltaY;
        newX = this.layerStartX + deltaX;
        newY = this.layerStartY + deltaY;
        break;
      case 'ne':
        newWidth = this.resizeStartWidth + deltaX;
        newHeight = this.resizeStartHeight - deltaY;
        newY = this.layerStartY + deltaY;
        break;
      case 'sw':
        newWidth = this.resizeStartWidth - deltaX;
        newHeight = this.resizeStartHeight + deltaY;
        newX = this.layerStartX + deltaX;
        break;
      case 'se':
        newWidth = this.resizeStartWidth + deltaX;
        newHeight = this.resizeStartHeight + deltaY;
        break;
    }

    // Maintain aspect ratio
    const widthChange = Math.abs(newWidth - this.resizeStartWidth);
    const heightChange = Math.abs(newHeight - this.resizeStartHeight);

    if (widthChange > heightChange) {
      newHeight = newWidth / this.originalAspectRatio;
    } else {
      newWidth = newHeight * this.originalAspectRatio;
    }

    // Apply minimum size constraints
    newWidth = Math.max(20, newWidth);
    newHeight = Math.max(20, newHeight);

    // Recalculate position for nw and sw handles after aspect ratio adjustment
    if (this.resizeHandle === 'nw') {
      newX = this.layerStartX + (this.resizeStartWidth - newWidth);
      newY = this.layerStartY + (this.resizeStartHeight - newHeight);
    } else if (this.resizeHandle === 'ne') {
      newY = this.layerStartY + (this.resizeStartHeight - newHeight);
    } else if (this.resizeHandle === 'sw') {
      newX = this.layerStartX + (this.resizeStartWidth - newWidth);
    }

    // Update layer properties
    this.layer.x = newX;
    this.layer.y = newY;
    if (!this.layer.details) {
      this.layer.details = {};
    }
    this.layer.details.width = Math.round(newWidth);
    this.layer.details.height = Math.round(newHeight);

    this.layerEvent.emit({
      layerId: this.layer.id,
      type: 'resize',
      data: {
        x: this.layer.x,
        y: this.layer.y,
        width: this.layer.details.width,
        height: this.layer.details.height
      }
    });

    this.cdr.detectChanges();
  }

  private onMouseUp(event: MouseEvent) {
    if (this.isDragging) {
      this.finishDrag(event);
    } else if (this.isResizing) {
      this.finishResize(event);
    }
  }

  private finishDrag(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.isDragging = false;

    // Check if position actually changed
    if (this.layer.x !== this.layerStartX || this.layer.y !== this.layerStartY) {
      this.updateLayerPosition();
    }

    this.cdr.detectChanges();
  }

  private finishResize(_event: MouseEvent) {
    _event.preventDefault();
    _event.stopPropagation();

    this.isResizing = false;

    // Update both position and dimensions
    this.updateLayerPosition();
    this.updateImageDetails();

    this.cdr.detectChanges();
  }

  onSelect(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.layerEvent.emit({
      layerId: this.layer.id,
      type: 'select',
      data: { layer: this.layer }
    });
  }

  private updateLayerPosition() {
    console.log('🔄 ImageLayerComponent - Updating layer position:', {
      layerId: this.layer.id,
      x: this.layer.x,
      y: this.layer.y
    });

    const updateRequest = {
      x: this.layer.x,
      y: this.layer.y,
      z: this.layer.z,
      opacity: this.layer.opacity,
      isVisible: this.layer.isVisible
    };

    const subscription = this.designLabService.updateLayerCoordinates(
      this.projectId,
      this.layer.id,
      updateRequest
    ).subscribe({
      next: (result: any) => {
        console.log('✅ ImageLayerComponent - Layer position updated successfully:', result);
        this.layer.updatedAt = new Date();
      },
      error: (error: any) => {
        console.error('❌ ImageLayerComponent - Failed to update layer position:', error);
        // Revert to original position on error
        this.layer.x = this.layerStartX;
        this.layer.y = this.layerStartY;
        this.cdr.detectChanges();
      }
    });

    this.subscriptions.push(subscription);
  }

  private updateImageDetails() {
    console.log('🔄 ImageLayerComponent - Updating image details:', {
      layerId: this.layer.id,
      width: this.layer.details?.width,
      height: this.layer.details?.height
    });

    // For now, we'll assume image details can be updated via the generic layer coordinates
    // If there's a specific endpoint for image details, it would be called here

    // Update the layer's updatedAt timestamp
    this.layer.updatedAt = new Date();
  }
}
