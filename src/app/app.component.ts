// src/app/app.component.ts

import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public menuTitle: string = 'Main Menu';
  public isLoginPage: boolean = false;  // Track if we are on the login page

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Set up dynamic menu title and detect if we are on the login page
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage = event.urlAfterRedirects === '/login';  // Set isLoginPage based on route

        switch (event.urlAfterRedirects) {
          case '/dashboard':
            this.menuTitle = "Panel Principal";
            break;
          case '/clientes':
            this.menuTitle = "Clientes";
            break;
          case '/agregar-clientes':
            this.menuTitle = "Agregar Cliente";
            break;
          case '/inventario':
            this.menuTitle = "Inventario";
            break;
          case '/proveedores':
            this.menuTitle = "Proveedores";
            break;
          case '/perfil':
            this.menuTitle = "Perfil";
            break;
          case '/agregar-inventario':
            this.menuTitle = "Agregar Inventario";
            break;
          case '/agregar-proveedor':
            this.menuTitle = "Agregar Proveedor";
            break;
          case '/crear-usuario':
            this.menuTitle = "Nuevo Usuario";
            break;
          default:
            this.menuTitle = "";  // Default title for other routes
        }
      }
    });
  }
}
