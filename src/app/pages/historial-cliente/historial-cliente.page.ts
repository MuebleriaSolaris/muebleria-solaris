import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-historial-cliente',
  templateUrl: './historial-cliente.page.html',
  styleUrls: ['./historial-cliente.page.scss'],
})
export class HistorialClientePage implements OnInit {
  customerHistory: any[] = [];
  customerId!: number;
  isMobile: boolean = window.innerWidth < 577; // Detectar si es móvil

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 577; // Actualizar en caso de redimensionar
  }

  ngOnInit() {
    // Obtener el ID del cliente desde la URL
    this.customerId = Number(this.route.snapshot.paramMap.get('id'));

    // Cargar el historial del cliente
    this.loadCustomerHistory(this.customerId);
  }

  loadCustomerHistory(id: number) {
    const url = `https://muebleriasolaris.com/ionic-users/customer-changes.php?id=${id}`;
    console.log('Historial del cliente con id:', id);
  
    this.http.get<{ success: boolean; data: any[] }>(url).subscribe({
      next: (response) => {
        if (response.success) {
          this.customerHistory = response.data; // Asigna los datos al arreglo customerHistory
          console.log('Historial del cliente cargado correctamente:', this.customerHistory);
        } else {
          console.warn('No se pudo cargar el historial del cliente.');
        }
      },
      error: (error) => {
        console.error('Error al cargar el historial del cliente:', error);
      },
    });
  }

  // Método para regresar a la página anterior
  goBack() {
    this.router.navigate([`/cliente-info/${this.customerId}`]); // Redirige al cliente con el ID almacenado en customerId
  }  
  
}
