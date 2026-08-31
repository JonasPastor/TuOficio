import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  FirebaseStorage 
} from 'firebase/storage';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {
  private app: FirebaseApp;
  private storage: FirebaseStorage;

  constructor() {
    // Inicializar Firebase
    this.app = initializeApp(environment.firebase);
    this.storage = getStorage(this.app);
  }

  /**
   * Sube una imagen al storage de Firebase
   * @param file Archivo a subir
   * @param path Ruta donde se guardará el archivo (ej: 'avatars/user123')
   * @returns Observable con la URL de descarga
   */
  uploadImage(file: File, path: string): Observable<string> {
    const storageRef = ref(this.storage, path);
    
    // Convertir la promesa de uploadBytes en Observable
    return from(uploadBytes(storageRef, file)).pipe(
      // Una vez subido, obtener la URL de descarga
      switchMap(() => from(getDownloadURL(storageRef)))
    );
  }

  /**
   * Sube un avatar de usuario
   * @param file Archivo de imagen
   * @param userId ID del usuario
   * @returns Observable con la URL de descarga
   */
  uploadAvatar(file: File, userId: string): Observable<string> {
    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}.${this.getFileExtension(file.name)}`;
    const path = `avatars/${fileName}`;
    return this.uploadImage(file, path);
  }

  /**
   * Elimina un archivo del storage
   * @param url URL del archivo a eliminar
   * @returns Observable<void>
   */
  deleteFile(url: string): Observable<void> {
    try {
      const fileRef = ref(this.storage, url);
      return from(deleteObject(fileRef));
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      return from(Promise.resolve());
    }
  }

  /**
   * Obtiene la extensión de un archivo
   */
  private getFileExtension(fileName: string): string {
    return fileName.split('.').pop() || 'jpg';
  }

  /**
   * Valida que el archivo sea una imagen válida
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP).' 
      };
    }

    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: 'El archivo es demasiado grande. Tamaño máximo: 5MB.' 
      };
    }

    return { valid: true };
  }
}
