import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private apiUrl = 'http://localhost/ionic-products'; // URL base de tu API

  constructor(private http: HttpClient) {}

  getProducts(search: string = ''): Observable<any> {
    const url = `${this.apiUrl}?search=${encodeURIComponent(search)}`;
    return this.http.get(`${this.apiUrl}/inventory_info.php`);
  }

  getProviders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/providers.php`); // Ajusta la ruta si es necesario
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories.php`);
  }

  getBrands(): Observable<any> {
    return this.http.get(`${this.apiUrl}/brands.php`);
  }

  getSubCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sub_categories.php`);
  }

  saveProduct(product: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/save_product.php`, product);
  }

  /**
   * Sincronizar stock actual de un producto
   * @param product El producto a sincronizar
   * @returns Observable del producto actualizado
   */
  syncStock(productId: number): Observable<any> {
    const url = `${this.apiUrl}/inventory_info.php?product_id=${productId}`;
    return this.http.get(url); // Devuelve un Observable
  }
}
