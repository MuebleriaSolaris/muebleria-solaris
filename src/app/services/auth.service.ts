import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Platform } from '@ionic/angular'; // Importar Platform para detectar la plataforma

export interface LoginResponse {
  status: string;
  message: string;
  userId: string;
  role?: string;
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
    const platform = this.getPlatform(); // Obtener la plataforma
    console.log(`Acceso desde la plataforma: ${platform}`); // Mostrar la plataforma en la consola
  
    // Crear el objeto con las credenciales del usuario
    const userCredentials = {
      username: username,
      password: password,
      platform: platform
    };
  
    // Configurar las cabeceras HTTP
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
  
    // Enviar la solicitud POST al servidor
    return this.http.post<LoginResponse>(`${this.apiUrl}/login.php`, userCredentials, httpOptions).pipe(
      catchError((error) => {
        console.error('Error en la solicitud:', error);
        throw 'Error en el login. Por favor, inténtalo de nuevo.';
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

  // Obtener lista de usuarios
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_users.php`).pipe(
      catchError((error) => {
        console.error('Error en la solicitud:', error);
        throw error; // Re-lanzar el error para manejarlo en el componente
      })
    );
  }

  // Obtener detalles de un usuario
  getUserDetails(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/get_user_details.php?id=${userId}`);
  }

  // Actualizar usuario
  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update_user.php?id=${userId}`, userData);
  }

  // Eliminar usuario
  deleteUser(userId: string): Observable<any> {
    const body = { id: userId }; // Asegúrate de que el cuerpo de la solicitud tenga la propiedad 'id'
    return this.http.post(`${this.apiUrl}/delete_user.php`, body, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'json',
    });
  }
}