// src/app/components/menu/menu.component.ts

import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  public menuTitle: string = 'Main Menu';
  public role: number | null = null;
  public appPages = [
    { title: 'Clientes', url: '/clientes', icon: 'people', roles: [1, 4] },
    { title: 'Agregar Clientes', url: '/agregar-clientes', icon: 'person-add', roles: [4] },
    { title: 'Inventario', url: '/inventario', icon: 'list', roles: [4] },
    { title: 'Proveedores', url: '/proveedores', icon: 'business', roles: [4] },
    { title: 'Perfil', url: '/perfil', icon: 'person', roles: [1, 4] }
  ];
  public filteredPages: { title: string; url: string; icon: string; roles: number[] }[] = [];
  isAdmin: boolean = false; // Variable to check if user is admin

  constructor(
    public authService: AuthService,
    private router: Router,
    private menuCtrl: MenuController
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin(); // Check if user has admin privileges
    // Subscribe to role$ to reactively set role and update filteredPages
    this.authService.role$.subscribe((roleString) => {
      this.role = roleString ? parseInt(roleString, 10) : null;

      // Filter pages based on the updated role
      if (this.role !== null) {
        this.filteredPages = this.appPages.filter(page => page.roles.includes(this.role as number));
      } else {
        this.filteredPages = [];
      }
    });

    // Update menu title based on current route
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateMenuTitle(event.urlAfterRedirects);
        this.closeMenu(); // Cierra el menú
      }
    });
  }

  updateMenuTitle(route: string) {
    const titles = {
      '/dashboard': 'Panel Principal',
      '/clientes': 'Clientes',
      '/agregar-clientes': 'Agregar Cliente',
      '/inventario': 'Inventario',
      '/proveedores': 'Proveedores',
      '/perfil': 'Perfil'
    };
    this.menuTitle = titles[route as keyof typeof titles] || 'Main Menu';
  }

  closeMenu() {
    this.menuCtrl.close('main-menu');
  }

  logout() {
    this.authService.logout(); // Call the logout function from AuthService
    this.router.navigate(['/']).then(() => {
      window.location.reload(); // Reload the page to reset everything
    });
    this.closeMenu(); // Close the side menu
  }
  

  isCompact = false;

  toggleCompactMode() {
    this.isCompact = !this.isCompact;
  }

  
}
