import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
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
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private alertController: AlertController,
    private navCtrl: NavController
  ) {}

  // Guardar usuario
  async saveUser() {
    // Validar campos obligatorios
    if (
      !this.newUser.name ||
      !this.newUser.username ||
      // !this.newUser.email ||
      !this.newUser.password
    ) {
      await this.showAlert('Error', 'Por favor, completa todos los campos obligatorios.');
      return; // Detiene la ejecución si falta algún campo obligatorio
    }

    // Validar formato de correo electrónico
    // if (!this.validateEmail(this.newUser.email)) {
    //   await this.showAlert('Error', 'Por favor, ingresa un correo electrónico válido.');
    //   return; // Detiene la ejecución si el correo no es válido
    // }

    // Mostrar diálogo de confirmación
    const confirmAlert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas crear este usuario?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Crear',
          handler: () => {
            // Si el usuario confirma, procede a guardar
            this.createUser();
          },
        },
      ],
    });

    await confirmAlert.present();
  }

  // Crear usuario (lógica de guardado)
  createUser() {
    const apiUrl = 'https://muebleriasolaris.com/ionic-users/add_user.php'; // Cambia la URL según tu API

    this.http.post(apiUrl, this.newUser).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.showAlert('Éxito', 'Usuario creado correctamente.');
          this.router.navigate(['/usuarios-sistema']).then(() => {
            window.location.reload(); // Recarga la página después de la redirección
          });
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

  // Validar formato de correo electrónico
  validateEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
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

  // Alternar visibilidad de la contraseña
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  hasValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }
}