import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { TextLayer, ImageLayer } from '../../model/layer.entity';
import { DEFAULT_LAYER_STYLES } from '../../../const';

export interface LayerToolEvent {
  type: 'text' | 'image' | 'shape' | 'save' | 'export';
  data?: any;
}

@Component({
  selector: 'app-layer-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    TranslateModule
  ],
  template: `
    <mat-toolbar class="layer-toolbar">
      <div class="toolbar-section">
        <span class="toolbar-label">{{ 'designLab.addLayers' | translate }}</span>
        <button mat-raised-button
                color="primary"
                (click)="addTextLayer()"
                matTooltip="{{ 'designLab.addTextLayer' | translate }}">
          <mat-icon>text_fields</mat-icon>
          {{ 'designLab.text' | translate }}
        </button>

        <button mat-raised-button
                color="accent"
                (click)="addImageLayer()"
                matTooltip="{{ 'designLab.addImageLayer' | translate }}">
          <mat-icon>image</mat-icon>
          {{ 'designLab.image' | translate }}
        </button>

        <input type="file"
               #fileInput
               (change)="onFileSelected($event)"
               accept="image/*"
               style="display: none;">
      </div>

      <div class="toolbar-spacer"></div>

      <div class="toolbar-section">
        <span class="toolbar-label">{{ 'designLab.actions' | translate }}</span>
        <button mat-button
                (click)="saveProject()"
                matTooltip="{{ 'designLab.saveProject' | translate }}">
          <mat-icon>save</mat-icon>
          {{ 'designLab.save' | translate }}
        </button>

        <button mat-button
                [matMenuTriggerFor]="exportMenu"
                matTooltip="{{ 'designLab.exportProject' | translate }}">
          <mat-icon>download</mat-icon>
          {{ 'designLab.export' | translate }}
        </button>

        <mat-menu #exportMenu="matMenu">
          <button mat-menu-item (click)="exportAs('png')">
            <mat-icon>image</mat-icon>
            PNG
          </button>
          <button mat-menu-item (click)="exportAs('svg')">
            <mat-icon>vector_curve</mat-icon>
            SVG
          </button>
          <button mat-menu-item (click)="exportAs('pdf')">
            <mat-icon>picture_as_pdf</mat-icon>
            PDF
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .layer-toolbar {
      background: white;
      border-bottom: 1px solid #e0e0e0;
      padding: 8px 16px;
      min-height: 64px;
    }

    .toolbar-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toolbar-label {
      font-weight: 500;
      color: #666;
      margin-right: 8px;
    }

    .toolbar-spacer {
      flex: 1;
    }

    button {
      min-width: 100px;
    }

    @media (max-width: 768px) {
      .layer-toolbar {
        flex-direction: column;
        gap: 12px;
        padding: 12px;
      }

      .toolbar-section {
        width: 100%;
        justify-content: center;
      }

      .toolbar-spacer {
        display: none;
      }
    }
  `]
})
export class LayerToolbarComponent {
  @Output() layerToolEvent = new EventEmitter<LayerToolEvent>();
  @Input() canSave: boolean = true;
  @Input() canExport: boolean = true;

  constructor(private dialog: MatDialog) {}

  addTextLayer(): void {
    const textLayer = this.createTextLayer();
    this.layerToolEvent.emit({
      type: 'text',
      data: textLayer
    });
  }

  addImageLayer(): void {
    // Trigger file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const imageLayer = this.createImageLayer(imageUrl);

        this.layerToolEvent.emit({
          type: 'image',
          data: imageLayer
        });
      };
      reader.readAsDataURL(file);
    }
  }

  saveProject(): void {
    if (!this.canSave) return;

    this.layerToolEvent.emit({
      type: 'save'
    });
  }

  exportAs(format: string): void {
    if (!this.canExport) return;

    this.layerToolEvent.emit({
      type: 'export',
      data: { format }
    });
  }

  private createTextLayer(): TextLayer {
    return new TextLayer(
      this.generateLayerId(),
      100, // x position
      100, // y position
      1,   // z index
      1,   // opacity
      true, // visible
      new Date(),
      new Date(),
      {
        text: 'Sample Text',
        fontSize: DEFAULT_LAYER_STYLES.FONT_SIZE,
        fontColor: DEFAULT_LAYER_STYLES.FONT_COLOR,
        fontFamily: DEFAULT_LAYER_STYLES.FONT_FAMILY,
        isBold: DEFAULT_LAYER_STYLES.BOLD,
        isItalic: DEFAULT_LAYER_STYLES.ITALIC,
        isUnderlined: DEFAULT_LAYER_STYLES.UNDERLINE
      }
    );
  }

  private createImageLayer(imageUrl: string): ImageLayer {
    return new ImageLayer(
      this.generateLayerId(),
      100, // x position
      100, // y position
      1,   // z index
      1,   // opacity
      true, // visible
      imageUrl
    );
  }

  private generateLayerId(): string {
    return 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
