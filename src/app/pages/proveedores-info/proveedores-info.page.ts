import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-proveedores-info',
  templateUrl: './proveedores-info.page.html',
  styleUrls: ['./proveedores-info.page.scss'],
})
export class ProveedoresInfoPage implements OnInit {
  providerInfo: any = {}; // Información del proveedor
  isEditMode: boolean = false; // Estado de edición
  provider: any; // Almacena la información del proveedor
  providerId!: string; // Para almacenar el id recibido de la URL

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService
  ) {}

  ngOnInit() {
    // Obtener el ID del proveedor desde la URL
    this.providerId = this.route.snapshot.paramMap.get('id') || ''; // Si no hay id, usa una cadena vacía
    console.log('ID del proveedor obtenido:', this.providerId); // Log para verificar el ID

    if (this.providerId) {
      this.loadProviderInfo(this.providerId); // Cargar información del proveedor
    } else {
      console.warn('No se recibió ningún ID en la URL.');
    }
  }

   // Método para cargar la información del proveedor desde el servicio
   loadProviderInfo(id: string) {
    this.inventoryService.getProviders().subscribe({
      next: (response) => {
        if (response.success) {
          // Filtrar el proveedor por ID
          const filteredProvider = response.data.find((provider: any) => provider.id === parseInt(id, 10));
          
          if (filteredProvider) {
            this.provider = filteredProvider;
            console.log('Información del proveedor:', this.provider); // Verificar los datos filtrados
          } else {
            console.warn('No se encontró el proveedor con el ID:', id);
          }
        } else {
          console.warn('No se pudo cargar la lista de proveedores.');
        }
      },
      error: (error) => {
        console.error('Error al cargar la lista de proveedores:', error);
      },
    });
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  saveChanges() {
    console.log('Guardando cambios:', this.provider);
    // Lógica para guardar cambios en el backend
    this.isEditMode = false;
  }

  cancelEdit() {
    console.log('Cancelando edición');
    this.isEditMode = false;
    this.loadProviderInfo(this.provider.id); // Recargar datos originales
  }

  goBack() {
    this.router.navigate(['/proveedores']);
  }
}
