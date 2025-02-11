import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service'; // Ajusta la ruta según tu proyecto
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular'; // Importa AlertController

@Component({
  selector: 'app-marcas-productos',
  templateUrl: './marcas-productos.page.html',
  styleUrls: ['./marcas-productos.page.scss'],
})
export class MarcasProductosPage implements OnInit {
  brands: any[] = []; // Lista de marcas

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private alertController: AlertController // Inyecta AlertController
  ) {}

  ngOnInit() {
    this.loadBrands(); // Llama a loadBrands() al iniciar la página
  }

  // Cargar marcas usando el servicio
  loadBrands() {
    this.inventoryService.getBrands().subscribe({
      next: (response) => {
        if (response.success) {
          this.brands = response.data;
        } else {
          console.warn('No se pudieron cargar las marcas.');
        }
      },
      error: (error) => {
        console.error('Error al cargar marcas:', error);
      },
    });
  }

  // Función para eliminar una marca
  async deleteBrand(brandId: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar esta marca?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.inventoryService.deleteBrand(brandId).subscribe({
              next: async (response) => {
                if (response.success) {
                  await this.showAlert('Éxito', 'Marca eliminada correctamente.');
                  this.loadBrands(); // Recargar la lista de marcas
                } else {
                  await this.showAlert('Error', 'No se pudo eliminar la marca.');
                }
              },
              error: async (error) => {
                console.error('Error al eliminar la marca:', error);
                await this.showAlert('Error', 'Ocurrió un error al eliminar la marca.');
              },
            });
          },
        },
      ],
    });

    await alert.present();
  }

  // Función para mostrar alertas
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}