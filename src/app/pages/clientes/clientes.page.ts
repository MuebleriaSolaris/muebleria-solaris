// src/app/pages/clientes/clientes.page.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../../services/auth.service'; // Import AuthService
import { Router } from '@angular/router';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
})
export class ClientesPage implements OnInit {
  customers: any[] = []; // Clientes recibidos desde la API
  paginatedCustomers: any[] = []; // Clientes paginados para la página actual
  itemsPerPage = 10; // Número de elementos por página
  currentPage = 1; // Página actual
  searchTerm: string = ''; // Término de búsqueda actual
  isAdmin: boolean = false; // Variable to check if user is admin
 
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCustomers();
    this.isAdmin = this.authService.isAdmin(); // Check if user has admin privileges
  }

  // Cargar clientes con o sin filtro de búsqueda
  loadCustomers(searchTerm: string = '') {
    let apiUrl = 'https://muebleriasolaris.com/ionic-users/clientes.php';
    
    if (searchTerm) {
      apiUrl = 'https://muebleriasolaris.com/ionic-users/clientes_search.php';
    }

    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    this.http.get<any>(apiUrl, { params })
      .subscribe(
        response => {
          if (response && response.data) {
            this.customers = response.data;
            this.currentPage = 1; // Reiniciar a la primera página
            this.paginateCustomers(); // Paginamos los datos después de cargarlos
          } else {
            console.error("Error en la respuesta de la API:", response);
          }
        },
        error => {
          console.error("Error al cargar clientes:", error);
        }
      );
  }

  // Método para manejar la entrada de búsqueda
  onSearchInput() {
    this.loadCustomers(this.searchTerm);
  }

  // Método para paginar los clientes
  paginateCustomers() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = this.currentPage * this.itemsPerPage;
    this.paginatedCustomers = this.customers.slice(start, end);
  }

  nextPage() {
    if ((this.currentPage * this.itemsPerPage) < this.customers.length) {
      this.currentPage++;
      this.paginateCustomers();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateCustomers();
    }
  }

  // Método para obtener el color del tipo de cliente
  getCustomerTypeName(type: any): string {
    const customerType = parseInt(type, 10);
    switch (customerType) {
      case 2:
        return 'Malo';
      case 1:
        return 'Regular';
      case 0:
        return 'Bueno';
      default:
        return 'Desconocido';
    }
  }
  // Método para obtener el color del tipo de cliente
  getCustomerTypeClass(type: any): string {
    const customerType = parseInt(type, 10);
    switch (customerType) {
      case 0:
        return 'success';
      case 1:
        return 'warning';
      case 2:
        return 'danger';
      default:
        return 'medium';
    }
  }

  // Función para ver los detalles del cliente
  viewCustomerDetails(customerId: number) {
    if (this.isAdmin) {
      this.router.navigate(['/cliente-info', customerId]); // Navega a la página con el ID del cliente
    }else {
      console.warn('Access denied. Only admins can view customer details.');
    }
  }

  // Método para redirigir a la página de agregar clientes
  goToAddClient() {
    this.router.navigate(['/agregar-clientes']); // Cambia la ruta según tu configuración
  }
}
