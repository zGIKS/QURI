import { Component, Input, Output, EventEmitter, OnDestroy, ChangeDetectorRef, OnInit } from '@angular/core';
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
      [style.transform]="'translate(' + currentX + 'px, ' + currentY + 'px)'"
      [style.z-index]="layer.z"
      [style.opacity]="layer.opacity"
      [style.visibility]="layer.isVisible ? 'visible' : 'hidden'"
      [style.width.px]="currentWidth"
      [style.height.px]="currentHeight"
      (mousedown)="onMouseDown($event)"
      (click)="onSelect($event)">

      <!-- Image Content -->
      <img
        class="image-layer-content"
        [src]="getImageUrl()"
        [style.width.px]="currentWidth"
        [style.height.px]="currentHeight"
        [alt]="'Image layer'"
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
      touch-action: none;
      will-change: transform;
      box-sizing: border-box;
    }

    .image-layer-wrapper.selected {
      /* No outline by default when selected */
    }

    .image-layer-wrapper.dragging {
      z-index: 10000 !important;
      opacity: 0.8;
      cursor: grabbing !important;
      outline: 2px solid #2196F3;
      outline-offset: 2px;
    }

    .image-layer-wrapper.resizing {
      z-index: 10000 !important;
      outline: 2px solid #2196F3;
      outline-offset: 2px;
    }

    .image-layer-wrapper:hover {
      outline: 1px solid #2196F3;
      outline-offset: 1px;
    }

    .image-layer-wrapper.selected:hover {
      outline: 2px solid #2196F3;
      outline-offset: 2px;
    }

    .image-layer-content {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      pointer-events: none;
      user-select: none;
    }

    .image-layer-wrapper.dragging .image-layer-content {
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    }

    .image-layer-wrapper.resizing .image-layer-content {
      box-shadow: 0 4px 16px rgba(33, 150, 243, 0.3);
    }

    .resize-handles {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .image-layer-wrapper:hover .resize-handles {
      opacity: 1;
    }

    .image-layer-wrapper.resizing .resize-handles {
      opacity: 1;
    }

    .resize-handle {
      position: absolute;
      width: 12px;
      height: 12px;
      background: #2196F3;
      border: 2px solid white;
      border-radius: 50%;
      pointer-events: all;
      z-index: 1001;
      transition: all 0.2s ease;
    }

    .resize-handle:hover {
      background: #1976D2;
      transform: scale(1.2);
    }

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
  `]
})
export class ImageLayerComponent implements OnInit, OnDestroy {
  @Input() layer!: ImageLayer;
  @Input() projectId!: string;
  @Input() isSelected = false;
  @Input() showHandles = true;
  @Output() layerEvent = new EventEmitter<ImageLayerEvent>();

  // Current state properties
  currentX = 0;
  currentY = 0;
  currentWidth = 100;
  currentHeight = 100;
  naturalWidth = 0;
  naturalHeight = 0;
  aspectRatio = 1;

  // Drag state
  isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragInitialX = 0;
  private dragInitialY = 0;

  // Resize state
  isResizing = false;
  private resizeHandle = '';
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeInitialX = 0;
  private resizeInitialY = 0;
  private resizeInitialWidth = 0;
  private resizeInitialHeight = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private designLabService: DesignLabService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initializeImageDimensions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.cleanupEventListeners();
  }

  private initializeImageDimensions() {
    // Initialize position from layer data
    this.currentX = this.layer.x || 0;
    this.currentY = this.layer.y || 0;

    // Initialize dimensions - use backend values if available, otherwise defaults
    this.currentWidth = this.layer.details?.width || 100;
    this.currentHeight = this.layer.details?.height || 100;

    // Calculate aspect ratio if we have dimensions
    if (this.currentWidth && this.currentHeight) {
      this.aspectRatio = this.currentWidth / this.currentHeight;
    }

    console.log('🖼️ ImageLayerComponent initialized:', {
      layerId: this.layer.id,
      position: { x: this.currentX, y: this.currentY },
      dimensions: { width: this.currentWidth, height: this.currentHeight },
      aspectRatio: this.aspectRatio,
      imageUrl: this.getImageUrl()
    });
  }

  getImageUrl(): string {
    return this.layer.details?.imageUrl || this.layer.imageUrl || '';
  }

  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    this.naturalWidth = img.naturalWidth;
    this.naturalHeight = img.naturalHeight;

    // Update aspect ratio with natural dimensions
    if (this.naturalWidth && this.naturalHeight) {
      this.aspectRatio = this.naturalWidth / this.naturalHeight;
    }

    console.log('✅ Image loaded successfully:', {
      layerId: this.layer.id,
      naturalSize: { width: this.naturalWidth, height: this.naturalHeight },
      aspectRatio: this.aspectRatio
    });
  }

  onImageError(_event: Event) {
    console.error('❌ Image failed to load:', {
      layerId: this.layer.id,
      imageUrl: this.getImageUrl()
    });
  }

  onMouseDown(event: MouseEvent) {
    // Skip if clicking on resize handle
    if ((event.target as HTMLElement).classList.contains('resize-handle')) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Only handle left mouse button
    if (event.button !== 0) return;

    console.log('�️ Starting drag:', {
      layerId: this.layer.id,
      mousePos: { x: event.clientX, y: event.clientY },
      currentPos: { x: this.currentX, y: this.currentY }
    });

    this.startDrag(event);
  }

  private startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragInitialX = this.currentX;
    this.dragInitialY = this.currentY;

    this.addEventListeners();
    this.cdr.detectChanges();
  }

  onResizeStart(event: MouseEvent, handle: string) {
    event.preventDefault();
    event.stopPropagation();

    console.log('🔄 Starting resize:', {
      layerId: this.layer.id,
      handle: handle,
      mousePos: { x: event.clientX, y: event.clientY },
      currentSize: { width: this.currentWidth, height: this.currentHeight }
    });

    this.isResizing = true;
    this.resizeHandle = handle;
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    this.resizeInitialX = this.currentX;
    this.resizeInitialY = this.currentY;
    this.resizeInitialWidth = this.currentWidth;
    this.resizeInitialHeight = this.currentHeight;

    this.addEventListeners();
    this.cdr.detectChanges();
  }

  private addEventListeners() {
    document.addEventListener('mousemove', this.onMouseMove, { passive: false });
    document.addEventListener('mouseup', this.onMouseUp, { passive: false });
    document.body.style.userSelect = 'none';
    document.body.style.cursor = this.isDragging ? 'grabbing' : 'default';
  }

  private cleanupEventListeners() {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }

  private onMouseMove = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (this.isDragging) {
      this.handleDrag(event);
    } else if (this.isResizing) {
      this.handleResize(event);
    }
  };

  private handleDrag(event: MouseEvent) {
    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;

    this.currentX = this.dragInitialX + deltaX;
    this.currentY = this.dragInitialY + deltaY;

    this.layerEvent.emit({
      layerId: this.layer.id,
      type: 'move',
      data: { x: this.currentX, y: this.currentY }
    });

    this.cdr.detectChanges();
  }

  private handleResize(event: MouseEvent) {
    const deltaX = event.clientX - this.resizeStartX;
    const deltaY = event.clientY - this.resizeStartY;

    let newWidth = this.resizeInitialWidth;
    let newHeight = this.resizeInitialHeight;
    let newX = this.resizeInitialX;
    let newY = this.resizeInitialY;

    // Calculate new dimensions based on handle
    switch (this.resizeHandle) {
      case 'nw':
        newWidth = this.resizeInitialWidth - deltaX;
        newHeight = this.resizeInitialHeight - deltaY;
        newX = this.resizeInitialX + deltaX;
        newY = this.resizeInitialY + deltaY;
        break;
      case 'ne':
        newWidth = this.resizeInitialWidth + deltaX;
        newHeight = this.resizeInitialHeight - deltaY;
        newY = this.resizeInitialY + deltaY;
        break;
      case 'sw':
        newWidth = this.resizeInitialWidth - deltaX;
        newHeight = this.resizeInitialHeight + deltaY;
        newX = this.resizeInitialX + deltaX;
        break;
      case 'se':
        newWidth = this.resizeInitialWidth + deltaX;
        newHeight = this.resizeInitialHeight + deltaY;
        break;
    }

    // Maintain aspect ratio
    if (this.aspectRatio > 0) {
      const widthBasedHeight = newWidth / this.aspectRatio;
      const heightBasedWidth = newHeight * this.aspectRatio;

      // Choose the dimension that changes less to maintain aspect ratio
      if (Math.abs(newWidth - this.resizeInitialWidth) > Math.abs(newHeight - this.resizeInitialHeight)) {
        newHeight = widthBasedHeight;
      } else {
        newWidth = heightBasedWidth;
      }
    }

    // Apply minimum constraints
    newWidth = Math.max(20, newWidth);
    newHeight = Math.max(20, newHeight);

    // Recalculate position for handles that affect position
    if (this.resizeHandle === 'nw') {
      newX = this.resizeInitialX + (this.resizeInitialWidth - newWidth);
      newY = this.resizeInitialY + (this.resizeInitialHeight - newHeight);
    } else if (this.resizeHandle === 'ne') {
      newY = this.resizeInitialY + (this.resizeInitialHeight - newHeight);
    } else if (this.resizeHandle === 'sw') {
      newX = this.resizeInitialX + (this.resizeInitialWidth - newWidth);
    }

    // Update current values
    this.currentX = newX;
    this.currentY = newY;
    this.currentWidth = newWidth;
    this.currentHeight = newHeight;

    this.layerEvent.emit({
      layerId: this.layer.id,
      type: 'resize',
      data: {
        x: this.currentX,
        y: this.currentY,
        width: this.currentWidth,
        height: this.currentHeight
      }
    });

    this.cdr.detectChanges();
  }

  private onMouseUp = (_event: MouseEvent) => {
    if (this.isDragging) {
      this.finishDrag();
    } else if (this.isResizing) {
      this.finishResize();
    }
  };

  private finishDrag() {
    console.log('✅ Drag finished:', {
      layerId: this.layer.id,
      finalPosition: { x: this.currentX, y: this.currentY }
    });

    this.isDragging = false;
    this.cleanupEventListeners();

    // Update layer data
    this.layer.x = this.currentX;
    this.layer.y = this.currentY;

    // Update backend if position changed
    if (this.layer.x !== this.dragInitialX || this.layer.y !== this.dragInitialY) {
      this.updateLayerPosition();
    }

    this.cdr.detectChanges();
  }

  private finishResize() {
    console.log('✅ Resize finished:', {
      layerId: this.layer.id,
      finalPosition: { x: this.currentX, y: this.currentY },
      finalSize: { width: this.currentWidth, height: this.currentHeight }
    });

    this.isResizing = false;
    this.cleanupEventListeners();

    // Update layer data
    this.layer.x = this.currentX;
    this.layer.y = this.currentY;
    if (!this.layer.details) {
      this.layer.details = {};
    }
    this.layer.details.width = Math.round(this.currentWidth);
    this.layer.details.height = Math.round(this.currentHeight);

    // Update backend
    this.updateLayerPosition();

    this.cdr.detectChanges();
  }

  onSelect(_event: MouseEvent) {
    _event.preventDefault();
    _event.stopPropagation();

    this.layerEvent.emit({
      layerId: this.layer.id,
      type: 'select',
      data: { layer: this.layer }
    });
  }

  private updateLayerPosition() {
    console.log('🔄 Updating layer in backend:', {
      layerId: this.layer.id,
      position: { x: this.layer.x, y: this.layer.y },
      dimensions: { width: this.layer.details?.width, height: this.layer.details?.height }
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
        console.log('✅ Layer updated successfully:', result);
        this.layer.updatedAt = new Date();

        this.layerEvent.emit({
          layerId: this.layer.id,
          type: 'update',
          data: {
            x: this.layer.x,
            y: this.layer.y,
            width: this.layer.details?.width,
            height: this.layer.details?.height
          }
        });
      },
      error: (error: any) => {
        console.error('❌ Failed to update layer:', error);

        // Revert to initial state on error
        this.currentX = this.layer.x = this.isDragging ? this.dragInitialX : this.resizeInitialX;
        this.currentY = this.layer.y = this.isDragging ? this.dragInitialY : this.resizeInitialY;

        if (this.isResizing) {
          this.currentWidth = this.resizeInitialWidth;
          this.currentHeight = this.resizeInitialHeight;
          if (this.layer.details) {
            this.layer.details.width = this.resizeInitialWidth;
            this.layer.details.height = this.resizeInitialHeight;
          }
        }

        this.cdr.detectChanges();
      }
    });

    this.subscriptions.push(subscription);
  }
}
