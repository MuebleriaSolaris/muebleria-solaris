import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';

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

  constructor(private route: ActivatedRoute, private inventoryService: InventoryService) {}

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

  saveChanges() {
    if (!this.product || !this.product.product_id) {
      console.error('El producto no tiene un ID válido.');
      return;
    }
  
    this.inventoryService.saveProduct(this.product).subscribe({
      next: (response: any) => {
        if (response.success) {
          alert('Producto actualizado correctamente.');
          this.originalProduct = { ...this.product }; // Actualiza la copia original
          this.isEditMode = false; // Sale del modo de edición
        } else {
          alert('Error al actualizar el producto: ' + response.message);
        }
      },
      error: (error) => {
        console.error('Error al actualizar el producto:', error);
        alert('Ocurrió un error al actualizar el producto.');
      }
    });
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
  
    // Reemplaza caracteres no numéricos
    input = input.replace(/[^0-9]/g, '');
  
    // Opcional: Limita a un máximo de 5 dígitos (ajusta según tus necesidades)
    if (input.length > 5) {
      input = input.slice(0, 5);
    }
  
    // Actualiza el valor en el campo y el modelo
    event.target.value = input;
    this.product!.current_stock = input; // Sincroniza con el modelo
  }
  
  validateCreditPriceInput(event: any) {
    let input = event.target.value;
  
    // Reemplaza cualquier carácter que no sea un número o un punto decimal
    input = input.replace(/[^0-9.]/g, '');
  
    // Evita más de un punto decimal
    const decimalParts = input.split('.');
    if (decimalParts.length > 2) {
      input = decimalParts[0] + '.' + decimalParts[1]; // Permite solo la primera parte decimal
    }
  
    // Opcional: Limitar a dos decimales
    if (decimalParts[1]?.length > 2) {
      input = decimalParts[0] + '.' + decimalParts[1].substring(0, 2);
    }
  
    // Actualiza el valor en el campo y el modelo
    event.target.value = input;
    this.product!.credit_price = input; // Sincroniza con el modelo
  }
  
}
