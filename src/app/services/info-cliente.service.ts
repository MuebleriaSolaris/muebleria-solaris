import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InfoClienteService {
  private apiUrl = 'https://muebleriasolaris.com/ionic-users'; // Cambia esta URL si es necesario

  constructor(private http: HttpClient) {}

  getCustomerById(search: string = ''): Observable<any> {
    const url = `${this.apiUrl}?search=${encodeURIComponent(search)}`;
    return this.http.get(`${this.apiUrl}/cliente_id_info.php`);
  }

  // Obtiene la información del cliente por ID
  // getCustomerById(id: string): Observable<any> {
  //   return this.http.get(`${this.apiUrl}?id=${id}`);
  // }

  getCustomerHistory(customerId: number) {
    return this.http.get<any[]>(`https://muebleriasolaris.com/ionic-users/customer_changes.php?id_customer=${customerId}`);
  }
  
}
