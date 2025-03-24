import { Component, OnInit, HostListener } from '@angular/core';
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
  currentRoute: string = ''; // Variable to store the current route

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

    // Update menu title and current route based on navigation
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateMenuTitle(event.urlAfterRedirects);
        this.currentRoute = event.urlAfterRedirects; // Update current route
        this.closeMenu(); // Cierra el menú
      }
    });

    // Agregar el manejador de eventos para cerrar el menú al hacer clic fuera
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy() {
    // Eliminar el manejador de eventos al destruir el componente
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  handleClickOutside(event: MouseEvent) {
    const menuElement = document.querySelector('ion-menu');
    const targetElement = event.target as HTMLElement;

    // Verificar si el clic fue fuera del menú
    if (menuElement && !menuElement.contains(targetElement)) {
      this.closeMenu();
    }
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

  // Método para verificar si la ruta está activa
  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  // Método para navegar o recargar la página
  navigateOrReload(route: string) {
    if (this.currentRoute === route) {
      // Si ya está en la misma ruta, recargar la página
      window.location.reload();
    } else {
      // Si no, navegar a la nueva ruta
      this.router.navigate([route]);
    }
  }
}