import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService, LoginResponse } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  @ViewChild('usernameInput') usernameInput!: ElementRef<HTMLInputElement>;
  username: string = ''; // Initialize to an empty string
  password: string = ''; // Initialize to an empty string
  showPassword: boolean = false; // Property to control password visibility

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private authService: AuthService, // Use AuthService for authentication
    private toastController: ToastController // ToastController for error messages
  ) {}

  ngOnInit() {
    // Automatically focus the username field when the page initializes
    setTimeout(() => {
      this.usernameInput.nativeElement.focus();
    }, 100); // Delay to ensure the input is rendered

    // Check if the user is already logged in
    const role = this.authService.getRole();
    const userId = this.authService.getUserId();

    if (role && userId) {
      // Redirect based on the role
      if (role === '4') {
        this.navCtrl.navigateRoot('/clientes'); // Vendedor
      } else if (role === '1') {
        this.navCtrl.navigateRoot('/dashboard'); // Admin
      }
    }
  }

  // Método para mostrar mensajes de error
  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000, // Duración de 3 segundos
      position: 'bottom', // Posición del toast
      color: 'danger', // Color del toast (rojo para errores)
    });
    toast.present();
  }

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: (response: LoginResponse) => {
        if (response.status === 'success') {
          console.log('Login successful:', response.message);

          // Store session data
          if (response.userId) {
            this.authService.setUserId(response.userId);
          }
          if (response.role) {
            this.authService.setRole(response.role);
          }

          // Redirect based on user role
          const role = this.authService.getRole();
          if (role === '1') {
            this.navCtrl.navigateRoot('/dashboard'); // Admin
          } else if (role === '4') {
            this.navCtrl.navigateRoot('/clientes'); // Seller
          }
        } else {
          console.warn('Login failed:', response.message);
          this.showErrorToast('Login failed: ' + response.message); // Mostrar mensaje de error
        }
      },
      error: (error) => {
        console.error('An error occurred:', error);
        this.showErrorToast('An error occurred. Please try again.'); // Mostrar mensaje de error
      },
    });
  }

  // Method to toggle password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}