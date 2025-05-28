import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Ajusta la ruta según tu proyecto
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-usuarios-sistema',
  templateUrl: './usuarios-sistema.page.html',
  styleUrls: ['./usuarios-sistema.page.scss'],
})
export class UsuariosSistemaPage implements OnInit {
  users: any[] = []; // Lista de usuarios
  userId: string = ''; // ID del usuario actual
  esGerente: boolean = false; // Variable para verificar si el usuario es gerente
  userRoles: {[key: number]: boolean} = {}; // Diccionario para guardar {id: esGerente}

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ){}

  ngOnInit() {
    this.loadUsers();
  }

  // Cargar usuarios usando el servicio
  loadUsers() {
    this.authService.getUsers().subscribe({
      next: async (response) => {
        if (response.status === 'success') {
          this.users = response.data;
          await this.checkGerentes();
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

  async checkGerentes() {
    console.log('[checkGerentes] Iniciando verificación de gerentes');
    this.userRoles = {}; // Resetear el diccionario
    
    if (!this.users || this.users.length === 0) {
        console.warn('[checkGerentes] No hay usuarios para verificar');
        return;
    }

    console.log(`[checkGerentes] Usuarios a verificar: ${this.users.length}`);
    
    for (const user of this.users) {
        try {
            console.log(`[checkGerentes] Verificando usuario ID: ${user.id}, Nombre: ${user.name}`);
            
            const url = `https://muebleriasolaris.com/ionic-login/check_gerencia.php?userid=${user.id}`;
            console.log(`[checkGerentes] URL de la API: ${url}`);
            
            const response = await this.http.get<any>(url).toPromise();
            console.log('[checkGerentes] Respuesta de la API:', response);
            
            // Verificar estructura de la respuesta
            if (!response) {
                console.error('[checkGerentes] La respuesta está vacía');
                this.userRoles[user.id] = false;
                continue;
            }
            
            if (typeof response.success === 'undefined') {
                console.warn('[checkGerentes] La respuesta no tiene propiedad "success"');
            }
            
            if (typeof response.isGerente === 'undefined') {
                console.warn('[checkGerentes] La respuesta no tiene propiedad "isGerente"');
            }
            
            // Guardar en el diccionario {id: esGerente}
            this.userRoles[user.id] = response.success && response.isGerente;
            console.log(`[checkGerentes] Usuario ID ${user.id} es gerente: ${this.userRoles[user.id]}`);
            
        } catch (error) {
            console.error(`[checkGerentes] Error verificando gerente para usuario ${user.id}:`, error);
            this.userRoles[user.id] = false;
        }
    }
    
    console.log('[checkGerentes] Resultado final:', this.userRoles);
  }

  // Redirigir a la página de detalles del usuario
  viewUserDetails(id: number) {
      this.router.navigate(['/usuarios-info', id]);
    }

}