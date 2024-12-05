import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-agregar-inventario',
  templateUrl: './agregar-inventario.page.html',
  styleUrls: ['./agregar-inventario.page.scss'],
})
export class AgregarInventarioPage implements OnInit {
  newProduct: any = {
    name: '',
    category_id: null,
    sub_category_id: null,
    product_details: '',
    novedad_act: 0,
    credit_price: null,
    brand_id: null,
  };

  categories: any[] = [];
  subCategories: any[] = [];
  brands: any[] = [];

  constructor(private inventoryService: InventoryService, private navCtrl: NavController) {}

  ngOnInit() {
    this.loadCategories();
    this.loadBrands();
    this.loadSubCategories();
  }

  // Cargar categorías desde el backend
  loadCategories() {
    this.inventoryService.getCategories().subscribe(
      (response) => {
        if(response.success){
          this.categories = response.data;
        }
      },
      (error) => {
        console.error('Error al cargar categorías:', error);
      }
    );
  }

  // Cargar Subcategorías desde el backend
  loadSubCategories() {
    this.inventoryService.getSubCategories().subscribe(
      (response) => {
        if(response.success){
          this.subCategories = response.data;
        }
      },
      (error) => {
        console.error('Error al cargar categorías:', error);
      }
    );
  }

  // Cargar marcas desde el backend
  loadBrands() {
    this.inventoryService.getBrands().subscribe(
      (response) => {
        if(response.success){
          this.brands = response.data;
        }
      },
      (error) => {
        console.error('Error al cargar marcas:', error);
      }
    );
  }

  // Guardar producto
  saveProduct() {
    this.inventoryService.saveProduct(this.newProduct).subscribe(
      (response) => {
        console.log('Producto guardado:', response);
        // Navegar a la lista de productos o mostrar confirmación
        this.navCtrl.navigateBack('/inventario');
      },
      (error) => {
        console.error('Error al guardar el producto:', error);
      }
    );
  }

  toggleNovedad(event: any) {
    this.newProduct.novedad_act = event.detail.checked ? 1 : 0;
  }
}
