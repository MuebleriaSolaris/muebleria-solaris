import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { AlertController } from '@ionic/angular'; // Importa AlertController

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
    private inventoryService: InventoryService,
    private alertController: AlertController // Inyecta AlertController
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

  // Función para confirmar la actualización del proveedor
  async confirmSaveChanges() {
    const alert = await this.alertController.create({
      header: 'Confirmar Actualización',
      message: '¿Estás seguro de que deseas actualizar este proveedor?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Actualizar',
          handler: () => {
            this.saveChanges(); // Llama a la función saveChanges si el usuario confirma
          },
        },
      ],
    });

    await alert.present();
  }

  // Función para guardar los cambios
  saveChanges() {
    const updatedProvider = {
      id: this.provider.id,
      name: this.provider.name,
    };
  
    this.inventoryService.updateProvider(updatedProvider).subscribe({
      next: (response) => {
        if (response.success) {
          this.showAlert('Éxito', 'Proveedor actualizado correctamente.');
          this.isEditMode = false;
          window.location.href = '/proveedores'; // Esto redirige y recarga la página
        } else {
          this.showAlert('Error', response.message);
        }
      },
      error: (error) => {
        console.error('Error al actualizar el proveedor:', error);
        this.showAlert('Error', 'Ocurrió un error al actualizar el proveedor.');
      },
    });
  }

  // Función para confirmar la eliminación del proveedor
  async confirmDelete() {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar este proveedor?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteProvider(); // Llama a la función deleteProvider si el usuario confirma
          },
        },
      ],
    });

    await alert.present();
  }

  // Función para eliminar el proveedor
  deleteProvider() {
    this.inventoryService.deleteProvider(this.provider.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.showAlert('Éxito', 'Proveedor eliminado correctamente.');
          this.router.navigate(['/proveedores']).then(() => {
            window.location.reload(); // Recarga la página después de la redirección
          });
        } else {
          this.showAlert('Error', 'Error al eliminar el proveedor: ' + response.message);
        }
      },
      error: (error) => {
        console.error('Error al eliminar el proveedor:', error);
        this.showAlert('Error', 'Ocurrió un error al eliminar el proveedor.');
      },
    });
  }

  // Función para mostrar alertas
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
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