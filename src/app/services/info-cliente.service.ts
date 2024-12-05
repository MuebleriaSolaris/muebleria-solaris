import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InfoClienteService {
  private apiUrl = 'http://localhost/ionic-users/cliente_id_info.php'; // Cambia esta URL si es necesario

  constructor(private http: HttpClient) {}

  // Obtiene la información del cliente por ID
  getCustomerById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?id=${id}`);
  }
}
