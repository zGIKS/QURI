import { Component, Input, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextLayer } from '../../model/layer.entity';
import { DesignLabService } from '../../services/design-lab-real.service';
import { Subscription } from 'rxjs';

export interface TextLayerEvent {
  layerId: string;
  type: 'select' | 'move' | 'update' | 'delete';
  data?: any;
}

@Component({
  selector: 'app-text-layer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="text-layer-wrapper"
      [class.selected]="isSelected"
      [class.dragging]="isDragging"
      [style.transform]="'translate(' + layer.x + 'px, ' + layer.y + 'px)'"
      [style.z-index]="layer.z"
      [style.opacity]="layer.opacity"
      [style.visibility]="layer.isVisible ? 'visible' : 'hidden'"
      (mousedown)="onMouseDown($event)">

      <!-- Text Content -->
      <div
        class="text-layer-content"
        [style.font-size.px]="layer.details?.fontSize || 24"
        [style.color]="layer.details?.fontColor || '#000000'"
        [style.font-family]="layer.details?.fontFamily || 'Arial'"
        [style.font-weight]="layer.details?.isBold ? 'bold' : 'normal'"
        [style.font-style]="layer.details?.isItalic ? 'italic' : 'normal'"
        [style.text-decoration]="layer.details?.isUnderlined ? 'underline' : 'none'"
        [style.user-select]="'none'"
        [style.cursor]="'move'"
        (dblclick)="onEdit($event)"
        (click)="onSelect($event)">
        {{ layer.details?.text || 'Text' }}
      </div>

      <!-- Selection Handles -->
      <div class="selection-handles" *ngIf="isSelected && showHandles">
        <div class="handle handle-nw"></div>
        <div class="handle handle-ne"></div>
        <div class="handle handle-sw"></div>
        <div class="handle handle-se"></div>
      </div>
    </div>
  `,
  styles: [`
    .text-layer-wrapper {
      position: absolute;
      cursor: move;
      user-select: none;
      touch-action: none;
      will-change: transform;
    }

    .text-layer-wrapper.selected {
      outline: 2px solid #2196F3;
      outline-offset: 2px;
    }

    .text-layer-wrapper.dragging {
      z-index: 10000 !important;
      opacity: 0.9;
      cursor: grabbing !important;
      transform-origin: 0 0;
    }

    .text-layer-wrapper:hover {
      outline: 1px solid #2196F3;
      outline-offset: 1px;
    }

    .text-layer-content {
      white-space: nowrap;
      pointer-events: none;
      line-height: 1.2;
      padding: 2px 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      min-width: 20px;
      min-height: 20px;
    }

    .text-layer-wrapper.dragging .text-layer-content {
      background: rgba(33, 150, 243, 0.2);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .selection-handles {
      position: absolute;
      top: -8px;
      left: -8px;
      right: -8px;
      bottom: -8px;
      pointer-events: none;
    }

    .handle {
      position: absolute;
      width: 8px;
      height: 8px;
      background: #2196F3;
      border: 1px solid #fff;
      border-radius: 50%;
      cursor: pointer;
      pointer-events: all;
    }

    .handle-nw {
      top: 0;
      left: 0;
      cursor: nw-resize;
    }

    .handle-ne {
      top: 0;
      right: 0;
      cursor: ne-resize;
    }

    .handle-sw {
      bottom: 0;
      left: 0;
      cursor: sw-resize;
    }

    .handle-se {
      bottom: 0;
      right: 0;
      cursor: se-resize;
    }

    .text-layer-wrapper:hover {
      outline: 1px solid #2196F3;
      outline-offset: 1px;
    }
  `]
})
export class TextLayerComponent implements OnDestroy {
  @Input() layer!: TextLayer;
  @Input() projectId!: string;
  @Input() isSelected = false;
  @Input() showHandles = true;
  @Output() layerEvent = new EventEmitter<TextLayerEvent>();

  isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private layerStartX = 0;
  private layerStartY = 0;
  private subscriptions: Subscription[] = [];
  private mouseMoveListener = this.onMouseMove.bind(this);
  private mouseUpListener = this.onMouseUp.bind(this);

  constructor(
    private designLabService: DesignLabService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.removeGlobalListeners();
  }

  private setupGlobalListeners() {
    // Add event listeners only during drag
    document.addEventListener('mousemove', this.mouseMoveListener, true);
    document.addEventListener('mouseup', this.mouseUpListener, true);
    document.body.style.userSelect = 'none';
  }

  private removeGlobalListeners() {
    document.removeEventListener('mousemove', this.mouseMoveListener, true);
    document.removeEventListener('mouseup', this.mouseUpListener, true);
    document.body.style.userSelect = '';
  }

  onMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    // Only handle primary mouse button
    if (event.button !== 0) return;

    console.log('🎯 Text layer mousedown started', {
      layerId: this.layer.id,
      startPos: { x: event.clientX, y: event.clientY },
      layerPos: { x: this.layer.x, y: this.layer.y }
    });

    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.layerStartX = this.layer.x;
    this.layerStartY = this.layer.y;

    // Setup listeners for this drag session
    this.setupGlobalListeners();

    // Add dragging class for visual feedback
    this.cdr.detectChanges();
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    event.preventDefault();
    event.stopPropagation();

    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;

    // Update layer position
    this.layer.x = this.layerStartX + deltaX;
    this.layer.y = this.layerStartY + deltaY;

    console.log('🎯 Text layer moving', {
      layerId: this.layer.id,
      delta: { x: deltaX, y: deltaY },
      newPos: { x: this.layer.x, y: this.layer.y }
    });

    // Emit move event for real-time updates
    this.layerEvent.emit({
      layerId: this.layer.id,
      type: 'move',
      data: { x: this.layer.x, y: this.layer.y }
    });

    this.cdr.detectChanges();
  }

  private onMouseUp(event: MouseEvent) {
    if (!this.isDragging) return;

    event.preventDefault();
    event.stopPropagation();

    console.log('🎯 Text layer drag ended', {
      layerId: this.layer.id,
      finalPos: { x: this.layer.x, y: this.layer.y }
    });

    this.isDragging = false;

    // Remove listeners after drag
    this.removeGlobalListeners();

    // Check if position actually changed
    if (this.layer.x !== this.layerStartX || this.layer.y !== this.layerStartY) {
      this.updateLayerPosition();
    }

    this.cdr.detectChanges();
  }

  onSelect(event: MouseEvent) {
    // Only select if we're not dragging (to avoid conflicts)
    if (this.isDragging) return;

    event.preventDefault();
    event.stopPropagation();

    console.log('🎯 Text layer selected', {
      layerId: this.layer.id,
      text: this.layer.details?.text
    });

    this.layerEvent.emit({
      layerId: this.layer.id,
      type: 'select',
      data: { layer: this.layer }
    });
  }

  onEdit(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    // Emit edit event - parent component will handle text editing
    this.layerEvent.emit({
      layerId: this.layer.id,
      type: 'update',
      data: { action: 'edit', layer: this.layer }
    });
  }

  private updateLayerPosition() {
    console.log('🔄 TextLayerComponent - Updating layer position:', {
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
        console.log('✅ TextLayerComponent - Layer position updated successfully:', result);
        this.layer.updatedAt = new Date();
      },
      error: (error: any) => {
        console.error('❌ TextLayerComponent - Failed to update layer position:', error);
        // Revert to original position on error
        this.layer.x = this.layerStartX;
        this.layer.y = this.layerStartY;
        this.cdr.detectChanges();
      }
    });

    this.subscriptions.push(subscription);
  }

  // Public method to update text layer properties
  updateTextProperties(properties: {
    text?: string;
    fontSize?: number;
    fontColor?: string;
    fontFamily?: string;
    isBold?: boolean;
    isItalic?: boolean;
    isUnderlined?: boolean;
  }) {
    console.log('� TextLayerComponent - Updating text properties:', properties);

    // Update local layer details
    if (this.layer.details) {
      Object.assign(this.layer.details, properties);
    }

    // Update backend
    const updateRequest = {
      text: this.layer.details?.text || '',
      fontSize: this.layer.details?.fontSize || 24,
      fontColor: this.layer.details?.fontColor || '#000000',
      fontFamily: this.layer.details?.fontFamily || 'Arial',
      isBold: this.layer.details?.isBold || false,
      isItalic: this.layer.details?.isItalic || false,
      isUnderlined: this.layer.details?.isUnderlined || false
    };

    const subscription = this.designLabService.updateTextLayerDetails(
      this.projectId,
      this.layer.id,
      updateRequest
    ).subscribe({
      next: (result: any) => {
        console.log('✅ TextLayerComponent - Text properties updated successfully:', result);
        this.layer.updatedAt = new Date();
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('❌ TextLayerComponent - Failed to update text properties:', error);
      }
    });

    this.subscriptions.push(subscription);
  }
}
