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
  private readonly uploadPreset = 'design-lab-images'; // Necesitarás crear este preset en Cloudinary

  constructor() {}

  /**
   * Sube una imagen a Cloudinary
   * @param file El archivo de imagen a subir
   * @returns Observable con la respuesta de Cloudinary
   */
  uploadImage(file: File): Observable<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', 'design-lab'); // Organizar las imágenes en una carpeta

    const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    return from(
      fetch(uploadUrl, {
        method: 'POST',
        body: formData
      }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
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
