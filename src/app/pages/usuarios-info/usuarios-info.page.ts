// usuarios-info.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-usuarios-info',
  templateUrl: './usuarios-info.page.html',
  styleUrls: ['./usuarios-info.page.scss'],
})
export class UsuariosInfoPage implements OnInit {
  user: any = null; // Detalles del usuario a mostrar
  isEditMode = false;   // Modo edición para mostrar/ocultar campos editables
  originalUserData: any;  // Almacena los datos originales del usuario para restaurar si es necesario
  userId!: string;  // ID del usuario obtenido de la URL
  loading = false;  
  error: string | null = null; // Variable para almacenar el mensaje de error
  isDeleting = false; // Variable para controlar el estado de eliminación
  isUpdating = false;
  // Variables adicionales que necesitarás
  isPasswordMode: boolean = false;  // Modo para cambiar contraseñas
  currentPassword: string = ''; 
  newPassword: string = '';   
  confirmNewPassword: string = '';  
  showWebPassword: boolean = false; 
  showAndroidPassword: boolean = false;   
  showIosPassword: boolean = false;   // Variables para mostrar/ocultar contraseñas
  verificationPassword: string = '';  // Contraseña para verificación
  isVerified: { [platform: string]: boolean } = {};   // Objeto para almacenar el estado de verificación por plataforma
  verificationError: string = '';   // Variable para almacenar errores de verificación
  esGerente: boolean = false; // Variable para verificar si el usuario es gerente
  // Variables para almacenar las contraseñas de cada plataforma
  webPassword = {
    current: '',
    new: '',
    confirm: ''
  };
  // Variables para las contraseñas de Android e iOS
  androidPassword = {
    current: '',
    new: '',
    confirm: ''
  };

  iosPassword = {
    current: '',
    new: '',
    confirm: ''
  };
  // Objeto para almacenar las contraseñas de verificación y resultados
  verify = {
    web: '',
    android: '',
    ios: '',
    webResult: null as boolean | null,
    androidResult: null as boolean | null,
    iosResult: null as boolean | null
  };
  // Objeto para almacenar las nuevas contraseñas de cada plataforma
  newPasswords = {
    web: '',
    android: '',
    ios: ''
  };
// Objeto para controlar la visibilidad de las contraseñas por plataforma
  show = {
    web: false,
    android: false,
    ios: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    // Obtener el ID del usuario desde AuthService
    const userIdGer = this.authService.getUserId();
    if (this.userId) {
      this.loadUserDetails(this.userId);
    } else {
      console.warn('No se recibió ningún ID en la URL.'); // Log para depuración
    }
    if (userIdGer) {
      // Realizar la llamada HTTP directamente en el componente
      this.http.get<any>(`https://muebleriasolaris.com/ionic-login/check_gerencia.php?userid=${userIdGer}`)
        .subscribe((response) => {
          if (response.success) {
            this.esGerente = response.isGerente;
          } else {
            console.error('Error en la respuesta de la API:', response.error);
          }
          console.log('¿Es gerente?', this.esGerente);
          console.log('ID de usuario:', userIdGer);
        }, (error) => {
          console.error('Error en la llamada HTTP:', error);
        });
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

  // toggleEditMode() {
  //   this.isEditMode = !this.isEditMode;
  // }

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

  // Métodos adicionales
  togglePasswordMode() {
  this.isPasswordMode = !this.isPasswordMode;
  if (this.isPasswordMode) {
    this.isEditMode = false; // Desactiva el modo edición si activas el modo contraseña
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.isPasswordMode = false; // Desactiva el modo contraseña si activas el modo edición
    }
  }

  // Método para alternar visibilidad de contraseña
  toggleShowPassword(platform: string) {
    switch (platform) {
      case 'web':
        this.showWebPassword = !this.showWebPassword;
        break;
      case 'android':
        this.showAndroidPassword = !this.showAndroidPassword;
        break;
      case 'ios':
        this.showIosPassword = !this.showIosPassword;
        break;
    }
  }
  // Método para verificar la contraseña actual
  async verifyPassword(platform: 'web' | 'android' | 'ios') {
    try {
      const verificationData = {
        user_id: this.user.id,
        password: this.verificationPassword,
        platform: platform
      };

      const response = await this.http.post<any>(
        'https://muebleriasolaris.com/ionic-users/verify_password.php',
        verificationData
      ).toPromise();

      if (response.status === 'success') {
        this.isVerified[platform] = true;
        return true;
      } else {
        await this.showAlert('Error', response.message);
        return false;
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      await this.showAlert('Error', 'No se pudo verificar la contraseña');
      return false;
    }
  }

  // Método para actualizar todas las contraseñas
  async updateAllPasswords() {
    try {
      
      // Validación de coincidencia (opcional si mantienes confirmación)
      if (this.newPasswords.web && this.webPassword.new !== this.webPassword.confirm) {
        throw new Error('Las contraseñas Web no coinciden');
      }
      // Repetir para android e ios si mantienes confirmación

      const updates = [];
      
      // Actualización independiente por plataforma
      if (this.newPasswords.web) {
        updates.push(this.updatePlatformPassword('web', this.newPasswords.web));
      }
      if (this.newPasswords.android) {
        updates.push(this.updatePlatformPassword('android', this.newPasswords.android));
      }
      if (this.newPasswords.ios) {
        updates.push(this.updatePlatformPassword('ios', this.newPasswords.ios));
      }

      if (updates.length === 0) {
        await this.showAlert('Información', 'No se especificaron nuevas contraseñas');
        return;
      }

      await Promise.all(updates);
      await this.showAlert('Éxito', 'Contraseñas actualizadas correctamente');
      this.cancelPasswordChange();
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar contraseñas';
      await this.showAlert('Error', errorMessage);
    }
  }

  // Método para actualizar una contraseña específica
  async updatePlatformPassword(platform: 'web' | 'android' | 'ios', newPassword: string) {
    const columnMap = {
      web: 'password',
      android: 'android_pass',
      ios: 'pass_appcom'
    };

    const data = {
      user_id: this.user.id,
      new_password: newPassword,
      platform: platform,
      column_name: columnMap[platform]
    };

    try {
      const response = await this.http.post<any>(
        'https://muebleriasolaris.com/ionic-users/update_password.php',
        data
      ).toPromise();

      if (response.status !== 'success') {
        throw new Error(response.message || `Error al actualizar contraseña ${platform}`);
      }
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  // Método para cancelar cambios
  cancelPasswordChange() {
    this.isPasswordMode = false;
    // Resetear todos los campos
    this.verify = {
      web: '',
      android: '',
      ios: '',
      webResult: null,
      androidResult: null,
      iosResult: null
    };
    this.newPasswords = {
      web: '',
      android: '',
      ios: ''
    };
    this.show = {
      web: false,
      android: false,
      ios: false
    };
  }

  async checkPassword(platform: 'web' | 'android' | 'ios') {
    const password = this.verify[platform];
    if (!password) {
      this.verify[`${platform}Result`] = null;
      return;
    }

    try {
      // Resetear el estado antes de la verificación
      this.verify[`${platform}Result`] = null;
      
      const response = await this.http.post<any>(
        'https://muebleriasolaris.com/ionic-users/verify_password.php',
        {
          user_id: this.user.id,
          password: password,
          platform: platform
        }
      ).toPromise();

      // Establecer el resultado (true/false)
      this.verify[`${platform}Result`] = response.status === 'success';
      
      // Resetear después de 3 segundos
      setTimeout(() => {
        this.verify[`${platform}Result`] = null;
      }, 3000);

    } catch (error) {
      console.error('Error verificando contraseña:', error);
      this.verify[`${platform}Result`] = false;
      
      // Resetear después de 3 segundos
      setTimeout(() => {
        this.verify[`${platform}Result`] = null;
      }, 3000);
    }
  }

  toggleShow(platform: 'web' | 'android' | 'ios') {
    this.show[platform] = !this.show[platform];
  }
}