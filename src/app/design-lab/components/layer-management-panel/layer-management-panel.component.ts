import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { Layer } from '../../model/layer.entity';

export interface LayerManagementEvent {
  type: 'select' | 'toggle-visibility' | 'reorder' | 'delete' | 'duplicate' | 'bring-to-front' | 'send-to-back';
  layerId?: string;
  data?: any;
}

@Component({
  selector: 'app-layer-management-panel',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    TranslateModule
  ],
  templateUrl: './layer-management-panel.component.html',
  styleUrl: './layer-management-panel.component.css'
})
export class LayerManagementPanelComponent implements OnInit {
  @Input() layers: Layer[] = [];
  @Input() selectedLayerId: string | null = null;
  @Output() layerEvent = new EventEmitter<LayerManagementEvent>();

  sortedLayers: Layer[] = [];

  ngOnInit(): void {
    this.updateSortedLayers();
  }

  ngOnChanges(): void {
    this.updateSortedLayers();
  }

  private updateSortedLayers(): void {
    // Sort layers by z-index (highest first for visual stacking)
    this.sortedLayers = [...this.layers].sort((a, b) => b.z - a.z);
  }

  selectLayer(layer: Layer): void {
    this.layerEvent.emit({
      type: 'select',
      layerId: layer.id
    });
  }

  toggleLayerVisibility(layer: Layer): void {
    this.layerEvent.emit({
      type: 'toggle-visibility',
      layerId: layer.id,
      data: { isVisible: !layer.isVisible }
    });
  }

  deleteLayer(layer: Layer): void {
    this.layerEvent.emit({
      type: 'delete',
      layerId: layer.id
    });
  }

  duplicateLayer(layer: Layer): void {
    this.layerEvent.emit({
      type: 'duplicate',
      layerId: layer.id
    });
  }

  bringToFront(layer: Layer): void {
    this.layerEvent.emit({
      type: 'bring-to-front',
      layerId: layer.id
    });
  }

  sendToBack(layer: Layer): void {
    this.layerEvent.emit({
      type: 'send-to-back',
      layerId: layer.id
    });
  }

  onLayerDrop(event: CdkDragDrop<Layer[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.sortedLayers, event.previousIndex, event.currentIndex);

      // Recalculate z-indices based on new order
      const reorderedLayers = this.sortedLayers.map((layer, index) => ({
        ...layer,
        z: this.sortedLayers.length - index
      }));

      this.layerEvent.emit({
        type: 'reorder',
        data: { layers: reorderedLayers }
      });
    }
  }

  getLayerIcon(layer: Layer): string {
    switch (layer.type) {
      case 'TEXT':
        return 'text_fields';
      case 'IMAGE':
        return 'image';
      default:
        return 'layers';
    }
  }

  getLayerPreview(layer: Layer): string {
    switch (layer.type) {
      case 'TEXT':
        return layer.getContent().substring(0, 20) + (layer.getContent().length > 20 ? '...' : '');
      case 'IMAGE':
        return 'Image Layer';
      default:
        return 'Layer';
    }
  }

  trackByLayerId(index: number, layer: Layer): string {
    return layer.id;
  }
}
