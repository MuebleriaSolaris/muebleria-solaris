import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-crear-usuario',
  templateUrl: './crear-usuario.page.html',
  styleUrls: ['./crear-usuario.page.scss'],
})

export class CrearUsuarioPage {
  newUser = {
    name: '',
    username: '',
    email: '',
    company_name: '',
    address: '',
    phone: '',
    role: 'user', // Valor por defecto
    password: '',
    is_active: 1, // Usuario activo por defecto
  };
  
  showPassword: boolean = true;

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private navCtrl: NavController
  ) {}

  // Guardar usuario
  saveUser() {
    const apiUrl = 'https://muebleriasolaris.com/ionic-users/add_user.php'; // Cambia la URL según tu API

    this.http.post(apiUrl, this.newUser).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.showAlert('Éxito', 'Usuario creado correctamente.');
          window.location.href = '/crear-usuario'; // Esto redirige y recarga la página
        } else {
          this.showAlert('Error', response.message);
        }
      },
      error: (error) => {
        this.showAlert('Error', 'Hubo un problema al crear el usuario.');
        console.error('Error creating user:', error);
      },
    });
  }

  // Validar entrada numérica (para el teléfono)
  validateNumericInput(event: any) {
    const input = event.target.value.replace(/[^0-9]/g, '');
    event.target.value = input.slice(0, 10); // Limita a 10 dígitos
    this.newUser.phone = input;
  }

  // Mostrar alerta
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Capitalizar el nombre
  capitalizeName() {
    if (this.newUser.name) {
      this.newUser.name = this.newUser.name
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

}