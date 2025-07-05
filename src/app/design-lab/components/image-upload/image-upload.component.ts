import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CloudinaryService, ImageUploadWithDimensions } from '../../services/cloudinary.service';

export interface ImageUploadResult {
  imageUrl: string;
  width: number;
  height: number;
  publicId: string;
  calculatedWidth: number;
  calculatedHeight: number;
}

export interface ImageUploadResultWithFile {
  imageUrl: string;
  width: number;
  height: number;
  publicId: string;
  calculatedWidth: number;
  calculatedHeight: number;
  file: File;
}

export interface DirectImageUploadResult {
  success: boolean;
  layerId?: string;
  error?: string;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslateModule
  ],
  template: `
    <div class="image-upload-container">
      <input
        #fileInput
        type="file"
        accept="image/*"
        (change)="onFileSelected($event)"
        class="file-input"
        [disabled]="isUploading">

      <button
        mat-raised-button
        color="primary"
        (click)="fileInput.click()"
        [disabled]="isUploading"
        class="upload-button">
        <mat-icon>image</mat-icon>
        <span *ngIf="!isUploading">{{ 'designLab.tools.addImage' | translate }}</span>
        <span *ngIf="isUploading">{{ 'designLab.tools.uploading' | translate }}</span>
        <mat-spinner *ngIf="isUploading" diameter="20" class="upload-spinner"></mat-spinner>
      </button>

      <div class="upload-info" *ngIf="!isUploading">
        <small>{{ 'designLab.imageUpload.supportedFormats' | translate }}: JPEG, PNG, GIF, WebP</small>
        <small>{{ 'designLab.imageUpload.maxSize' | translate }}: 10MB</small>
      </div>
    </div>
  `,
  styles: [`
    .image-upload-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
    }

    .file-input {
      display: none;
    }

    .upload-button {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      min-width: 150px;
      justify-content: center;
    }

    .upload-button:disabled {
      opacity: 0.6;
    }

    .upload-spinner {
      position: absolute;
      right: 8px;
    }

    .upload-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      text-align: center;
    }

    .upload-info small {
      color: #666;
      font-size: 12px;
    }
  `]
})
export class ImageUploadComponent {
  @Output() imageUploaded = new EventEmitter<ImageUploadResult>();
  @Output() directImageUpload = new EventEmitter<DirectImageUploadResult>();
  @Output() fileSelected = new EventEmitter<File>();

  @Input() enableDirectUpload = false;
  @Input() projectId: string | null = null;
  @Input() designLabService: any = null;

  isUploading = false;

  private cloudinaryService = inject(CloudinaryService);
  private translateService = inject(TranslateService);
  private snackBar = inject(MatSnackBar);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Emit the file for external handling if needed
      this.fileSelected.emit(file);

      // Handle upload based on mode
      if (this.enableDirectUpload && this.projectId && this.designLabService) {
        this.uploadImageDirectly(file);
      } else {
        this.uploadImage(file);
      }
    }
  }

  private uploadImageDirectly(file: File): void {
    // Validar el archivo
    if (!this.cloudinaryService.isValidImageFile(file)) {
      this.snackBar.open(
        this.translateService.instant('designLab.imageUpload.invalidFile'),
        this.translateService.instant('common.close'),
        {
          duration: 5000,
          panelClass: ['error-snackbar']
        }
      );
      return;
    }

    this.isUploading = true;

    this.designLabService.uploadImageAndCreateLayer(file, this.projectId).subscribe({
      next: (result: DirectImageUploadResult) => {
        console.log('✅ Direct image upload and layer creation successful:', result);

        this.directImageUpload.emit(result);
        this.isUploading = false;

        if (result.success) {
          this.snackBar.open(
            this.translateService.instant('designLab.imageUpload.success'),
            this.translateService.instant('common.close'),
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );
        } else {
          this.snackBar.open(
            result.error || this.translateService.instant('designLab.imageUpload.error'),
            this.translateService.instant('common.close'),
            {
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
        }
      },
      error: (error: any) => {
        console.error('❌ Error with direct image upload:', error);
        this.isUploading = false;

        this.snackBar.open(
          this.translateService.instant('designLab.imageUpload.error'),
          this.translateService.instant('common.close'),
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  private uploadImage(file: File): void {
    // Validar el archivo
    if (!this.cloudinaryService.isValidImageFile(file)) {
      this.snackBar.open(
        this.translateService.instant('designLab.imageUpload.invalidFile'),
        this.translateService.instant('common.close'),
        {
          duration: 5000,
          panelClass: ['error-snackbar']
        }
      );
      return;
    }

    this.isUploading = true;

    this.cloudinaryService.uploadImageWithDimensions(file).subscribe({
      next: (result: ImageUploadWithDimensions) => {
        console.log('✅ Image uploaded successfully with dimensions:', result);

        const uploadResult: ImageUploadResult = {
          imageUrl: result.cloudinaryResult.secure_url,
          width: result.cloudinaryResult.width,
          height: result.cloudinaryResult.height,
          publicId: result.cloudinaryResult.public_id,
          calculatedWidth: result.calculatedDimensions.width,
          calculatedHeight: result.calculatedDimensions.height
        };

        this.imageUploaded.emit(uploadResult);
        this.isUploading = false;

        this.snackBar.open(
          this.translateService.instant('designLab.imageUpload.success'),
          this.translateService.instant('common.close'),
          {
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );
      },
      error: (error) => {
        console.error('❌ Error uploading image:', error);
        this.isUploading = false;

        this.snackBar.open(
          this.translateService.instant('designLab.imageUpload.error'),
          this.translateService.instant('common.close'),
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }
}
