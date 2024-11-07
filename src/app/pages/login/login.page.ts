import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service'; // Import AuthService

export interface LoginResponse {
  status: string;
  message: string;
  userId: string;
  role?: string; // Optional role property, updated to string to match potential database varchar
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  username: string = ''; // Initialize to an empty string
  password: string = ''; // Initialize to an empty string
  segment: string = 'existing'; // Add this property for the ion-segment
  showPassword: boolean = false; // Property to control password visibility

  constructor(
    private http: HttpClient,
    private router: Router,
    private navCtrl: NavController,
    private authService: AuthService // Inject AuthService
  ) {}

  login() {
    const userCredentials = {
      username: this.username,
      password: this.password,
    };
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    
    this.http.post<LoginResponse>('http://localhost/ionic-login/login.php', userCredentials, httpOptions)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            console.log('Login successful:', response.message);
            
            // Check if role is defined and set it in AuthService
            if (response.role) {
              this.authService.setRole(response.role);
            }
            if (response.userId) {
              this.authService.setUserId(response.userId); // Set the userId here
              console.log('Stored userId:', this.authService.getUserId()); // Log userId to verify storage
              console.log('Stored role:', this.authService.getRole()); // Log userId to verify storage
            } else {
              console.error('User ID is missing in response');
            }
             // Redirect based on user role
            if (this.authService.getRole() === '1'){
                // Redirect to dashboard when is admin
                this.navCtrl.navigateRoot('/dashboard');
            }else if(this.authService.getRole() === '4'){
                // Redirect to clientes when is seller
                this.navCtrl.navigateRoot('/clientes');
            }
            
          } else {
            // Handle failed login attempt
            console.warn('Login failed:', response.message);
            alert('Login failed: ' + response.message);
          }
        },
        error: (error) => {
          console.error('An error occurred:', error);
          alert('An error occurred. Please try again.');
        }
      });
      
  }
  // Method to toggle password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
