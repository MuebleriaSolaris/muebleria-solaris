import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private roleSubject = new BehaviorSubject<string | null>(null);
  role$ = this.roleSubject.asObservable();

  private userId: string | null = null;

  getRole() {
    return this.roleSubject.value;
  }

  setRole(role: string) {
    this.roleSubject.next(role);
  }

  isAdmin(): boolean {
    return this.roleSubject.value === '1';
  }

  isSeller(): boolean {
    return this.roleSubject.value === '4';
  }

  setUserId(id: string) {
    this.userId = id;
  }

  getUserId(): string | null {
    return this.userId;
  }

  // In auth.service.ts
  logout() {
    this.roleSubject.next(""); // Clear the role or user data
    // Clear any other authentication data if necessary
  }

}
