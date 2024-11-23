import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = 'http://localhost/ionic-users/inventory_info.php'; // Cambia por la URL de tu API

  constructor(private http: HttpClient) {}

  getProducts(search: string = ''): Observable<any> {
    const url = `${this.apiUrl}?search=${encodeURIComponent(search)}`;
    return this.http.get(url);
  }
}
