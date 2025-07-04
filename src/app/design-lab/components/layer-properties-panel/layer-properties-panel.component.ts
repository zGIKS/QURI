import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
// Color picker will be implemented as a custom component or using input[type=color]
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { Layer, TextLayer, ImageLayer } from '../../model/layer.entity';

export interface LayerPropertyEvent {
  type: 'update-text' | 'update-image' | 'update-position' | 'update-opacity' | 'update-visibility';
  layerId: string;
  data: any;
}

@Component({
  selector: 'app-layer-properties-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './layer-properties-panel.component.html',
  styleUrl: './layer-properties-panel.component.css'
})
export class LayerPropertiesPanelComponent implements OnInit, OnDestroy {
  @Input() selectedLayer: Layer | null = null;
  @Output() propertyEvent = new EventEmitter<LayerPropertyEvent>();

  propertiesForm: FormGroup;
  private destroy$ = new Subject<void>();

  // Font options
  fontFamilies = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Impact', label: 'Impact' },
    { value: 'Comic Sans MS', label: 'Comic Sans MS' }
  ];

  fontSizes = [
    8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72, 96
  ];

  constructor(private fb: FormBuilder) {
    this.propertiesForm = this.createForm();
  }

  ngOnInit(): void {
    this.setupFormWatchers();
    this.updateFormWithLayer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(): void {
    this.updateFormWithLayer();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Common properties
      x: [0],
      y: [0],
      opacity: [1],
      isVisible: [true],

      // Text properties
      text: [''],
      fontFamily: ['Arial'],
      fontSize: [16],
      fontColor: ['#000000'],
      isBold: [false],
      isItalic: [false],
      isUnderlined: [false],

      // Image properties
      imageUrl: [''],
      width: [100],
      height: [100]
    });
  }

  private setupFormWatchers(): void {
    // Watch for form changes and emit events
    this.propertiesForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300)
      )
      .subscribe(value => {
        if (this.selectedLayer) {
          this.emitPropertyUpdate(value);
        }
      });
  }

  private updateFormWithLayer(): void {
    if (!this.selectedLayer) {
      this.propertiesForm.reset();
      return;
    }

    const updates: any = {
      x: this.selectedLayer.x,
      y: this.selectedLayer.y,
      opacity: this.selectedLayer.opacity,
      isVisible: this.selectedLayer.isVisible
    };

    if (this.selectedLayer.type === 'TEXT') {
      const textLayer = this.selectedLayer as TextLayer;
      updates.text = textLayer.details?.text || '';
      updates.fontFamily = textLayer.details?.fontFamily || 'Arial';
      updates.fontSize = textLayer.details?.fontSize || 16;
      updates.fontColor = textLayer.details?.fontColor || '#000000';
      updates.isBold = textLayer.details?.isBold || false;
      updates.isItalic = textLayer.details?.isItalic || false;
      updates.isUnderlined = textLayer.details?.isUnderlined || false;
    } else if (this.selectedLayer.type === 'IMAGE') {
      const imageLayer = this.selectedLayer as ImageLayer;
      updates.imageUrl = imageLayer.imageUrl || '';
      updates.width = imageLayer.details?.width || 100;
      updates.height = imageLayer.details?.height || 100;
    }

    this.propertiesForm.patchValue(updates, { emitEvent: false });
  }

  private emitPropertyUpdate(value: any): void {
    if (!this.selectedLayer) return;

    if (this.selectedLayer.type === 'TEXT') {
      this.propertyEvent.emit({
        type: 'update-text',
        layerId: this.selectedLayer.id,
        data: {
          text: value.text,
          fontFamily: value.fontFamily,
          fontSize: value.fontSize,
          fontColor: value.fontColor,
          isBold: value.isBold,
          isItalic: value.isItalic,
          isUnderlined: value.isUnderlined,
          x: value.x,
          y: value.y,
          opacity: value.opacity,
          isVisible: value.isVisible
        }
      });
    } else if (this.selectedLayer.type === 'IMAGE') {
      this.propertyEvent.emit({
        type: 'update-image',
        layerId: this.selectedLayer.id,
        data: {
          imageUrl: value.imageUrl,
          width: value.width,
          height: value.height,
          x: value.x,
          y: value.y,
          opacity: value.opacity,
          isVisible: value.isVisible
        }
      });
    }
  }

  onPositionChange(): void {
    if (!this.selectedLayer) return;

    const value = this.propertiesForm.value;
    this.propertyEvent.emit({
      type: 'update-position',
      layerId: this.selectedLayer.id,
      data: {
        x: value.x,
        y: value.y
      }
    });
  }

  onOpacityChange(): void {
    if (!this.selectedLayer) return;

    const value = this.propertiesForm.value;
    this.propertyEvent.emit({
      type: 'update-opacity',
      layerId: this.selectedLayer.id,
      data: {
        opacity: value.opacity
      }
    });
  }

  onVisibilityChange(): void {
    if (!this.selectedLayer) return;

    const value = this.propertiesForm.value;
    this.propertyEvent.emit({
      type: 'update-visibility',
      layerId: this.selectedLayer.id,
      data: {
        isVisible: value.isVisible
      }
    });
  }

  isTextLayer(): boolean {
    return this.selectedLayer?.type === 'TEXT';
  }

  isImageLayer(): boolean {
    return this.selectedLayer?.type === 'IMAGE';
  }

  resetToDefaults(): void {
    if (!this.selectedLayer) return;

    if (this.selectedLayer.type === 'TEXT') {
      this.propertiesForm.patchValue({
        fontFamily: 'Arial',
        fontSize: 16,
        fontColor: '#000000',
        isBold: false,
        isItalic: false,
        isUnderlined: false
      });
    } else if (this.selectedLayer.type === 'IMAGE') {
      this.propertiesForm.patchValue({
        width: 100,
        height: 100
      });
    }
  }
}
