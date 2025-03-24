// src/app/services/image-state.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Esto lo hace disponible en toda la aplicación
})
export class ImageStateService {
  constructor() { }

  getImageUrl(product: any): string {
    if (!product?.image_url) {
      return 'assets/product_placeholder.png';
    }
    
    // Forzar siempre la última versión
    return `${product.image_url}?t=${Date.now()}`;
  }
}