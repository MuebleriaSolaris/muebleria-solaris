import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { AuthService } from '../../services/auth.service';
import { IonItemSliding } from '@ionic/angular';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
})
export class InventarioPage implements OnInit {
  products: any[] = []; // Lista completa de productos
  filteredProducts: any[] = []; // Lista filtrada
  searchTerm: string = ''; // Término de búsqueda
  isAdmin: boolean = false; // Variable to check if user is admin

  constructor(private inventoryService: InventoryService, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin(); // Verificar si es administrador
    this.fetchProducts(); // Cargar productos
  }
  

  fetchProducts() {
    this.inventoryService.getProducts(this.searchTerm).subscribe(
      (response) => {
        if (response.success) {
          this.products = response.data; // Carga los datos originales
          this.filteredProducts = this.products; // Inicializa la lista filtrada
          // Inicializa los productos una vez cargados
          this.products.forEach((product: any) => this.initializeProducts(product));
        }
      },
      (error) => {
        console.error('Error al obtener productos:', error);
      }
    );
  }

  onSearchChange(event: any) {
    const value = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(
      (product) =>
        product.product_name.toLowerCase().includes(value) ||
        product.provider_name.toLowerCase().includes(value) ||
        product.product_id.toString().includes(value)
    );
  }

  viewProduct(productId: number) {
    // Navega a la página del producto con el ID
    this.router.navigate(['/producto', productId]);
  }

  increaseCount(product: any) {
    if (product.current_count < product.max_amount){
      console.log("Se incrementa valor de: ", product.current_count);
      this.inventoryService.syncStock(product.product_id); // Asegurar valores actualizados
      product.current_count = product.current_count ? product.current_count + 1 : product.current_stock + 1;
      console.log("Se incrementa valor a: ", product.current_count);
      console.log("Valor Stock: ", product.current_stock);
    }else {
      console.warn(`No se puede incrementar, valor máximo alcanzado (${product.max_amount})`);
      // Opcional: Agrega un mensaje visual para el usuario
      alert(`Has alcanzado el stock máximo permitido: ${product.max_amount}`);
    }
    
  }
  
  decreaseCount(product: any) {
    this.inventoryService.syncStock(product.product_id); // Asegurar valores actualizados
    
    if (product.current_count > 0) {
      console.log("Se decrementa valor de: ", product.current_count);
      product.current_count--;
      console.log("Se decrementa valor de: ", product.current_count);
      console.log("Valor Stock: ", product.current_stock);
    }
  }
  
  
  confirmAction(product: any) {
    const adjustment = product.current_count - product.current_stock;

    if (adjustment === 0) {
      console.log('Sin cambios en el stock.');
      return;
    }

    this.inventoryService.updateInventory(product.product_id, adjustment).subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log('Stock actualizado correctamente:', response.new_stock);
          product.current_stock = response.new_stock; // Actualiza el stock localmente
          product.current_count = response.new_stock; // Reinicia el contador
        } else {
          console.warn('Error al actualizar el stock:', response.message);
        }
      },
      error: (error) => {
        console.error('Error al realizar la solicitud:', error);
      },
    });
  }
  
  getButtonColor(product: any): string {
    if (product.current_count > product.current_stock) {
      return 'success'; // Verde si incrementa
    } else if (product.current_count < product.current_stock) {
      return 'danger'; // Rojo si decrementa
    } else {
      return 'medium'; // Neutro si es igual
    }
  }
  
  getDynamicText(product: any): string {
    if (product.current_count > product.current_stock) {
      return 'Agregar a Stock'; // Texto para incremento
    } else if (product.current_count < product.current_stock) {
      return 'Venta'; // Texto para decremento
    } else if(product.current_count === product.current_stock){
      return 'Stock Disponible';
    }else{
      return 'None';
    }
  }
  // Método que inicializa los valores de los productos
  initializeProducts(product: any) {
    if (typeof product.current_stock !== 'undefined') {
      product.current_count = product.current_stock;
      console.log("stock:", product.current_stock);
      console.log("count:", product.current_count);
    } else {
      console.warn('current_stock no está definido para el producto:', product);
      product.current_count = 0; // Valor predeterminado en caso de no estar definido
    }
  }
  
  onDrag(slidingItem: IonItemSliding) {
    // Cierra el elemento si no hay interacción completa
    setTimeout(() => {
      slidingItem.close();
    }, 300); // Ajusta el tiempo según sea necesario
  }

}
