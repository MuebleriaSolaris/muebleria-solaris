// src/app/pages/perfil/perfil.page.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface UserProfile {
  name: string;
  username: string;
  email: string;
  company_name: string;
  address: string;
  phone: string;
  role: string;
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  user: UserProfile | null = null; // Initialize as null

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  // Debug role value after user profile is loaded
loadUserProfile() {
  const userId = this.authService.getUserId();
  if (userId) {
    this.http.get<UserProfile>(`https://muebleriasolaris.com/ionic-login/login_usuario.php?id=${userId}`)
      .subscribe(
        (data) => {
          this.user = data;
          console.log('User role:', this.user.role); // Log role for verification
        },
        (error) => {
          console.error('Error fetching user profile:', error);
        }
      );
  } else {
    console.error('User ID is not available');
  }
}
  navigateHome() {
    const role = this.user?.role || this.authService.getRole(); // Use user role or fallback to AuthService role

    if (role === '1') {
      this.router.navigate(['/dashboard']);
    } else if (role === '4') {
      this.router.navigate(['/clientes']);
    } else {
      console.warn('Unrecognized role:', role); // In case of unexpected role
    }
  }
}
