import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCustomers(); // Cargar todos los clientes al iniciar
  }

  // Cargar clientes con o sin filtro de búsqueda
  loadCustomers(searchTerm: string = '') {
    let apiUrl = 'http://localhost/ionic-users/clientes.php';
    
    // Cambia el endpoint si hay un término de búsqueda
    if (searchTerm) {
      apiUrl = 'http://localhost/ionic-users/clientes_search.php';
    }

    // Configura los parámetros de la consulta (si se está usando un término de búsqueda)
    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    // Realiza la solicitud HTTP con el término de búsqueda si corresponde
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
    this.loadCustomers(this.searchTerm); // Llamar a la API de búsqueda con el término de búsqueda
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
      case 1:
        return 'Bueno';
      case 2:
        return 'Regular';
      case 0:
        return 'Malo';
      default:
        return 'Desconocido';
    }
  }
  
  getCustomerTypeClass(type: any): string {
    const customerType = parseInt(type, 10);
    switch (customerType) {
      case 1:
        return 'success';
      case 2:
        return 'warning';
      case 0:
        return 'danger';
      default:
        return 'medium';
    }
  }
  
  
}
