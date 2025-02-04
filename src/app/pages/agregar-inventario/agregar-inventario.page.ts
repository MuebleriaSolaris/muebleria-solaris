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
    proveedor_id: null,
  };

  categories: any[] = [];
  subCategories: any[] = [];
  brands: any[] = [];
  providers: any[] = [];

  constructor(private inventoryService: InventoryService, private navCtrl: NavController) {}

  ngOnInit() {
    this.loadCategories();
    this.loadBrands();
    this.loadSubCategories();
    this.loadprovider();
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

  // Cargar proveedor desde el backend
  loadprovider() {
    this.inventoryService.getProviders().subscribe(
      (response) => {
        if(response.success){
          this.providers = response.data;
        }
      },
      (error) => {
        console.error('Error al cargar proveedores:', error);
      }
    );
  }

  // Guardar producto
  saveProduct() {
    if (!this.newProduct.proveedor_id) {
      console.error('Proveedor no seleccionado');
      return;
    }
  
    this.inventoryService.saveProduct(this.newProduct).subscribe(
      (response) => {
        console.log('Producto guardado:', response);
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
