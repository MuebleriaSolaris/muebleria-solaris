// src/app/pages/clientes/clientes.page.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../../services/auth.service'; // Import AuthService
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';

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
  selectedCustomerId: number | null = null; // ID del cliente seleccionado
  totalCount: number = 0; // Número total de clientes
  showingCount: number = 0; // Número de clientes mostrados 
  loading: boolean = false; // Variable para mostrar el spinner de carga

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
  loadCustomers(page: number = 1) {
    this.loading = true;
    this.currentPage = page;
    
    let apiUrl = 'https://muebleriasolaris.com/ionic-users/clientes.php';
    let params = new HttpParams().set('page', page.toString());

    if (this.searchTerm.trim()) {
      apiUrl = 'https://muebleriasolaris.com/ionic-users/clientes_search.php';
      params = params.set('search', this.searchTerm.trim());
    }

    this.http.get<any>(apiUrl, { params }).subscribe(
      response => {
        this.customers = response.data || [];
        this.totalCount = response.total || 0;
        this.loading = false;
      },
      error => {
        console.error("Error al cargar clientes:", error);
        this.loading = false;
      }
    );
  }
  
  selectCustomer(customerId: number) {
    if (this.selectedCustomerId === customerId) {
      this.selectedCustomerId = null; // Deseleccionar si ya está seleccionado
    } else {
      this.selectedCustomerId = customerId;
    }
  }
  
  // Método para manejar la entrada de búsqueda
  onSearchInput() {
    this.loadCustomers(1); // Recargar clientes con el término de búsqueda actual);
  }

  // Método para paginar los clientes
  paginateCustomers() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = this.currentPage * this.itemsPerPage;
    this.paginatedCustomers = this.customers.slice(start, end);
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.totalCount) {
      this.loadCustomers(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.loadCustomers(this.currentPage - 1);
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
  viewCustomerDetails(customerId: number, slidingItem?: IonItemSliding) {
    if (this.isAdmin) {
      this.selectedCustomerId = customerId; // Marcar como seleccionado
      if (slidingItem) {
        slidingItem.close();
      }
      this.router.navigate(['/cliente-info', customerId]);
    } else {
      console.warn('Access denied. Only admins can view customer details.');
    }
  }

  // Método para redirigir a la página de agregar clientes
  goToAddClient() {
    this.router.navigate(['/agregar-clientes']); // Cambia la ruta según tu configuración
  }

  //  Método para eliminar un cliente
  getShowingRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalCount);
    return `${start}-${end}`;
  }

  // Método para formatear números
  formatNumber(value: number): string {
    return value.toLocaleString('es-MX');
  }
  
}
