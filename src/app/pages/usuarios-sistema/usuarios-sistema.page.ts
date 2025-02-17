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
        if (response && Array.isArray(response.data)) { // Verifica si hay datos
          this.users = response.data;
        } else {
          console.warn('No se pudieron cargar los usuarios. Respuesta inesperada:', response);
        }
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      },
    });
  }

  // Redirigir a la página de detalles del usuario
  viewUserDetails(id: number) {
    this.router.navigate(['/usuarios-info', id]);
  }
}