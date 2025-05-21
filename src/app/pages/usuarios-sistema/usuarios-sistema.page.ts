import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Ajusta la ruta según tu proyecto
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuarios-sistema',
  templateUrl: './usuarios-sistema.page.html',
  styleUrls: ['./usuarios-sistema.page.scss'],
})
export class UsuariosSistemaPage implements OnInit {
  users: any[] = []; // Lista de usuarios

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadUsers();
  }

  // Cargar usuarios usando el servicio
  loadUsers() {
    
    this.authService.getUsers().subscribe({
      next: (response) => {
        
        if (response.status === 'success') {
          this.users = response.data;
        } else {
          console.error('Error del servidor:', response.message);
          // Mostrar mensaje al usuario
        }
      },
      error: (error) => {
        console.error('Error de conexión:', error);
        // Mostrar mensaje al usuario
      }
    });
  }

  // Redirigir a la página de detalles del usuario
  viewUserDetails(id: number) {
    this.router.navigate(['/usuarios-info', id]);
  }
}