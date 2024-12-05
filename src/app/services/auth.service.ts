import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private roleSubject = new BehaviorSubject<string | null>(null);
  role$ = this.roleSubject.asObservable();

  private userId: string | null = null;

  constructor() {
    // Restaurar datos desde localStorage al iniciar la aplicación
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

  // Roles
  getRole() {
    return this.roleSubject.value;
  }

  setRole(role: string) {
    this.roleSubject.next(role);
    localStorage.setItem('role', role); // Guardar en localStorage
  }

  isAdmin(): boolean {
    return this.roleSubject.value === '1';
  }

  isSeller(): boolean {
    return this.roleSubject.value === '4';
  }

  // Usuario ID
  setUserId(id: string) {
    this.userId = id;
    localStorage.setItem('userId', id); // Guardar en localStorage
  }

  getUserId(): string | null {
    if (!this.userId) {
      this.userId = localStorage.getItem('userId');
    }
    return this.userId;
  }

  // Token Persistente
  setRememberToken(token: string) {
    localStorage.setItem('remember_token', token); // Guardar token en localStorage
  }

  getRememberToken(): string | null {
    return localStorage.getItem('remember_token'); // Obtener token de localStorage
  }

  // Método para limpiar la sesión
  clearSession() {
    this.roleSubject.next(null); // Limpiar el rol en el BehaviorSubject
    this.userId = null; // Limpiar el ID del usuario
    localStorage.removeItem('role'); // Eliminar rol de localStorage
    localStorage.removeItem('userId'); // Eliminar ID de usuario de localStorage
    localStorage.removeItem('remember_token'); // Eliminar token de localStorage
    console.log('Sesión limpiada correctamente.');
  }

  // Logout que utiliza clearSession
  logout() {
    this.clearSession(); // Limpia la sesión completamente
  }
}
