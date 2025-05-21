// src/app/services/clientes.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

interface CreateUserResponse {
  status: 'success' | 'error';
  message: string;
  created: boolean;
  userId?: number;
  remember_token?: string;
}

interface Customer {
  id: number;
  name: string;
  address?: string;
  phone: string;
  type?: string;
  has_pending_changes: boolean;
}

interface ListResponse {
  status: 'success' | 'error';
  message?: string;
  data: Customer[];
  pagination: {
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
  };
}

interface SearchResponse {
  status: 'success' | 'error';
  message?: string;
  data: Array<{
    id: number;
    name: string;
    address: string;
    phone: string;
    type: string;
    has_pending_changes: boolean;
  }>;
  count: number;
}



@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private apiUrl = 'https://muebleriasolaris.com/ionic-users'; // Adjust this to your backend URL

  constructor(private http: HttpClient) {}

  // Method to add a new client
  addClient(clientData: { name: string; address: string; phone: string; type: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/add_cliente.php`, clientData);
  }

  createUser(userData: any): Observable<CreateUserResponse> {
    const url = `${this.apiUrl}/add_user.php`;
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<CreateUserResponse>(url, userData, httpOptions).pipe(
      map((response: any) => {
        // Verificar estructura de respuesta
        if (!response || typeof response !== 'object') {
          throw new Error('Respuesta inválida del servidor');
        }
        
        return {
          status: response.status || 'error',
          message: response.message || '',
          created: !!response.created,
          userId: response.userId,
          remember_token: response.remember_token
        };
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Error al crear usuario';
        
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } else {
          errorMessage = error.error?.message || 
                       `Error ${error.status}: ${error.message}`;
        }
        
        return throwError(() => ({
          status: 'error',
          message: errorMessage,
          created: false
        }));
      })
    );
  }

  
  // Para listado paginado
  getCustomers(page: number = 1): Observable<ListResponse> {
    const params = new HttpParams().set('page', page.toString());
    
    return this.http.get<ListResponse>(`${this.apiUrl}/clientes.php`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Para búsqueda
  // Método para búsqueda (manteniendo tu estructura)
  searchCustomers(searchTerm: string): Observable<SearchResponse> {
      if (!searchTerm.trim()) {
          return of({
              status: 'success',
              message: 'Búsqueda vacía',
              data: [],
              count: 0
          });
      }

      const params = new HttpParams().set('search', searchTerm.trim());
      
      return this.http.get<SearchResponse>(
          `https://muebleriasolaris.com/ionic-users/clientes_search.php`, 
          { params }
      ).pipe(
          tap(response => {
              console.log('Respuesta de búsqueda:', response);
          }),
          catchError(error => {
              console.error('Error en searchCustomers:', error);
              return of({
                  status: 'error' as const,
                  message: 'Error en la búsqueda',
                  data: [],
                  count: 0
              });
          })
      );
  }

  private handleError(error: any): Observable<ListResponse> {
    console.error('Error en getCustomers:', error);
    return of({
      status: 'error',
      message: 'Error al cargar clientes',
      data: [],
      pagination: {
        total: 0,
        current_page: 1,
        per_page: 10,
        last_page: 1
      }
    });
  }

  private handleSearchError(error: any): Observable<SearchResponse> {
    console.error('Error en searchCustomers:', error);
    return of({
      status: 'error',
      message: 'Error en la búsqueda',
      data: [],
      count: 0,
      pagination: {
        total: 0,
        current_page: 1,
        per_page: 10,
        last_page: 1
      },
      search_term: ''
    });
  }
  // Additional methods for other client operations could go here (e.g., getClient, updateClient, deleteClient)
}
