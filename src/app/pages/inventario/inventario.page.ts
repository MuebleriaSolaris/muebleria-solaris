import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
})
export class InventarioPage implements OnInit {
  products: any[] = []; // Lista completa de productos
  filteredProducts: any[] = []; // Lista filtrada
  searchTerm: string = ''; // Término de búsqueda

  constructor(private inventoryService: InventoryService) {}

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.inventoryService.getProducts(this.searchTerm).subscribe(
      (response) => {
        if (response.success) {
          this.products = response.data; // Carga los datos originales
          this.filteredProducts = this.products; // Inicializa la lista filtrada
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
}
