import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pedidos-info',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit {
  providerId: number | null = null; // ID del proveedor
  providerProducts: any[] = []; // Lista de productos del proveedor
  providerName: string = ''; // Nombre del proveedor (opcional para visualización)
  providers: any[] = []; // Lista de proveedores

  constructor(
    private route: ActivatedRoute,
    private inventoryService: InventoryService, // Usar el servicio para la consulta,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProviders();
    // Obtener el ID del proveedor desde la URL
    this.providerId = Number(this.route.snapshot.paramMap.get('id'));
    // console.log('Proveedor ID:', this.providerId);

    // // Validar que el ID exista antes de cargar los datos
    // if (this.providerId) {
    //   this.loadProviderProducts(); 
    // } else {
    //   console.error('No se pudo obtener el ID del proveedor.');
    // }
  }

  // Cargar proveedores usando el servicio
  loadProviders() {
    this.inventoryService.getProviders().subscribe({
      next: (response) => {
        if (response.success) {
          this.providers = response.data;
        } else {
          console.warn('No se pudieron cargar los proveedores.');
        }
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
      },
    });
  }
  viewOrderList(providerId: number) {
    this.router.navigate(['/lista-pedido', providerId]);
  }

}
