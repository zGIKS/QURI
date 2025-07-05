import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Layer, ImageLayer, TextLayer } from '../../model/layer.entity';
import { LayerType } from '../../../const';

export interface LayerEvent {
  layerId: string;
  type: 'select' | 'move' | 'resize' | 'delete' | 'duplicate' | 'z-index';
  data?: any;
}

@Component({
  selector: 'app-design-canvas',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatSliderModule,
    MatTooltipModule,
    TranslateModule
  ],
  template: `
    <div class="design-canvas-container">
      <div class="canvas-header">
        <h3>{{ 'designLab.designCanvas' | translate }}</h3>
        <div class="canvas-controls">
          <button mat-icon-button
                  [disabled]="!canUndo"
                  (click)="undo()"
                  matTooltip="{{ 'designLab.undo' | translate }}">
            <mat-icon>undo</mat-icon>
          </button>
          <button mat-icon-button
                  [disabled]="!canRedo"
                  (click)="redo()"
                  matTooltip="{{ 'designLab.redo' | translate }}">
            <mat-icon>redo</mat-icon>
          </button>
          <button mat-icon-button
                  [disabled]="!selectedLayer"
                  (click)="deleteLayer()"
                  matTooltip="{{ 'designLab.deleteLayer' | translate }}">
            <mat-icon>delete</mat-icon>
          </button>
          <button mat-icon-button
                  [disabled]="!selectedLayer"
                  (click)="duplicateLayer()"
                  matTooltip="{{ 'designLab.duplicateLayer' | translate }}">
            <mat-icon>content_copy</mat-icon>
          </button>
        </div>
      </div>

      <div class="canvas-workspace">
        <div class="canvas-area"
             #canvas
             (click)="onCanvasClick($event)"
             [style.width.px]="canvasWidth"
             [style.height.px]="canvasHeight">

          <!-- Garment Background -->
          <div class="garment-background"
               [style.background-color]="garmentColor">
            <div class="garment-outline"></div>
          </div>

          <!-- Layer Elements -->
          <div *ngFor="let layer of layers; trackBy: trackByLayerId"
               class="layer-element"
               [class.selected]="selectedLayer?.id === layer.id"
               [class.dragging]="draggingLayer?.id === layer.id"
               [style.transform]="'translate(' + layer.x + 'px, ' + layer.y + 'px)'"
               [style.z-index]="layer.z"
               [style.opacity]="layer.opacity"
               [style.visibility]="layer.isVisible ? 'visible' : 'hidden'"
               [attr.data-layer-id]="layer.id"
               cdkDrag
               [cdkDragData]="layer"
               (cdkDragStarted)="onDragStart(layer)"
               (cdkDragEnded)="onDragEnd($event, layer)"
               (cdkDragMoved)="onDragMove($event, layer)"
               (click)="selectLayer(layer, $event)">

            <!-- Selection Handles -->
            <div *ngIf="selectedLayer?.id === layer.id" class="selection-handles">
              <div class="handle handle-nw" (mousedown)="startResize($event, 'nw')"></div>
              <div class="handle handle-ne" (mousedown)="startResize($event, 'ne')"></div>
              <div class="handle handle-sw" (mousedown)="startResize($event, 'sw')"></div>
              <div class="handle handle-se" (mousedown)="startResize($event, 'se')"></div>
            </div>

            <!-- Text Layer Content -->
            <div *ngIf="layer.type === LayerType.TEXT"
                 class="text-layer-content"
                 [style.font-size.px]="getTextDetails(layer).fontSize"
                 [style.color]="getTextDetails(layer).fontColor"
                 [style.font-family]="getTextDetails(layer).fontFamily"
                 [style.font-weight]="getTextDetails(layer).isBold ? 'bold' : 'normal'"
                 [style.font-style]="getTextDetails(layer).isItalic ? 'italic' : 'normal'"
                 [style.text-decoration]="getTextDetails(layer).isUnderlined ? 'underline' : 'none'"
                 (dblclick)="editTextLayer(layer)">
              {{ getTextDetails(layer).text }}
            </div>

            <!-- Image Layer Content -->
            <div *ngIf="layer.type === LayerType.IMAGE"
                 class="image-layer-content">
              <img [src]="getImageUrl(layer)"
                   [alt]="'designLab.imageLayer' | translate"
                   (load)="onImageLoad(layer)"
                   (error)="onImageError(layer)">
            </div>

            <!-- Context Menu -->
            <div class="layer-context-menu"
                 *ngIf="contextMenuLayer?.id === layer.id"
                 [style.left.px]="contextMenuPosition.x"
                 [style.top.px]="contextMenuPosition.y">
              <button mat-menu-item (click)="duplicateLayer()">
                <mat-icon>content_copy</mat-icon>
                {{ 'designLab.duplicate' | translate }}
              </button>
              <button mat-menu-item (click)="bringToFront(layer)">
                <mat-icon>flip_to_front</mat-icon>
                {{ 'designLab.bringToFront' | translate }}
              </button>
              <button mat-menu-item (click)="sendToBack(layer)">
                <mat-icon>flip_to_back</mat-icon>
                {{ 'designLab.sendToBack' | translate }}
              </button>
              <button mat-menu-item (click)="deleteLayer()">
                <mat-icon>delete</mat-icon>
                {{ 'designLab.delete' | translate }}
              </button>
            </div>
          </div>

          <!-- Drop Zone for New Layers -->
          <div class="drop-zone"
               cdkDropList
               [cdkDropListData]="layers"
               (cdkDropListDropped)="onDropNewLayer($event)"
               *ngIf="isDragOverCanvas">
            <div class="drop-zone-overlay">
              <mat-icon>add</mat-icon>
              <span>{{ 'designLab.dropToAdd' | translate }}</span>
            </div>
          </div>
        </div>

        <!-- Layer Properties Panel -->
        <div class="layer-properties" *ngIf="selectedLayer">
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ 'designLab.layerProperties' | translate }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="property-group">
                <label>{{ 'designLab.opacity' | translate }}</label>
                <mat-slider
                  [min]="0"
                  [max]="1"
                  [step]="0.1"
                  class="opacity-slider">
                  <input matSliderThumb
                         [value]="selectedLayer.opacity"
                         (input)="updateOpacity($event)">
                </mat-slider>
                <span class="opacity-value">{{ (selectedLayer.opacity * 100).toFixed(0) }}%</span>
              </div>

              <div class="property-group">
                <label>{{ 'designLab.position' | translate }}</label>
                <div class="position-controls">
                  <div class="position-input">
                    <span>X:</span>
                    <input type="number"
                           [value]="selectedLayer.x"
                           (change)="updatePosition('x', $event)">
                  </div>
                  <div class="position-input">
                    <span>Y:</span>
                    <input type="number"
                           [value]="selectedLayer.y"
                           (change)="updatePosition('y', $event)">
                  </div>
                </div>
              </div>

              <div class="property-group">
                <label>{{ 'designLab.layerOrder' | translate }}</label>
                <div class="z-index-controls">
                  <button mat-icon-button (click)="moveLayerUp()">
                    <mat-icon>keyboard_arrow_up</mat-icon>
                  </button>
                  <span>{{ selectedLayer.z }}</span>
                  <button mat-icon-button (click)="moveLayerDown()">
                    <mat-icon>keyboard_arrow_down</mat-icon>
                  </button>
                </div>
              </div>

              <!-- Text Layer Properties -->
              <div *ngIf="selectedLayer.type === LayerType.TEXT" class="text-properties">
                <div class="property-group">
                  <label>{{ 'designLab.fontSize' | translate }}</label>
                  <input type="number"
                         [value]="getTextDetails(selectedLayer).fontSize"
                         (change)="updateTextProperty('fontSize', $event)">
                </div>
                <div class="property-group">
                  <label>{{ 'designLab.fontColor' | translate }}</label>
                  <input type="color"
                         [value]="getTextDetails(selectedLayer).fontColor"
                         (change)="updateTextProperty('fontColor', $event)">
                </div>
                <div class="property-group">
                  <label>{{ 'designLab.fontFamily' | translate }}</label>
                  <select [value]="getTextDetails(selectedLayer).fontFamily"
                          (change)="updateTextProperty('fontFamily', $event)">
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>
                <div class="property-group">
                  <div class="text-style-toggles">
                    <button mat-icon-button
                            [class.active]="getTextDetails(selectedLayer).isBold"
                            (click)="toggleTextStyle('isBold')">
                      <mat-icon>format_bold</mat-icon>
                    </button>
                    <button mat-icon-button
                            [class.active]="getTextDetails(selectedLayer).isItalic"
                            (click)="toggleTextStyle('isItalic')">
                      <mat-icon>format_italic</mat-icon>
                    </button>
                    <button mat-icon-button
                            [class.active]="getTextDetails(selectedLayer).isUnderlined"
                            (click)="toggleTextStyle('isUnderlined')">
                      <mat-icon>format_underlined</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .design-canvas-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f5f5f5;
    }

    .canvas-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
    }

    .canvas-header h3 {
      margin: 0;
      font-weight: 500;
    }

    .canvas-controls {
      display: flex;
      gap: 8px;
    }

    .canvas-workspace {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .canvas-area {
      flex: 1;
      position: relative;
      background: white;
      border: 1px solid #e0e0e0;
      margin: 16px;
      border-radius: 8px;
      overflow: hidden;
      cursor: crosshair;
    }

    .garment-background {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 300px;
      height: 400px;
      transform: translate(-50%, -50%);
      border-radius: 20px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .garment-outline {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 2px dashed rgba(0,0,0,0.1);
      border-radius: 20px;
      pointer-events: none;
    }

    .layer-element {
      position: absolute;
      cursor: move;
      user-select: none;
      min-width: 20px;
      min-height: 20px;
    }

    .layer-element.selected {
      outline: 2px solid #1976d2;
      outline-offset: 2px;
    }

    .layer-element.dragging {
      opacity: 0.8;
      z-index: 1000 !important;
    }

    .selection-handles {
      position: absolute;
      top: -6px;
      left: -6px;
      right: -6px;
      bottom: -6px;
      pointer-events: none;
    }

    .handle {
      position: absolute;
      width: 12px;
      height: 12px;
      background: #1976d2;
      border: 2px solid white;
      border-radius: 50%;
      pointer-events: all;
      cursor: pointer;
      z-index: 1000;
      transition: all 0.2s ease;
    }

    .handle:hover {
      background: #1976d2;
      transform: scale(1.2);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    /* Solo handles de esquinas - NO laterales */
    .handle-nw {
      top: -8px;
      left: -8px;
      cursor: nw-resize;
      border: 2px solid white;
    }
    .handle-ne {
      top: -8px;
      right: -8px;
      cursor: ne-resize;
      border: 2px solid white;
    }
    .handle-sw {
      bottom: -8px;
      left: -8px;
      cursor: sw-resize;
      border: 2px solid white;
    }
    .handle-se {
      bottom: -8px;
      right: -8px;
      cursor: se-resize;
      border: 2px solid white;
    }

    /* NO incluir handles laterales */
    /* .handle-n, .handle-s, .handle-e, .handle-w están omitidos intencionalmente */

    .text-layer-content {
      min-width: 50px;
      min-height: 20px;
      padding: 4px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .image-layer-content {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .image-layer-content img {
      max-width: 200px;
      max-height: 200px;
      object-fit: contain;
    }

    .layer-context-menu {
      position: absolute;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 1000;
      min-width: 150px;
    }

    .drop-zone {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
    }

    .drop-zone-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(25, 118, 210, 0.1);
      border: 2px dashed #1976d2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #1976d2;
      font-weight: 500;
    }

    .drop-zone-overlay mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }

    .layer-properties {
      width: 300px;
      padding: 16px;
      background: white;
      border-left: 1px solid #e0e0e0;
      overflow-y: auto;
    }

    .property-group {
      margin-bottom: 16px;
    }

    .property-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #555;
    }

    .property-group input,
    .property-group select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .position-controls {
      display: flex;
      gap: 8px;
    }

    .position-input {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
    }

    .position-input span {
      font-weight: 500;
      min-width: 20px;
    }

    .position-input input {
      width: 60px;
      margin: 0;
    }

    .z-index-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .z-index-controls span {
      font-weight: 500;
      min-width: 30px;
      text-align: center;
    }

    .text-style-toggles {
      display: flex;
      gap: 4px;
    }

    .text-style-toggles button.active {
      background: #1976d2;
      color: white;
    }

    .opacity-value {
      font-size: 12px;
      color: #666;
      margin-left: 8px;
    }

    @media (max-width: 768px) {
      .canvas-workspace {
        flex-direction: column;
      }

      .layer-properties {
        width: 100%;
        height: 200px;
        border-left: none;
        border-top: 1px solid #e0e0e0;
      }
    }
  `]
})
export class DesignCanvasComponent implements OnInit, OnDestroy {
  @Input() layers: Layer[] = [];
  @Input() garmentColor: string = '#ffffff';
  @Input() canvasWidth: number = 800;
  @Input() canvasHeight: number = 600;
  @Input() readOnly: boolean = false;

  @Output() layerEvent = new EventEmitter<LayerEvent>();
  @Output() layersChange = new EventEmitter<Layer[]>();

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLDivElement>;

  // Component state
  selectedLayer: Layer | null = null;
  draggingLayer: Layer | null = null;
  contextMenuLayer: Layer | null = null;
  contextMenuPosition = { x: 0, y: 0 };
  isDragOverCanvas = false;

  // Undo/Redo state
  private history: Layer[][] = [];
  private historyIndex = -1;
  private maxHistorySize = 50;

  // Resize state
  private isResizing = false;
  private resizeHandle: string | null = null;
  private resizeStartPos = { x: 0, y: 0 };

  // Enums for template
  LayerType = LayerType;

  // Event listeners
  private keyDownListener = this.onKeyDown.bind(this);
  private documentClickListener = this.onDocumentClick.bind(this);
  private contextMenuListener = this.onContextMenu.bind(this);
  private mouseMoveListener = this.onResize.bind(this);
  private mouseUpListener = this.stopResize.bind(this);

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.saveToHistory();
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
  }

  get canUndo(): boolean {
    return this.historyIndex > 0;
  }

  get canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', this.keyDownListener);
    document.addEventListener('click', this.documentClickListener);
    document.addEventListener('contextmenu', this.contextMenuListener);
  }

  private removeEventListeners(): void {
    document.removeEventListener('keydown', this.keyDownListener);
    document.removeEventListener('click', this.documentClickListener);
    document.removeEventListener('contextmenu', this.contextMenuListener);
  }

  trackByLayerId(index: number, layer: Layer): string {
    return layer.id;
  }

  // === LAYER SELECTION ===
  selectLayer(layer: Layer, event: MouseEvent): void {
    if (this.readOnly) return;

    event.stopPropagation();
    this.selectedLayer = layer;
    this.contextMenuLayer = null;

    this.layerEvent.emit({
      layerId: layer.id,
      type: 'select',
      data: layer
    });
  }

  onCanvasClick(_event: MouseEvent): void {
    this.selectedLayer = null;
    this.contextMenuLayer = null;
  }

  onDocumentClick(_event: MouseEvent): void {
    this.contextMenuLayer = null;
  }

  onContextMenu(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const layerElement = target.closest('.layer-element');

    if (layerElement) {
      event.preventDefault();
      const layerId = layerElement.getAttribute('data-layer-id');
      const layer = this.layers.find(l => l.id === layerId);

      if (layer) {
        this.contextMenuLayer = layer;
        this.contextMenuPosition = { x: event.clientX, y: event.clientY };
      }
    }
  }

  // === DRAG AND DROP ===
  onDragStart(layer: Layer): void {
    this.draggingLayer = layer;
    this.selectedLayer = layer;
  }

  onDragEnd(event: CdkDragEnd, layer: Layer): void {
    this.draggingLayer = null;

    if (event.distance.x !== 0 || event.distance.y !== 0) {
      this.updateLayerPosition(layer, layer.x + event.distance.x, layer.y + event.distance.y);
    }
  }

  onDragMove(event: any, layer: Layer): void {
    // Update layer position during drag
    const newX = layer.x + event.distance.x;
    const newY = layer.y + event.distance.y;

    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(this.canvasWidth - 50, newX));
    const constrainedY = Math.max(0, Math.min(this.canvasHeight - 50, newY));

    layer.x = constrainedX;
    layer.y = constrainedY;
  }

  onDropNewLayer(_event: CdkDragDrop<Layer[]>): void {
    this.isDragOverCanvas = false;
    // Handle dropping new layers from tools panel
    // Implementation depends on your tool panel structure
  }

  // === LAYER MANIPULATION ===
  private updateLayerPosition(layer: Layer, x: number, y: number): void {
    layer.x = x;
    layer.y = y;
    layer.updatedAt = new Date();

    this.saveToHistory();
    this.emitLayersChange();

    this.layerEvent.emit({
      layerId: layer.id,
      type: 'move',
      data: { x, y }
    });
  }

  deleteLayer(): void {
    if (!this.selectedLayer) return;

    const layerIdToDelete = this.selectedLayer.id;
    const index = this.layers.findIndex(l => l.id === layerIdToDelete);
    if (index > -1) {
      this.layers.splice(index, 1);
      this.selectedLayer = null;
      this.saveToHistory();
      this.emitLayersChange();

      this.layerEvent.emit({
        layerId: layerIdToDelete,
        type: 'delete'
      });
    }
  }

  duplicateLayer(): void {
    if (!this.selectedLayer) return;

    const newLayer = this.cloneLayer(this.selectedLayer);
    newLayer.x += 20;
    newLayer.y += 20;

    this.layers.push(newLayer);
    this.selectedLayer = newLayer;
    this.saveToHistory();
    this.emitLayersChange();

    this.layerEvent.emit({
      layerId: newLayer.id,
      type: 'duplicate',
      data: newLayer
    });
  }

  private cloneLayer(layer: Layer): Layer {
    if (layer.type === LayerType.TEXT) {
      return new TextLayer(
        this.generateLayerId(),
        layer.x,
        layer.y,
        layer.z,
        layer.opacity,
        layer.isVisible,
        layer.createdAt,
        new Date(),
        { ...layer.details }
      );
    } else if (layer.type === LayerType.IMAGE) {
      return new ImageLayer(
        this.generateLayerId(),
        layer.x,
        layer.y,
        layer.z,
        layer.opacity,
        layer.isVisible,
        (layer as ImageLayer).imageUrl
      );
    }

    throw new Error('Unknown layer type');
  }

  // === LAYER ORDERING ===
  bringToFront(layer: Layer): void {
    const maxZ = Math.max(...this.layers.map(l => l.z));
    layer.z = maxZ + 1;
    this.saveToHistory();
    this.emitLayersChange();

    this.layerEvent.emit({
      layerId: layer.id,
      type: 'z-index',
      data: { z: layer.z }
    });
  }

  sendToBack(layer: Layer): void {
    const minZ = Math.min(...this.layers.map(l => l.z));
    layer.z = minZ - 1;
    this.saveToHistory();
    this.emitLayersChange();

    this.layerEvent.emit({
      layerId: layer.id,
      type: 'z-index',
      data: { z: layer.z }
    });
  }

  moveLayerUp(): void {
    if (!this.selectedLayer) return;

    const currentZ = this.selectedLayer.z;
    const layersAbove = this.layers.filter(l => l.z > currentZ).sort((a, b) => a.z - b.z);

    if (layersAbove.length > 0) {
      this.selectedLayer.z = layersAbove[0].z + 1;
      this.saveToHistory();
      this.emitLayersChange();
    }
  }

  moveLayerDown(): void {
    if (!this.selectedLayer) return;

    const currentZ = this.selectedLayer.z;
    const layersBelow = this.layers.filter(l => l.z < currentZ).sort((a, b) => b.z - a.z);

    if (layersBelow.length > 0) {
      this.selectedLayer.z = layersBelow[0].z - 1;
      this.saveToHistory();
      this.emitLayersChange();
    }
  }

  // === PROPERTY UPDATES ===
  updateOpacity(event: any): void {
    if (!this.selectedLayer) return;

    // Handle both slider input events and direct value changes
    const value = event.value !== undefined ? event.value : event.target.value;
    this.selectedLayer.opacity = parseFloat(value);
    this.saveToHistory();
    this.emitLayersChange();
  }

  updatePosition(axis: 'x' | 'y', event: any): void {
    if (!this.selectedLayer) return;

    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      this.selectedLayer[axis] = value;
      this.saveToHistory();
      this.emitLayersChange();
    }
  }

  updateTextProperty(property: string, event: any): void {
    if (!this.selectedLayer || this.selectedLayer.type !== LayerType.TEXT) return;

    let value = event.target.value;
    if (property === 'fontSize') {
      value = parseInt(value, 10);
    }

    this.selectedLayer.details[property] = value;
    this.selectedLayer.updatedAt = new Date();
    this.saveToHistory();
    this.emitLayersChange();
  }

  toggleTextStyle(property: string): void {
    if (!this.selectedLayer || this.selectedLayer.type !== LayerType.TEXT) return;

    this.selectedLayer.details[property] = !this.selectedLayer.details[property];
    this.selectedLayer.updatedAt = new Date();
    this.saveToHistory();
    this.emitLayersChange();
  }

  // === RESIZE HANDLING ===
  startResize(event: MouseEvent, handle: string): void {
    if (this.readOnly) return;

    event.stopPropagation();
    this.isResizing = true;
    this.resizeHandle = handle;
    this.resizeStartPos = { x: event.clientX, y: event.clientY };

    document.addEventListener('mousemove', this.mouseMoveListener);
    document.addEventListener('mouseup', this.mouseUpListener);
  }

  private onResize(event: MouseEvent): void {
    if (!this.isResizing || !this.selectedLayer || !this.resizeHandle) return;

    const deltaX = event.clientX - this.resizeStartPos.x;
    const deltaY = event.clientY - this.resizeStartPos.y;

    // Solo permitir resize en las esquinas
    if (!['nw', 'ne', 'sw', 'se'].includes(this.resizeHandle)) {
      console.warn('🚫 Resize solo permitido en esquinas, handle:', this.resizeHandle);
      return;
    }

    // Obtener el elemento del layer seleccionado
    const layerElement = document.querySelector(`[data-layer-id="${this.selectedLayer.id}"]`) as HTMLElement;
    if (!layerElement) {
      console.error('❌ No se encontró el elemento del layer:', this.selectedLayer.id);
      return;
    }

    // Obtener dimensiones actuales del elemento
    const rect = layerElement.getBoundingClientRect();
    const currentWidth = rect.width;
    const currentHeight = rect.height;

    // Calcular nuevo tamaño basado en el handle específico
    let newWidth = currentWidth;
    let newHeight = currentHeight;
    let newX = this.selectedLayer.x;
    let newY = this.selectedLayer.y;

    // Factor de sensibilidad para el resize
    const sensitivity = 1;

    switch (this.resizeHandle) {
      case 'nw': // Esquina superior izquierda
        newWidth = currentWidth - (deltaX * sensitivity);
        newHeight = currentHeight - (deltaY * sensitivity);
        newX = this.selectedLayer.x + (deltaX * sensitivity);
        newY = this.selectedLayer.y + (deltaY * sensitivity);
        break;

      case 'ne': // Esquina superior derecha
        newWidth = currentWidth + (deltaX * sensitivity);
        newHeight = currentHeight - (deltaY * sensitivity);
        newY = this.selectedLayer.y + (deltaY * sensitivity);
        break;

      case 'sw': // Esquina inferior izquierda
        newWidth = currentWidth - (deltaX * sensitivity);
        newHeight = currentHeight + (deltaY * sensitivity);
        newX = this.selectedLayer.x + (deltaX * sensitivity);
        break;

      case 'se': // Esquina inferior derecha
        newWidth = currentWidth + (deltaX * sensitivity);
        newHeight = currentHeight + (deltaY * sensitivity);
        break;
    }

    // Aplicar límites mínimos
    const minSize = 20;
    newWidth = Math.max(minSize, newWidth);
    newHeight = Math.max(minSize, newHeight);

    // Para capas de imagen, mantener proporciones
    if (this.selectedLayer.type === LayerType.IMAGE) {
      const originalWidth = this.selectedLayer.details?.width || currentWidth;
      const originalHeight = this.selectedLayer.details?.height || currentHeight;

      const adjustedDimensions = this.maintainImageAspectRatio(
        originalWidth,
        originalHeight,
        newWidth,
        newHeight
      );

      newWidth = adjustedDimensions.width;
      newHeight = adjustedDimensions.height;

      // Ajustar posición si cambió el tamaño manteniendo proporciones
      if (this.resizeHandle === 'nw') {
        newX = this.selectedLayer.x + (currentWidth - newWidth);
        newY = this.selectedLayer.y + (currentHeight - newHeight);
      } else if (this.resizeHandle === 'ne') {
        newY = this.selectedLayer.y + (currentHeight - newHeight);
      } else if (this.resizeHandle === 'sw') {
        newX = this.selectedLayer.x + (currentWidth - newWidth);
      }
      // 'se' no necesita ajuste de posición
    }

    // Actualizar posición del layer
    this.selectedLayer.x = Math.round(newX);
    this.selectedLayer.y = Math.round(newY);
    this.selectedLayer.updatedAt = new Date();

    // Actualizar dimensiones según el tipo de layer
    if (this.selectedLayer.type === LayerType.IMAGE) {
      this.selectedLayer.details = {
        ...this.selectedLayer.details,
        width: Math.round(newWidth),
        height: Math.round(newHeight)
      };

      // Aplicar estilos directamente al elemento imagen
      const imgElement = layerElement.querySelector('img') as HTMLImageElement;
      if (imgElement) {
        imgElement.style.width = `${newWidth}px`;
        imgElement.style.height = `${newHeight}px`;
      }
    }

    if (this.selectedLayer.type === LayerType.TEXT) {
      layerElement.style.width = `${newWidth}px`;
      layerElement.style.height = `${newHeight}px`;
      layerElement.style.fontSize = `${Math.max(12, newWidth / 10)}px`;
    }

    console.log('🔄 Resizing layer (corner only):', {
      handle: this.resizeHandle,
      originalSize: { width: currentWidth, height: currentHeight },
      newSize: { width: Math.round(newWidth), height: Math.round(newHeight) },
      newPosition: { x: Math.round(newX), y: Math.round(newY) },
      layerType: this.selectedLayer.type,
      maintainedAspectRatio: this.selectedLayer.type === LayerType.IMAGE
    });
  }

  private stopResize(): void {
    this.isResizing = false;
    this.resizeHandle = null;

    document.removeEventListener('mousemove', this.mouseMoveListener);
    document.removeEventListener('mouseup', this.mouseUpListener);

    this.saveToHistory();
    this.emitLayersChange();
  }

  /**
   * Mantiene las proporciones de una imagen durante el resize
   * @param originalWidth Ancho original de la imagen
   * @param originalHeight Alto original de la imagen
   * @param newWidth Nuevo ancho propuesto
   * @param newHeight Nuevo alto propuesto
   * @returns Dimensiones ajustadas manteniendo proporciones
   */
  private maintainImageAspectRatio(originalWidth: number, originalHeight: number, newWidth: number, newHeight: number): { width: number, height: number } {
    const aspectRatio = originalWidth / originalHeight;

    // Determinar qué dimensión usar como referencia basándose en el cambio más grande
    const widthChange = Math.abs(newWidth - originalWidth);
    const heightChange = Math.abs(newHeight - originalHeight);

    if (widthChange > heightChange) {
      // Usar el ancho como referencia
      return {
        width: newWidth,
        height: Math.round(newWidth / aspectRatio)
      };
    } else {
      // Usar la altura como referencia
      return {
        width: Math.round(newHeight * aspectRatio),
        height: newHeight
      };
    }
  }

  // === TEXT EDITING ===
  editTextLayer(layer: Layer): void {
    if (layer.type !== LayerType.TEXT) return;

    const newText = prompt('Edit text:', this.getTextDetails(layer).text);
    if (newText !== null) {
      layer.details.text = newText;
      layer.updatedAt = new Date();
      this.saveToHistory();
      this.emitLayersChange();
    }
  }

  // === UNDO/REDO ===
  undo(): void {
    if (this.canUndo) {
      this.historyIndex--;
      this.layers = this.deepClone(this.history[this.historyIndex]);
      this.selectedLayer = null;
      this.emitLayersChange();
    }
  }

  redo(): void {
    if (this.canRedo) {
      this.historyIndex++;
      this.layers = this.deepClone(this.history[this.historyIndex]);
      this.selectedLayer = null;
      this.emitLayersChange();
    }
  }

  private saveToHistory(): void {
    // Remove any history after current index
    this.history = this.history.slice(0, this.historyIndex + 1);

    // Add current state
    this.history.push(this.deepClone(this.layers));
    this.historyIndex++;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  // === KEYBOARD SHORTCUTS ===
  private onKeyDown(event: KeyboardEvent): void {
    if (this.readOnly) return;

    // Check if we're in an input field
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    switch (event.key) {
      case 'Delete':
      case 'Backspace':
        if (this.selectedLayer) {
          this.deleteLayer();
          event.preventDefault();
        }
        break;
      case 'Escape':
        this.selectedLayer = null;
        this.contextMenuLayer = null;
        break;
      case 'z':
        if (event.ctrlKey || event.metaKey) {
          if (event.shiftKey) {
            this.redo();
          } else {
            this.undo();
          }
          event.preventDefault();
        }
        break;
      case 'c':
        if ((event.ctrlKey || event.metaKey) && this.selectedLayer) {
          // Copy layer to clipboard (simplified)
          console.log('Copy layer:', this.selectedLayer.id);
          event.preventDefault();
        }
        break;
      case 'v':
        if ((event.ctrlKey || event.metaKey)) {
          // Paste layer from clipboard (simplified)
          console.log('Paste layer');
          event.preventDefault();
        }
        break;
      case 'd':
        if ((event.ctrlKey || event.metaKey) && this.selectedLayer) {
          this.duplicateLayer();
          event.preventDefault();
        }
        break;
    }
  }

  // === UTILITY METHODS ===
  getTextDetails(layer: Layer): any {
    return layer.details || {
      text: '',
      fontSize: 16,
      fontColor: '#000000',
      fontFamily: 'Arial',
      isBold: false,
      isItalic: false,
      isUnderlined: false
    };
  }

  getImageUrl(layer: Layer): string {
    return (layer as ImageLayer).imageUrl || '';
  }

  onImageLoad(layer: Layer): void {
    console.log('Image loaded for layer:', layer.id);
  }

  onImageError(layer: Layer): void {
    console.error('Failed to load image for layer:', layer.id);
  }

  private generateLayerId(): string {
    return 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  private emitLayersChange(): void {
    this.layersChange.emit([...this.layers]);
  }
}
