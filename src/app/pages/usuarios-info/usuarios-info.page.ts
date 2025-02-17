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
    this.authService.getUserDetails(userId).subscribe({
      next: (response) => {
        this.user = response; // Asegúrate de que response tenga la propiedad 'id'
        this.originalUserData = { ...response };
        console.log('Detalles del usuario cargados:', this.user); // Log para depuración
      },
      error: (error) => {
        console.error('Error al cargar detalles del usuario:', error);
      },
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
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: () => {
            this.authService.updateUser(this.user.id, this.user).subscribe({
              next: (response) => {
                console.log('Response from updateUser:', response); // Log the response for debugging
                if (response.status === 'success') {
                  this.isEditMode = false;
                  this.loadUserDetails(this.user.id);
                  this.showAlert('Éxito', 'Usuario actualizado correctamente').then(() => {
                    window.location.reload();
                  });
                } else {
                  this.showAlert('Error', 'No se pudo actualizar el usuario');
                }
              },
              error: (error) => {
                console.error('Error updating user:', error); // Log the error for debugging
                this.showAlert('Error', 'No se pudo actualizar el usuario');
              }
            });
          }
        }
      ]
    });
    await confirm.present();
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

  deleteUser() {
    if (!this.user || !this.user.id) {
      console.error('ID de usuario no definido'); // Log para depuración
      this.showAlert('Error', 'No se pudo obtener el ID del usuario');
      return;
    }
  
    console.log('Eliminando usuario con ID:', this.user.id); // Log para depuración
    this.authService.deleteUser(this.user.id).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response); // Log para depuración
        if (response.success) {
          this.showAlert('Éxito', 'Usuario eliminado correctamente');
          this.router.navigate(['/usuarios-sistema']).then(() => {
            window.location.reload();
          });
        } else {
          this.showAlert('Error', 'Error al eliminar el usuario: ' + response.message);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud:', error); // Log para depuración
        this.showAlert('Error', 'No se pudo eliminar el usuario');
      }
    });
  }

  goBack() {
    this.router.navigate(['/usuarios-sistema']);
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}