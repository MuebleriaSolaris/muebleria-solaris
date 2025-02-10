import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';
import { NavController, AlertController } from '@ionic/angular'; // Añadir AlertController
import { Router } from '@angular/router'; // Añadir Router para navegación

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

  constructor(
    private inventoryService: InventoryService,
    private navCtrl: NavController,
    private alertController: AlertController, // Inyectar AlertController
    private router: Router // Inyectar Router
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadBrands();
    this.loadSubCategories();
    this.loadprovider();
  }

  // Método para mostrar alertas
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  // Cargar categorías desde el backend
  loadCategories() {
    this.inventoryService.getCategories().subscribe(
      (response) => {
        if(response.success){
          this.categories = response.data;
        }
      },
      async (error) => { // Usar async para await
        console.error('Error al cargar categorías:', error);
        await this.showAlert('Error', 'No se pudieron cargar las categorías');
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
  // Limpiar el formulario después de guardar
  resetForm() {
    this.newProduct = {
      name: '',
      category_id: null,
      sub_category_id: null,
      product_details: '',
      novedad_act: 0,
      credit_price: null,
      brand_id: null,
      proveedor_id: null,
    };
  }

  toggleNovedad(event: any) {
    this.newProduct.novedad_act = event.detail.checked ? 1 : 0;
  }

  async saveProduct() {
    const { name, category_id, sub_category_id, brand_id, credit_price, proveedor_id, product_details } = this.newProduct;

    // Validar campos vacíos o nulos
    if (!name || !category_id || !sub_category_id || !brand_id || !credit_price || !proveedor_id || !product_details) {
      await this.showAlert(
        'Campos incompletos',
        'Por favor, llena todos los campos antes de guardar el producto.'
      );
      return;
    }

    const newProduct = {
      name: this.newProduct.name,
      category_id: this.newProduct.category_id,
      sub_category_id: this.newProduct.sub_category_id,
      brand_id: this.newProduct.brand_id,
      credit_price: this.newProduct.credit_price,
      proveedor_id: this.newProduct.proveedor_id,
      product_details: this.newProduct.product_details,
      novedad_act: this.newProduct.novedad_act ? 1 : 0,
    };

    // Mostrar confirmación antes de guardar
    const confirmAlert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que deseas guardar este producto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: () => {
            this.inventoryService.addInventory(newProduct).subscribe({
              next: async (response) => {
                if (response.success) {
                  await this.showAlert('Éxito', 'Producto agregado correctamente');
                  this.router.navigate(['/inventario']);
                } else {
                  await this.showAlert('Error', response.message || 'Error desconocido');
                }
              },
              error: async (error) => {
                console.error('Error:', error);
                await this.showAlert('Error', 'Error en el servidor');
              },
              complete: () => {
                console.log('Operación completada');
              },
            });
          },
        },
      ],
    });

    await confirmAlert.present();
  }

}
