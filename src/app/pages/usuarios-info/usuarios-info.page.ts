// usuarios-info.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-usuarios-info',
  templateUrl: './usuarios-info.page.html',
  styleUrls: ['./usuarios-info.page.scss'],
})
export class UsuariosInfoPage implements OnInit {
  user: any = null;
  isEditMode = false;
  originalUserData: any;
  userId!: string; 
  loading = false;
  error: string | null = null; // Variable para almacenar el mensaje de error
  isDeleting = false; // Variable para controlar el estado de eliminación
  isUpdating = false;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (this.userId) {
      this.loadUserDetails(this.userId);
    } else {
      console.warn('No se recibió ningún ID en la URL.'); // Log para depuración
    }
  }

  loadUserDetails(userId: string) {
    this.loading = true;
    this.error = null;
  
    this.authService.getUserDetails(userId).subscribe({
      next: (userDetails) => {
        this.loading = false;
        this.user = userDetails;
        this.originalUserData = { ...userDetails };
        console.log('Detalles del usuario cargados:', this.user);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.message || 'Error al cargar detalles del usuario';
        console.error('Error al cargar detalles del usuario:', error);
      }
    });
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  async saveChanges() {
    const confirm = await this.alertController.create({
      header: 'Confirmar cambios',
      message: '¿Estás seguro de querer guardar los cambios?',
      buttons: [
        { 
          text: 'Cancelar', 
          role: 'cancel',
          handler: () => {
            this.resetForm(); // Opcional: resetear cambios si cancela
          }
        },
        {
          text: 'Guardar',
          handler: () => {
            this.confirmUpdate();
            return false; // Evitar que el alert se cierre automáticamente
          }
        }
      ]
    });
    
    await confirm.present();
  }
  
  private confirmUpdate() {
    this.isUpdating = true;
    
    this.authService.updateUser(
      this.user.id,
      this.user.name,
      this.user.username
    ).subscribe({
      next: (response) => {
        this.isUpdating = false;
        
        // Verificación explícita del estado de actualización
        if (response.updated === true) {
          this.showAlert('Éxito', response.message).then(() => {
            this.isEditMode = false;
            // Forzar recarga de datos
            this.loadUserDetails(this.user.id);
            
            // Cerrar cualquier modal abierto
            if (this.alertController) {
              this.alertController.dismiss();
            }
          });
        } else {
          this.showAlert('Información', 'No se realizaron cambios');
        }
      },
      error: (error) => {
        this.isUpdating = false;
        this.showAlert('Error', error.message || 'Error al actualizar');
      }
    });
  }
  
  private resetForm() {
    // Restaurar datos originales si se cancela
    if (this.originalUserData) {
      this.user = {...this.originalUserData};
    }
  }

  cancelEdit() {
    this.user = { ...this.originalUserData };
    this.isEditMode = false;
  }

  async confirmDelete() {
    const loggedInUserId = this.authService.getUserId(); // Get the logged-in user's ID

    if (!this.user || !this.user.id) {
      console.error('ID de usuario no definido'); // Log para depuración
      this.showAlert('Error', 'No se pudo obtener el ID del usuario');
      return;
    }

    if (this.user.id === loggedInUserId) {
      this.showAlert('Error', 'No puedes eliminar tu propio usuario');
      return;
    }

    const confirm = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de querer eliminar este usuario?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteUser();
          }
        }
      ]
    });
    await confirm.present();
  }

  async deleteUser() {
    if (!this.user?.id) {
      await this.showAlert('Error', 'No se pudo obtener el ID del usuario');
      return;
    }

    this.isDeleting = true;

    this.authService.deleteUser(this.user.id).subscribe({
      next: async (response) => {
        this.isDeleting = false;
        
        if (response.success && response.deleted) {
          await this.showAlert('Éxito', response.message);
          this.router.navigate(['/usuarios-sistema']).then(() => {
            window.location.reload();
          });
        } else {
          await this.showAlert('Información', response.message || 'No se pudo eliminar el usuario');
        }
      },
      error: async (error) => {
        this.isDeleting = false;
        console.error('Error eliminando usuario:', error);
        await this.showAlert('Error', error.message || 'Error al comunicarse con el servidor');
      }
    });
  }

  goBack() {
    this.router.navigate(['/usuarios-sistema']);
  }

  async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    
    await alert.present();
    await alert.onDidDismiss(); // Espera a que se cierre el alert
  }
}