// src/app/app.component.ts

import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthService } from './services/auth.service';
import { InfoClienteService } from './services/info-cliente.service'; // Servicio para obtener clientes
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public menuTitle: string = 'Main Menu';
  public isLoginPage: boolean = false;  // Track if we are on the login page

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private infoClienteService: InfoClienteService // Servicio agregado
  ) {}

  ngOnInit() {
    // Set up dynamic menu title and detect if we are on the login page
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.isLoginPage = event.urlAfterRedirects === '/login';  // Set isLoginPage based on route

          // Detect route and update menu title
          this.updateMenuTitle(event.urlAfterRedirects);
        }
      });
  }

  private updateMenuTitle(url: string) {
    switch (true) {
      case url === '/dashboard':
        this.menuTitle = "Panel Principal";
        break;
      case url === '/clientes':
        this.menuTitle = "Clientes";
        break;
      case url === '/agregar-clientes':
        this.menuTitle = "Agregar Cliente";
        break;
      case url === '/inventario':
        this.menuTitle = "Inventario";
        break;
      case url === '/proveedores':
        this.menuTitle = "Proveedores";
        break;
      case url === '/perfil':
        this.menuTitle = "Perfil";
        break;
      case url === '/agregar-inventario':
        this.menuTitle = "Agregar Inventario";
        break;
      case url === '/agregar-proveedor':
        this.menuTitle = "Agregar Proveedor";
        break;
      case url === '/crear-usuario':
        this.menuTitle = "Nuevo Usuario";
        break;
      case url.startsWith('/cliente-info/'):
        this.setClienteTitle(); // Llama al método para manejar títulos de cliente
        break;
      default:
        this.menuTitle = "";  // Default title for other routes
    }
  }

  private setClienteTitle() {
    const customerId = this.activatedRoute.snapshot.paramMap.get('id');
    if (customerId) {
      this.infoClienteService.getCustomerById(customerId).subscribe(
        (customer) => {
          // this.menuTitle = `Cliente | ${customer.name}`;
          this.menuTitle = `Cliente Info`;
          console.log(`cliente: ${customer.name}`);
        },
        (error) => {
          console.error('Error al obtener cliente:', error);
          this.menuTitle = 'Información del cliente'; // Valor predeterminado en caso de error
        }
      );
    } else {
      this.menuTitle = 'Cliente Info';
    }
  }
}
