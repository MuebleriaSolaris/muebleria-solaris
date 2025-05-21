// src/app/pages/perfil/perfil.page.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface UserProfile {
  name: string;
  username: string;
  email: string;
  company_name: string;
  address: string;
  phone: string;
  role: string;
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  user: UserProfile | null = null; // Initialize as null
  loading = true;
  error: string | null = null;
  userId: number | null = null ; // Variable para almacenar el ID del usuario

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  // Debug role value after user profile is loaded
  loadUserProfile() {
    const userIdString = this.authService.getUserId();
    this.userId = userIdString !== null ? parseInt(userIdString, 10) : null;
    
    if (this.userId) {
      this.authService.getUserProfile(this.userId).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.status === 'success' && response.data) {
            this.user = response.data;
            console.log('Perfil cargado:', this.user);
          } else {
            this.error = response.message || 'Error al cargar el perfil';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error de conexión con el servidor';
          console.error('Error en la solicitud:', err);
        }
      });
    } else {
      this.loading = false;
      this.error = 'ID de usuario no disponible';
    }
  }
  navigateHome() {
    const role = this.user?.role || this.authService.getRole(); // Use user role or fallback to AuthService role

    if (role === '1') {
      this.router.navigate(['/dashboard']);
    } else if (role === '4') {
      this.router.navigate(['/clientes']);
    } else {
      console.warn('Unrecognized role:', role); // In case of unexpected role
    }
  }
}
