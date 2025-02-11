import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private apiUrl = 'https://muebleriasolaris.com/ionic-products'; // URL base de tu API

  constructor(private http: HttpClient) {}

  getProducts(search: string = ''): Observable<any> {
    const url = `${this.apiUrl}?search=${encodeURIComponent(search)}`;
    return this.http.get(`${this.apiUrl}/inventory_info.php`);
  }

  getProductsByProvider(id_provider: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/inventory_info_by_id.php?provider_id=${id_provider}`); 
  }

  getProviders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/providers.php`);
  }

  getProviderById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/providers.php?id=${id}`);
  }

  saveProvider(provider: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/save_provider.php`, provider);
  }
  
  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories.php`);
  }

  getBrands(): Observable<any> {
    return this.http.get(`${this.apiUrl}/brands.php`);
  }

  saveInventory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/save_inventory.php`);
  }

  saveBrand(brand: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/save_brand.php`, brand,{
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  deleteBrand(brandId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/delete_brand.php`,
      { id: brandId }
    );
  }
  
  getSubCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sub_categories.php`);
  }

  saveProduct(product: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/save_product.php`, product);
  }

  addInventory(product: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/save_new_product.php`, product);
  }

  updateInventory(id_product: number, adjustment: number): Observable<any> {
    const payload = {
      id_product: id_product,
      adjustment: adjustment,
    };

    return this.http.post(`${this.apiUrl}/update_inventory.php`, payload);
  }
  
  deleteProduct(productId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete_product.php`,
      { product_id: productId }
    );
  }

  deleteProvider(providerId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete_provider.php`,
      { id: providerId }
    );
  }

  // Método para actualizar un proveedor
  updateProvider(provider: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/update_provider.php`,
      provider
    );
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
