import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface SaveBrandResponse {
  success: boolean;
  message: string;
  id?: number;
}

@Injectable({
  providedIn: 'root',
})



export class InventoryService {
  private apiUrl = 'https://muebleriasolaris.com/ionic-products'; // URL base de tu API

  constructor(private http: HttpClient) {}

  // getProducts(search: string = ''): Observable<any> {
  //   const url = `${this.apiUrl}?search=${encodeURIComponent(search)}`;
  //   return this.http.get(`${this.apiUrl}/inventory_info.php`);
  // }

  getProducts(searchTerm?: string, subCategoryId?: number): Observable<any> {
    const params = new HttpParams()
      .set('search', searchTerm || '')
      .set('sub_category_id', subCategoryId ? subCategoryId.toString() : '');
  
    return this.http.get(`${this.apiUrl}/inventory_info.php`, { params });
  }
  
  // Modifica el método updateProductOrder
  updateProductOrder(orderData: {
    sub_category_id?: number,
    is_global?: boolean,
    product_ids: number[]
  }): Observable<any> {
    // Filtra propiedades undefined de manera segura
    const body = {
      ...orderData,
      ...(orderData.sub_category_id === undefined ? {} : { sub_category_id: orderData.sub_category_id }),
      ...(orderData.is_global === undefined ? {} : { is_global: orderData.is_global })
    };
  
    return this.http.post(`${this.apiUrl}/update-product-order.php`, body);
  }

  updateProductVisibility(productId: number, hideProduct: number): Observable<any> {
    const url = `${this.apiUrl}/update_visibility.php`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(url, { 
      product_id: productId,
      hide_product: hideProduct 
    }, { headers });
  }

  /**
   * Alterna el estado de visibilidad de un producto
   * @param productId ID del producto
   * @param currentStatus Estado actual (0 o 1)
   */
  toggleProductVisibility(productId: number, currentStatus: number): Observable<any> {
    const newStatus = currentStatus === 0 ? 1 : 0;
    return this.updateProductVisibility(productId, newStatus);
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

  saveBrand(brand: { name: string }): Observable<SaveBrandResponse> {
    const url = `${this.apiUrl}/save_brand.php`;
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    // Añadir fechas automáticamente
    const brandData = {
      ...brand,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return this.http.post<SaveBrandResponse>(url, brandData, httpOptions).pipe(
      map((response: any) => {
        // Verificar estructura de respuesta
        if (!response || typeof response !== 'object') {
          throw new Error('Respuesta inválida del servidor');
        }
        
        return {
          success: response.success === true,
          message: response.message || '',
          id: response.id
        };
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Error al guardar la marca';
        
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } else {
          errorMessage = error.error?.message || 
                       `Error ${error.status}: ${error.message}`;
        }
        
        return throwError(() => ({
          success: false,
          message: errorMessage
        }));
      })
    );
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

  // Método para guardar una subcategoría
  saveSubcategory(subcategory: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/save_subcategory.php`, subcategory);
  }
  
  // Método para obtener las subcategoría
  getSubs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/save_subcategory.php`);
  }

  // Método para borrar una subcategoría
  deleteSubcategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/save_subcategory.php?id=${id}`);
  }

  // Método para actualizar una subcategoría
  updateSubcategory(updatedSubcategory: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/save_subcategory.php`, updatedSubcategory);
  }

  // Método para obtener info de una subcategoría
  getSubcategoryById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/save_subcategory.php?id=${id}`);
  }

  // Método para obtener info de categorias por ID
  getCategoryName(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories_name_id.php?id=${id}`);
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
