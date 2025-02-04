import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service'; // Ajusta la ruta según tu proyecto
import { Router } from '@angular/router';

@Component({
  selector: 'app-proveedores',
  templateUrl: './proveedores.page.html',
  styleUrls: ['./proveedores.page.scss'],
})
export class ProveedoresPage implements OnInit {
  providers: any[] = []; // Lista de proveedores

  constructor(private inventoryService: InventoryService, private router: Router) {}

  ngOnInit() {
    this.loadProviders();
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

  // Redirigir a la página de detalles del proveedor
  viewProviderDetails(id: number) {
    this.router.navigate(['/proveedores-info', id]);
  }
  
}
