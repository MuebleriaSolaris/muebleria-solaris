import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-agregar-subcategoria',
  templateUrl: './agregar-subcategoria.page.html',
  styleUrls: ['./agregar-subcategoria.page.scss'],
})
export class AgregarSubcategoriaPage implements OnInit {
  newSubcategory: any = {
    name: '',
    category_id: '', // Añade el ID de la categoría padre si es necesario
    created_at: '',
    updated_at: '',
  };

  categories: any[] = []; // Lista de categorías disponibles

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    const currentDate = new Date().toISOString();
    this.newSubcategory.created_at = currentDate;
    this.newSubcategory.updated_at = currentDate;
  }

  async saveSubcategory() {
    if (!this.newSubcategory.name || this.newSubcategory.name === '') {
      await this.showAlert('Error', 'El nombre de la subcategoría no puede estar vacío.');
      return;
    }

    const confirmAlert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas guardar esta subcategoría?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: () => {
            this.inventoryService.saveSubcategory(this.newSubcategory).subscribe({
              next: (response) => {
                if (response.success) {
                    // Emitir evento para actualización
                    this.router.navigate(['/categorias']).then(() => {
                      window.location.reload();
                      this.showAlert('Éxito', 'Subcategoría guardada correctamente');
                  }); 
                } else {
                  console.warn('Error al guardar la subcategoría:', response.message);
                  this.showAlert('Error', 'No se pudo guardar la subcategoría.');
                }
              },
              error: (err) => {
                console.error('Error al guardar la subcategoría:', err);
                this.showAlert('Error', 'Ocurrió un error al guardar la subcategoría.');
              },
            });
          },
        },
      ],
    });

    await confirmAlert.present();
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}