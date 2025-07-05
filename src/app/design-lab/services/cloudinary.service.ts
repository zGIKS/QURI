import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private readonly cloudName = 'dkkfv72vo'; // Tu cloud name de Cloudinary
  private readonly uploadPreset = 'teelab'; // CAMBIAR: Usa el nombre de tu preset unsigned

  constructor() {
    console.log('🔧 CloudinaryService initialized');
    console.log('🔧 Cloud name:', this.cloudName);
    console.log('🔧 Upload preset:', this.uploadPreset);
    console.log('🔧 IMPORTANTE: Verifica que el preset sea "unsigned" en Cloudinary dashboard');
  }

  /**
   * Sube una imagen a Cloudinary
   * @param file El archivo de imagen a subir
   * @returns Observable con la respuesta de Cloudinary
   */
  uploadImage(file: File): Observable<CloudinaryUploadResult> {
    console.log('📤 Uploading image to Cloudinary:', file.name, file.size, 'bytes');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', 'design-lab');

    const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    console.log('📤 Upload URL:', uploadUrl);
    console.log('📤 Upload preset:', this.uploadPreset);
    console.log('📤 FormData contents:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
    }

    return from(
      fetch(uploadUrl, {
        method: 'POST',
        body: formData
      }).then(async response => {
        const responseText = await response.text();
        console.log('📤 Response status:', response.status);
        console.log('📤 Response text:', responseText);

        if (!response.ok) {
          let errorData;
          try {
            errorData = JSON.parse(responseText);
            console.error('❌ Cloudinary error:', errorData);
          } catch {
            console.error('❌ Raw error response:', responseText);
          }
          throw new Error(`Cloudinary upload failed: ${responseText}`);
        }

        const result = JSON.parse(responseText);
        console.log('✅ Upload successful:', result);
        return result;
      })
    );
  }

  /**
   * Valida que el archivo sea una imagen válida
   * @param file El archivo a validar
   * @returns true si es una imagen válida, false en caso contrario
   */
  isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB máximo

    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  /**
   * Obtiene información sobre los formatos de archivo soportados
   * @returns Array con los tipos MIME soportados
   */
  getSupportedFormats(): string[] {
    return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  }

  /**
   * Obtiene el tamaño máximo de archivo permitido en bytes
   * @returns El tamaño máximo en bytes
   */
  getMaxFileSize(): number {
    return 10 * 1024 * 1024; // 10MB
  }
}
