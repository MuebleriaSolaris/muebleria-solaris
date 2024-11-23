// src/app/services/clientes.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private apiUrl = 'http://localhost/ionic-users/add_cliente.php'; // Adjust this to your backend URL

  constructor(private http: HttpClient) {}

  // Method to add a new client
  addClient(clientData: { name: string; address: string; phone: string; type: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/add_cliente.php`, clientData);
  }

  // Additional methods for other client operations could go here (e.g., getClient, updateClient, deleteClient)
}
