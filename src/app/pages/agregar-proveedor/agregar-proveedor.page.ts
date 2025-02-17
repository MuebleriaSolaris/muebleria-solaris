import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular'; // Importa AlertController
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

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private alertController: AlertController // Inyecta AlertController
  ) {}

  ngOnInit() {
    const currentDate = new Date().toISOString();
    this.newProvider.created_at = currentDate;
    this.newProvider.updated_at = currentDate;
  }

  async saveProvider() {
    // Verifica si el campo "name" está vacío
    if (!this.newProvider.name || this.newProvider.name.trim() === '') {
      await this.showAlert('Error', 'El nombre del proveedor no puede estar vacío.');
      return; // Detiene la ejecución si el campo está vacío
    }

    // Muestra un diálogo de confirmación
    const confirmAlert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas guardar este proveedor?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: () => {
            // Si el usuario confirma, guarda el proveedor
            this.inventoryService.saveProvider(this.newProvider).subscribe({
              next: (response) => {
                if (response.success) {
                  console.log('Proveedor guardado exitosamente:', response);
                  this.router.navigate(['/proveedores']); // Redirige a la lista de proveedores
                } else {
                  console.warn('Error al guardar el proveedor:', response.message);
                  this.showAlert('Error', 'No se pudo guardar el proveedor.');
                }
              },
              error: (err) => {
                console.error('Error al guardar el proveedor:', err);
                this.showAlert('Error', 'Ocurrió un error al guardar el proveedor.');
              },
            });
          },
        },
      ],
    });

    await confirmAlert.present();
  }

  // Método para mostrar alertas
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}