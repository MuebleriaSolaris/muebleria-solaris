import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';
import { NavController, AlertController, ToastController } from '@ionic/angular'; // Importa AlertController y ToastController
import { Router } from '@angular/router'; // Importa Router

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

  isSaving: boolean = false; // Variable para controlar el estado de guardado

  constructor(
    private inventoryService: InventoryService,
    private alertController: AlertController, // Inyecta AlertController
    private router: Router, // Inyecta Router
    private toastController: ToastController // Inyecta ToastController
  ) {}

  ngOnInit() {}

  // Método para guardar la marca
  async saveBrand() {
    // Validar nombre
    if (!this.newBrand.name?.trim()) {
      await this.showAlert('Error', 'El nombre de la Marca no puede estar vacío.');
      return;
    }

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
            this.isSaving = true; // Mostrar spinner
            
            this.inventoryService.saveBrand(this.newBrand).subscribe({
              next: async (response) => {
                this.isSaving = false;
                
                if (response.success) {
                  await this.showToast(
                    `Marca: ${this.newBrand.name}! | Agregada con éxito!`,
                    'success'
                  );
                  await this.showAlert('Éxito', response.message);
                  this.router.navigate(['/marcas-productos']).then(() => {
                    window.location.reload();
                  });
                } else {
                  await this.showAlert('Error', response.message);
                }
              },
              error: async (error) => {
                this.isSaving = false;
                console.error('Error:', error);
                await this.showAlert('Error', error.message || 'Error al guardar la marca');
              }
            });
          },
        },
      ],
    });

    await confirmAlert.present();
  }

  private async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    
    await alert.present();
    await alert.onDidDismiss();
  }

  private async showToast(message: string, color: string = 'danger') {
      const toast = await this.toastController.create({
          message,
          duration: 3000,
          color,
          position: 'top',
          cssClass: 'white-toast' // Agrega esta clase
      });
      await toast.present();
  }

  hasValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }
}
