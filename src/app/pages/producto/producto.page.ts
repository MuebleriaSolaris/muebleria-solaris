import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { AlertController } from '@ionic/angular'; // Importa AlertController

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
})
export class ProductoPage implements OnInit {
  product: any; // Producto actual que se edita
  originalProduct: any; // Copia del producto original
  providers: any[] = []; // Lista de proveedores
  isEditMode: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private inventoryService: InventoryService,
    private alertController: AlertController // Inyecta AlertController
  ) {}

  ngOnInit() {
    const productId = +this.route.snapshot.paramMap.get('id')!;
    this.fetchProduct(productId);
    this.fetchProviders();
  }

  fetchProduct(productId: number) {
    this.inventoryService.getProducts().subscribe(
      (response) => {
        if (response.success) {
          this.product = response.data.find((item: any) => item.product_id === productId);
          this.originalProduct = { ...this.product }; // Guarda una copia del producto original
        }
      },
      (error) => {
        console.error('Error al obtener el producto:', error);
      }
    );
  }

  fetchProviders() {
    this.inventoryService.getProviders().subscribe(
      (response) => {
        if (response.success) {
          this.providers = response.data;
        }
      },
      (error) => {
        console.error('Error al obtener los proveedores:', error);
      }
    );
  }

  toggleEditMode() {
    if (!this.isEditMode) {
      // Al entrar en modo edición, actualiza el campo updated_at
      this.product.updated_at = new Date().toLocaleString();
    } else {
      // Al salir del modo edición sin guardar, restaura los valores originales
      this.product = { ...this.originalProduct };
    }
    this.isEditMode = !this.isEditMode;
  }

  // Función para confirmar la actualización del producto
  async confirmSaveChanges() {
    const alert = await this.alertController.create({
      header: 'Confirmar Actualización',
      message: '¿Estás seguro de que deseas actualizar este producto?',
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
    if (!this.product || !this.product.product_id) {
      console.error('El producto no tiene un ID válido.');
      return;
    }

    this.inventoryService.saveProduct(this.product).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.showAlert('Éxito', 'Producto actualizado correctamente.');
          this.originalProduct = { ...this.product }; // Actualiza la copia original
          this.isEditMode = false; // Sale del modo de edición
          window.location.href = '/inventario'; // Esto redirige y recarga la página
        } else {
          this.showAlert('Error', 'Error al actualizar el producto: ' + response.message);
        }
      },
      error: (error) => {
        console.error('Error al actualizar el producto:', error);
        this.showAlert('Error', 'Ocurrió un error al actualizar el producto.');
      },
    });
  }

  // Función para confirmar la eliminación del producto
  async confirmDelete() {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar este producto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteProduct(); // Llama a la función deleteProduct si el usuario confirma
          },
        },
      ],
    });

    await alert.present();
  }

  // Función para eliminar el producto
  deleteProduct() {
    if (!this.product || !this.product.product_id) {
      console.error('El producto no tiene un ID válido.');
      return;
    }

    this.inventoryService.deleteProduct(this.product.product_id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.showAlert('Éxito', 'Producto eliminado correctamente.');
          this.goBack(); // Redirige a la página anterior
        } else {
          this.showAlert('Error', 'Error al eliminar el producto: ' + response.message);
        }
      },
      error: (error) => {
        console.error('Error al eliminar el producto:', error);
        this.showAlert('Error', 'Ocurrió un error al eliminar el producto.');
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
    this.product = { ...this.originalProduct }; // Restaura los valores originales
    this.isEditMode = false;
  }

  goBack() {
    window.history.back();
  }

  validateStockInput(event: any) {
    let input = event.target.value;
    input = input.replace(/[^0-9]/g, '');
    if (input.length > 5) {
      input = input.slice(0, 5);
    }
    event.target.value = input;
    this.product!.current_stock = input;
  }

  validateCreditPriceInput(event: any) {
    let input = event.target.value;
    input = input.replace(/[^0-9.]/g, '');
    const decimalParts = input.split('.');
    if (decimalParts.length > 2) {
      input = decimalParts[0] + '.' + decimalParts[1];
    }
    if (decimalParts[1]?.length > 2) {
      input = decimalParts[0] + '.' + decimalParts[1].substring(0, 2);
    }
    event.target.value = input;
    this.product!.credit_price = input;
  }
}