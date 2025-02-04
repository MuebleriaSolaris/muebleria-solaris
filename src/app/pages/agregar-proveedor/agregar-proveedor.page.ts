import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-agregar-proveedor',
  templateUrl: './agregar-proveedor.page.html',
  styleUrls: ['./agregar-proveedor.page.scss'],
})
export class AgregarProveedorPage implements OnInit {
  newProvider: any = {
    name: '',
    created_at: '',
    updated_at: '',
  };

  constructor(private inventoryService: InventoryService, private router: Router) {}

  ngOnInit() {
    const currentDate = new Date().toISOString();
    this.newProvider.created_at = currentDate;
    this.newProvider.updated_at = currentDate;
  }

  saveProvider() {
    console.log('Guardando proveedor:', this.newProvider);
    this.inventoryService.saveProvider(this.newProvider).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Proveedor guardado exitosamente:', response);
          this.router.navigate(['/proveedores']); // Redirige a la lista de proveedores
        } else {
          console.warn('Error al guardar el proveedor:', response.message);
        }
      },
      error: (err) => {
        console.error('Error al guardar el proveedor:', err);
      },
    });
  }
}
