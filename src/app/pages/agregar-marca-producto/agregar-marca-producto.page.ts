import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';
import { NavController, AlertController } from '@ionic/angular'; // Importa AlertController

@Component({
  selector: 'app-agregar-marca-producto',
  templateUrl: './agregar-marca-producto.page.html',
  styleUrls: ['./agregar-marca-producto.page.scss'],
})
export class AgregarMarcaProductoPage implements OnInit {
  newBrand: any = {
    name: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  constructor(
    private inventoryService: InventoryService,
    private navCtrl: NavController,
    private alertController: AlertController // Inyecta AlertController
  ) {}

  ngOnInit() {}

  // Método para guardar la marca
  async saveBrand() {
    // Verifica si el campo "name" está vacío
    if (!this.newBrand.name || this.newBrand.name.trim() === '') {
      await this.showAlert('Error', 'El nombre de la Marca no puede estar vacío.');
      return; // Detiene la ejecución si el campo está vacío
    }

    // Mostrar confirmación antes de guardar
    const confirmAlert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas guardar esta marca?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: () => {
            this.inventoryService.saveBrand(this.newBrand).subscribe({
              next: async (response) => {
                console.log('API Response:', response);
                await this.showAlert('Éxito', 'Marca guardada correctamente.');
                this.navCtrl.navigateBack('/marcas-productos');
              },
              error: async (error) => {
                console.error('API Error:', error);
                await this.showAlert('Error', 'Ocurrió un error al guardar la marca.');
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

  hasValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }
}
