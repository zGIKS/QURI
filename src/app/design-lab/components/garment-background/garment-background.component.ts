import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../model/project.entity';
import { GARMENT_COLOR } from '../../../const';

@Component({
  selector: 'app-garment-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './garment-background.component.html',
  styleUrl: './garment-background.component.css'
})
export class GarmentBackgroundComponent implements OnInit, OnChanges {
  @Input() project: Project | null = null;
  @Input() width: number = 600;
  @Input() height: number = 800;

  backgroundConfig: BackgroundConfig | null = null;
  fallbackBackgroundColor: string = '#FFFFFF';

  ngOnInit(): void {
    this.updateBackgroundConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['project'] && this.project) {
      this.updateBackgroundConfig();
    }
  }

  private updateBackgroundConfig(): void {
    if (!this.project) return;

    this.backgroundConfig = this.generateBackgroundConfig(this.project);
    this.fallbackBackgroundColor = this.getGarmentColorHex(this.project.garmentColor);
  }

  private generateBackgroundConfig(project: Project): BackgroundConfig {
    // Generate Cloudinary URLs for different fallback levels
    const baseConfig = {
      garmentColor: project.garmentColor,
      garmentSize: project.garmentSize,
      garmentGender: project.garmentGender
    };

    return {
      primaryUrl: this.buildCloudinaryUrl('garment-full', baseConfig),
      genericUrl: this.buildCloudinaryUrl('garment-generic', baseConfig),
      colorUrl: this.buildCloudinaryUrl('garment-color', baseConfig),
      fallbackColor: this.getGarmentColorHex(project.garmentColor),
      garmentType: 'garment', // Since garmentType was removed from the backend
      silhouetteClass: `garment-${project.garmentGender.toLowerCase()}-${project.garmentSize.toLowerCase()}`
    };
  }

  private buildCloudinaryUrl(variant: string, config: any): string {
    const baseUrl = 'https://res.cloudinary.com/quri/image/upload';

    // Cloudinary transformations for optimized loading
    const transformations = [
      'c_fit', // Crop mode: fit
      `w_${this.width},h_${this.height}`, // Dimensions
      'q_auto', // Quality: auto
      'f_auto', // Format: auto (WebP, AVIF)
      'dpr_auto' // DPR: auto for retina displays
    ];

    // Generate filename based on variant and config
    const filename = this.generateFilename(variant, config);

    return `${baseUrl}/${transformations.join(',')}/${filename}.png`;
  }

  private generateFilename(variant: string, config: any): string {
    switch (variant) {
      case 'garment-full':
        return `garment_${config.garmentColor.toLowerCase()}_${config.garmentGender.toLowerCase()}_${config.garmentSize.toLowerCase()}`;
      case 'garment-generic':
        return `garment_${config.garmentColor.toLowerCase()}_${config.garmentGender.toLowerCase()}`;
      case 'garment-color':
        return `garment_${config.garmentColor.toLowerCase()}`;
      default:
        return 'garment_default';
    }
  }

  private getGarmentColorHex(color: GARMENT_COLOR): string {
    const colorMap: { [key in GARMENT_COLOR]: string } = {
      [GARMENT_COLOR.WHITE]: '#FFFFFF',
      [GARMENT_COLOR.BLACK]: '#000000',
      [GARMENT_COLOR.GRAY]: '#6B7280',
      [GARMENT_COLOR.LIGHT_GRAY]: '#D1D5DB',
      [GARMENT_COLOR.RED]: '#DC2626',
      [GARMENT_COLOR.PINK]: '#EC4899',
      [GARMENT_COLOR.LIGHT_PURPLE]: '#A78BFA',
      [GARMENT_COLOR.PURPLE]: '#7C3AED',
      [GARMENT_COLOR.LIGHT_BLUE]: '#60A5FA',
      [GARMENT_COLOR.CYAN]: '#06B6D4',
      [GARMENT_COLOR.SKY_BLUE]: '#0EA5E9',
      [GARMENT_COLOR.BLUE]: '#2563EB',
      [GARMENT_COLOR.GREEN]: '#059669',
      [GARMENT_COLOR.LIGHT_GREEN]: '#34D399',
      [GARMENT_COLOR.YELLOW]: '#FBBF24',
      [GARMENT_COLOR.DARK_YELLOW]: '#D97706'
    };

    return colorMap[color] || '#FFFFFF';
  }

  onImageError(event: Event, fallbackType: 'generic' | 'color' | 'final'): void {
    const img = event.target as HTMLImageElement;

    if (!this.backgroundConfig) return;

    switch (fallbackType) {
      case 'generic':
        console.log('🖼️ Primary garment image failed, trying generic fallback');
        img.src = this.backgroundConfig.genericUrl;
        break;
      case 'color':
        console.log('🖼️ Generic garment image failed, trying color fallback');
        img.src = this.backgroundConfig.colorUrl;
        break;
      case 'final':
        console.log('🖼️ All garment images failed, using solid color fallback');
        img.style.display = 'none';
        break;
    }
  }

  getBackgroundStyle(): any {
    if (!this.backgroundConfig) {
      return {
        'background-color': this.fallbackBackgroundColor,
        'width.px': this.width,
        'height.px': this.height
      };
    }

    return {
      'background-color': this.backgroundConfig.fallbackColor,
      'width.px': this.width,
      'height.px': this.height
    };
  }
}

interface BackgroundConfig {
  primaryUrl: string;
  genericUrl: string;
  colorUrl: string;
  fallbackColor: string;
  garmentType: string;
  silhouetteClass: string;
}
