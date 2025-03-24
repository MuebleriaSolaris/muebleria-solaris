import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';
import { NavController, AlertController } from '@ionic/angular'; // Añadir AlertController
import { Router } from '@angular/router'; // Añadir Router para navegación
import { HttpClient } from '@angular/common/http'; // Importar HttpClient
import { AuthService } from '../../services/auth.service';
import { ActionSheetController, Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
import { ImageViewerComponent } from '../../components/image-viewer/image-viewer.component'; // Crea este componente



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
    prov_price: null,
  };

  categories: any[] = [];
  subCategories: any[] = [];
  brands: any[] = [];
  providers: any[] = [];
  nextProductId: number | null = null; // Almacenar el siguiente ID disponible
  selectedImage: string | null = null; // Almacenar la imagen seleccionada
  esGerente: boolean = false; // Variable para verificar si el usuario es gerente
  imageUrl: string | null = null; // Variable para almacenar la URL de la imagen


  constructor(
    private inventoryService: InventoryService,
    private navCtrl: NavController,
    private alertController: AlertController, // Inyectar AlertController
    private router: Router, // Inyectar Router
    private http: HttpClient,
    private authService: AuthService,
    private actionSheetController: ActionSheetController, // Inyecta ActionSheetController
    private modalController: ModalController // Inyecta ModalController
  ) {}

  ngOnInit() {

    // Obtener el ID del usuario desde AuthService
    const userId = this.authService.getUserId();
    
    if (userId) {
      // Realizar la llamada HTTP directamente en el componente
      this.http.get<any>(`https://muebleriasolaris.com/ionic-login/check_gerencia.php?userid=${userId}`)
        .subscribe((response) => {
          if (response.success) {
            this.esGerente = response.isGerente;
          } else {
            console.error('Error en la respuesta de la API:', response.error);
          }
          console.log('¿Es gerente?', this.esGerente);
          console.log('ID de usuario:', userId);
        }, (error) => {
          console.error('Error en la llamada HTTP:', error);
        });
    }

    this.loadCategories();
    this.loadBrands();
    this.loadSubCategories();
    this.loadprovider();
  }

  // Método para obtener el siguiente ID disponible
  async getNextProductId() {
    try {
      const response: any = await this.http.get('https://muebleriasolaris.com/ionic-products/get_next_product_id.php').toPromise();
      if (response.status === 'success') {
        this.nextProductId = response.next_id;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error al obtener el siguiente ID:', error);
      await this.showAlert('Error', 'No se pudo obtener el siguiente ID del producto.');
    }
  }

  // Método para ver la imagen en tamaño completo
  async viewImage() {
    if (!this.imageUrl) {
      await this.showAlert('Error', 'No hay imagen para mostrar.');
      return;
    }
  
    const modal = await this.modalController.create({
      component: ImageViewerComponent, // Componente para mostrar la imagen
      componentProps: {
        imageUrl: this.imageUrl, // Pasar la URL de la imagen al modal
      },
    });
  
    await modal.present();
  }

  // Método para subir la imagen al servidor FTP
  async uploadImage(imagePath: string) {
    if (!this.nextProductId) {
      await this.showAlert('Error', 'No se ha obtenido un ID válido para el producto.');
      return;
    }

    // Convertir la imagen a un archivo Blob
    const response = await fetch(imagePath);
    const blob = await response.blob();

    // Crear un FormData para enviar la imagen
    const formData = new FormData();
    formData.append('image', blob, `product_${this.nextProductId}.jpg`);
    formData.append('product_id', this.nextProductId.toString());

    // Subir la imagen al servidor FTP
    this.http.post('https://muebleriasolaris.com/ionic-products/ftp_image_upload.php', formData)
        .subscribe({
            next: (response: any) => {
                console.log("Respuesta del servidor:", response); // Depuración
                if (response.status === 'success') {
                    this.selectedImage = response.image_url;
                    this.imageUrl = response.image_url;
                    console.log('Imagen subida correctamente:', this.imageUrl);
                    this.showAlert('Éxito', 'Imagen subida correctamente.');
                } else {
                    this.showAlert('Error', response.message || 'No se pudo subir la imagen.');
                }
            },
            error: (error) => {
                console.error('Error al subir la imagen:', error);
                this.showAlert('Error', 'Ocurrió un error al subir la imagen.');
            },
        });
  }

  async deleteImage() {
    this.imageUrl = 'assets/product_placeholder.png';
    this.selectedImage = 'assets/product_placeholder.png';
    this.showAlert('Éxito', 'Imagen eliminada correctamente.');
  }

  // Método para seleccionar una imagen
  async changeImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      if (image.webPath) {
        await this.getNextProductId(); // Obtener el siguiente ID
        await this.uploadImage(image.webPath); // Subir la imagen
      }
    } catch (error) {
      console.error('Error al seleccionar la imagen:', error);
    }
  }

  async presentImageOptions() {
    console.log("Click en Imagen");
    const actionSheet = await this.actionSheetController.create({
      header: 'Opciones de imagen',
      buttons: [
        {
          text: 'Cambiar imagen',
          icon: 'image',
          handler: () => {
            this.changeImage();
          },
        },
        {
          text: 'Eliminar imagen',
          icon: 'trash',
          handler: () => {
            this.deleteImage();
          },
        },
        {
          text: 'Ver imagen',
          icon: 'eye-outline',
          handler: () => {
            this.viewImage(); // Método para ver la imagen en tamaño completo
          },
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
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
    const { name } = this.newProduct;
  
    // Validar que el campo "name" no esté vacío
    if (!name) {
      await this.showAlert(
        'Campo obligatorio',
        'Por favor, ingresa el nombre del producto.'
      );
      return;
    }
  
    // Asignar valores por defecto si no se proporcionan
    const newProduct = {
      name: this.newProduct.name, // Obligatorio
      category_id: this.newProduct.category_id || 14, // Valor por defecto: 14
      sub_category_id: this.newProduct.sub_category_id || 31, // Valor por defecto: 31
      brand_id: this.newProduct.brand_id || 1, // Valor por defecto: 1
      credit_price: this.newProduct.credit_price || 0, // Valor por defecto: 0
      proveedor_id: this.newProduct.proveedor_id || 10, // Valor por defecto: 10
      product_details: this.newProduct.product_details || "", // Valor por defecto: ""
      novedad_act: this.newProduct.novedad_act ? 1 : 0, // Convertir a 1 o 0
      prov_price: this.newProduct.prov_price || 0, // Valor por defecto: 0
      image_url: this.imageUrl, // URL de la imagen subida
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
                  this.router.navigate(['/inventario'], {
                    state: { componentRef: this }
                  }).then(() => {
                    const nav = this.router.getCurrentNavigation();
                    const state = nav?.extras?.state as any; // Casting a 'any'
                    
                    if (state?.['componentRef']) {
                      state['componentRef'].instance.ngOnInit();
                    }
                  });
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
