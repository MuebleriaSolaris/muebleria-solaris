import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Platform } from '@ionic/angular'; // Importar Platform para detectar la plataforma


export interface LoginResponse {
  status: string;
  message: string;
  userId: string;
  role?: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  company?: string;
  address?: string;
  phone?: string;
  role: number;
}

interface ApiResponse {
  status: 'success' | 'error';
  message: string;
  data: User[];
}

  
interface UserDetails {
  id: number;
  name: string;
  username: string;
  email: string;
  company?: string | null;
  address?: string | null;
  phone?: string | null;
  role: number;
}

interface UserDetailsResponse {
  status: 'success' | 'error';
  message?: string;
  data?: UserDetails;
}

interface DeleteUserResponse {
  success: boolean;
  message: string;
  deleted: boolean;
  userId?: number;
}

interface UserUpdateResponse {
  status: 'success' | 'error' | 'info';
  message: string;
  updated: boolean;
  userId?: number;
  changes?: any;
}


@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private roleSubject = new BehaviorSubject<string | null>(null);
  role$ = this.roleSubject.asObservable();

  private userId: string | null = null;
  private apiUrl = 'https://muebleriasolaris.com/ionic-login'; // Base API URL

  constructor(private http: HttpClient, private platform: Platform) {
    // Restore session data from localStorage
    const storedRole = localStorage.getItem('role');
    const storedUserId = localStorage.getItem('userId');
    const storedToken = localStorage.getItem('remember_token');

    if (storedRole) {
      this.roleSubject.next(storedRole);
    }
    if (storedUserId) {
      this.userId = storedUserId;
    }
  }

  // Método para detectar la plataforma
  getPlatform(): string {
    if (this.platform.is('android')) {
      return 'android';
    } else if (this.platform.is('ios')) {
      return 'ios';
    } else {
      return 'web';
    }
  }

  // Login API
  login(username: string, password: string): Observable<LoginResponse> {
    const platform = this.getPlatform();
    const userCredentials = { username, password, platform };
  
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login.php`, 
      userCredentials,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        responseType: 'json' // Forzar respuesta como JSON
      }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error completo:', error);
        
        let errorMessage = 'Error en el login. Por favor, inténtalo de nuevo.';
        
        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else if (error.status === 0) {
          // Servidor no alcanzable
          errorMessage = 'El servidor no está disponible. Intenta más tarde.';
        } else if (error.error?.message) {
          // Usar mensaje del backend si existe
          errorMessage = error.error.message;
        }
  
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  checkIfGerente(userId: number): Observable<{ success: boolean, isGerente?: boolean, error?: string }> {
    return this.http.get<{ success: boolean, isGerente?: boolean, error?: string }>(
      `${this.apiUrl}/check_gerencia.php?userid=${userId}`,
      {
        responseType: 'json',
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error en checkIfGerente:', error);
        return of({
          success: false,
          error: error.error?.error || 'Error al verificar el rol'
        });
      })
    );
  }

  getUserProfile(userId: number): Observable<{status: string, data?: any, message?: string}> {
    return this.http.get<{status: string, data?: any, message?: string}>(
      `${this.apiUrl}/login_usuario.php?id=${userId}`,
      {
        responseType: 'json',
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('API Error:', error);
        return of({
          status: 'error',
          message: 'Failed to fetch user profile'
        });
      })
    );
  }
  
  // Roles
  getRole() {
    return this.roleSubject.value;
  }

  setRole(role: string) {
    this.roleSubject.next(role);
    localStorage.setItem('role', role); // Save to localStorage
  }

  isAdmin(): boolean {
    return this.roleSubject.value === '1';
  }

  isSeller(): boolean {
    return this.roleSubject.value === '4';
  }

  // User ID
  setUserId(id: string) {
    this.userId = id;
    localStorage.setItem('userId', id); // Save to localStorage
  }

  getUserId(): string | null {
    if (!this.userId) {
      this.userId = localStorage.getItem('userId');
    }
    return this.userId;
  }

  // Persistent Token
  setRememberToken(token: string) {
    localStorage.setItem('remember_token', token); // Save token to localStorage
  }

  getRememberToken(): string | null {
    return localStorage.getItem('remember_token'); // Retrieve token from localStorage
  }

  // Clear session
  clearSession() {
    this.roleSubject.next(null); // Clear role from BehaviorSubject
    this.userId = null; // Clear user ID
    localStorage.removeItem('role'); // Remove role from localStorage
    localStorage.removeItem('userId'); // Remove user ID from localStorage
    localStorage.removeItem('remember_token'); // Remove token from localStorage
    console.log('Session cleared successfully.');
  }

  // Logout using clearSession
  logout() {
    this.clearSession();
  }

  // Obtener usuarios
  getUsers(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/get_users.php`).pipe(
      catchError((error) => {
        console.error('Error en getUsers:', error);
        return of({
          status: 'error' as const,
          message: 'Error al cargar usuarios. Intente nuevamente.',
          data: []
        });
      })
    );
  }

  // Obtener detalles de un usuario
  getUserDetails(userId: string): Observable<UserDetails> {
    return this.http.get<UserDetailsResponse>(`${this.apiUrl}/get_user_details.php?id=${userId}`).pipe(
      map(response => {
        if (response.status === 'success' && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener detalles del usuario');
      }),
      catchError(error => {
        console.error('Error en getUserDetails:', error);
        throw error; // Reenviar el error para manejarlo en el componente
      })
    );
  }

  // Actualizar usuario
  updateUser(userId: number, name: string, username: string): Observable<any> {
    const url = `${this.apiUrl}/update_user.php?id=${userId}`;
    
    return this.http.put(url, { name, username }).pipe(
      map((response: any) => {
        // Verificar estructura de respuesta
        if (!response || typeof response !== 'object') {
          throw new Error('Respuesta inválida del servidor');
        }
        
        if (response.status !== 'success') {
          throw new Error(response.message || 'Error al actualizar');
        }
        
        return {
          ...response,
          // Asegurar que 'updated' sea booleano
          updated: !!response.updated
        };
      }),
      catchError(error => {
        // Manejo de errores mejorado
        let errorMsg = 'Error al actualizar usuario';
        if (error.error && error.error.message) {
          errorMsg = error.error.message;
        } else if (error.message) {
          errorMsg = error.message;
        }
        return throwError(() => ({ 
          message: errorMsg,
          status: 'error'
        }));
      })
    );
  }

  // Eliminar usuario
  deleteUser(userId: number): Observable<DeleteUserResponse> {
    const url = `${this.apiUrl}/delete_user.php`;
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      observe: 'response' as const
    };

    return this.http.post<DeleteUserResponse>(url, { id: userId }, httpOptions).pipe(
      map((response: HttpResponse<DeleteUserResponse>) => {
        // Verificar estructura de respuesta
        if (!response.body || typeof response.body !== 'object') {
          throw new Error('Respuesta inválida del servidor');
        }
        
        return {
          ...response.body,
          // Asegurar que 'deleted' sea booleano
          deleted: !!response.body.deleted
        };
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Error al eliminar usuario';
        
        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Intentar obtener el mensaje del cuerpo de error
          const serverError = error.error;
          errorMessage = serverError?.message || 
                        `Error ${error.status}: ${error.message}`;
        }
        
        return throwError(() => ({
          success: false,
          message: errorMessage,
          deleted: false
        }));
      })
    );
  }
}