import { Component, OnInit } from '@angular/core'; // Importa Component y OnInit
import { ActivatedRoute } from '@angular/router'; // Importa ActivatedRoute
import { InventoryService } from '../../services/inventory.service'; // Importa InventoryService
import { AlertController } from '@ionic/angular'; // Importa AlertController
import { HttpClient } from '@angular/common/http'; // Importar HttpClient
import { AuthService } from '../../services/auth.service'; // Importa AuthService
import { ActionSheetController, Platform } from '@ionic/angular'; // Importa ActionSheetController y Platform
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; // Importa Camera y CameraResultType
import { ModalController } from '@ionic/angular'; // Importa ModalController
import { ImageViewerComponent } from '../../components/image-viewer/image-viewer.component'; // Crea este componente
import { ImageStateService } from '../../services/image-state.service'; // Importa ImageStateService
import { Router } from '@angular/router';   // Importa Router
import { ChangeDetectorService } from '../../services/change-detector.service'; // Importa ChangeDetectorService

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
  esGerente: boolean = false;
  imageUrl: string | null = null; // Variable para almacenar la URL de la imagen
  subCategories: any[] = []; // Lista de subcategorías
  subCategoryName: string = ''; // Nombre de la subcategoría

  constructor(
    private route: ActivatedRoute, // Inyecta ActivatedRoute
    private inventoryService: InventoryService, // Inyecta InventoryService
    private alertController: AlertController, // Inyecta AlertController
    private router: Router, // Inyecta Router
    private http: HttpClient,   // Inyecta HttpClient
    private authService: AuthService, // Inyecta AuthService
    private actionSheetController: ActionSheetController, // Inyecta ActionSheetController
    private modalController: ModalController, // Inyecta ModalController
    public imageState: ImageStateService, // Inyecta ImageStateService
    private platform: Platform, // Inyect Platform
    private changeDetector: ChangeDetectorService // Inyecta ChangeDetectorService
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
    
    const productId = +this.route.snapshot.paramMap.get('id')!;
    this.fetchProduct(productId);
    this.fetchProviders();
    this.loadSubCategories();
  }

  loadSubCategories() {
    this.inventoryService.getSubCategories().subscribe(
      (response) => {
        if (response.success) {
          this.subCategories = response.data;
        } else {
        }
      },
      (error) => {
        console.error('Error al cargar las subcategorías:', error); // Depuración
      }
    );
  }

  getSubCategoryName(subCategoryId: number): string {
    if (!subCategoryId) {
      return 'Sin subcategoría';
    }
    const subCategory = this.subCategories.find(sc => sc.id === subCategoryId);
    return subCategory ? subCategory.name : 'Sin subcategoría';
  }

  // Método para ver la imagen en tamaño completo
  async viewImage() {
    if (!this.product.image_url) {
      await this.showAlert('Error', 'No hay imagen para mostrar.');
      return;
    }
  
    const modal = await this.modalController.create({
      component: ImageViewerComponent, // Componente para mostrar la imagen
      componentProps: {
        imageUrl: this.product.image_url, // Pasar la URL de la imagen al modal
      },
    });
  
    await modal.present();
  }

  async uploadImage(imagePath: string) {
    const productId = this.product.product_id;
    const response = await fetch(imagePath);
    const blob = await response.blob();
  
    const formData = new FormData();
    formData.append('image', blob, `product_${productId}.jpg`);
    formData.append('product_id', productId.toString());
  
    this.http.post('https://muebleriasolaris.com/ionic-products/ftp_image_upload.php', formData)
      .subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            this.product.image_url = response.image_url;
            this.imageState.getImageUrl(productId); // Actualizar el servicio
            this.product = {...this.product}; // Forzar detección de cambios
            this.changeDetector.setChangesDetected(`product_${this.product.product_id}`, true); // Marcar cambios detectados
            this.showAlert('Éxito', 'Imagen actualizada correctamente.');
          }
        },
        error: (error) => {
          console.error('Error al subir la imagen:', error);
          this.showAlert('Error', 'Ocurrió un error al subir la imagen.');
        },
      });
  }

  async deleteImage() {
  const productId = this.product.product_id;

  // Crear un FormData para enviar el ID del producto
  const formData = new FormData();
  formData.append('product_id', productId.toString());

  // Eliminar la imagen del servidor FTP
  this.http.post('https://muebleriasolaris.com/ionic-products/ftp_image_delete.php', formData)
      .subscribe({
          next: (response: any) => {
              console.log("Respuesta del servidor:", response); // Depuración
              if (response.status === 'success') {
                  // Restaurar el placeholder
                  this.product.image_url = 'assets/product_placeholder.png';
                  this.changeDetector.setChangesDetected(`product_${this.product.product_id}`, true); // Marcar cambios detectados
                  this.showAlert('Éxito', 'Imagen eliminada correctamente.');
              } else {
                  this.showAlert('Error', response.message || 'No se pudo eliminar la imagen.');
              }
          },
          error: (error) => {
              console.error('Error al eliminar la imagen:', error);
              this.showAlert('Error', 'Ocurrió un error al eliminar la imagen.');
          },
      });
  }

  async changeImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos, // Usar la galería
      });
  
      if (image.webPath) {
        // Subir la imagen al servidor FTP
        await this.uploadImage(image.webPath);
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

    // Asegúrate de que los campos numéricos sean números
    this.product.name = this.product.name; // Eliminar espacios en blanco al inicio y final
    this.product.credit_price = parseFloat(this.product.credit_price);
    this.product.prov_price = parseFloat(this.product.prov_price);
    this.product.current_stock = parseInt(this.product.current_stock, 10);
    this.product.max_amount = parseInt(this.product.max_amount, 10);

    console.log('Datos enviados al backend:', this.product); // Depuración

    this.inventoryService.saveProduct(this.product).subscribe({
        next: (response: any) => {
            if (response.success) {
                this.showAlert('Éxito', 'Producto actualizado correctamente.');
                this.originalProduct = { ...this.product }; // Actualiza la copia original
                this.isEditMode = false; // Sale del modo de edición
                this.changeDetector.setChangesDetected(`product_${this.product.product_id}`, true); // Marcar cambios detectados
                window.location.reload();
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
  async showAlert(header: string, message: string, duration: number = 3000) { // Duración en milisegundos, por defecto 5000ms (5 segundos)
    const alert = await this.alertController.create({
        header,
        message,
        buttons: ['OK']
    });

    await alert.present();

    // Cierra el alert después de la duración especificada
    setTimeout(() => {
        alert.dismiss();
    }, duration);
  }

  cancelEdit() {
    console.log('Cancelando edición');
    this.product = { ...this.originalProduct }; // Restaura los valores originales
    this.isEditMode = false;
  }

  // producto.page.ts
  async goBack() {
    try {
      const productId = this.product?.product_id;
      const hasChanges = productId ? this.changeDetector.hasChanges(`product_${productId}`) : false;
      
      console.log(`Navegando a inventario. Cambios: ${hasChanges}`);
  
      // Navegación principal
      await this.router.navigate(['/inventario'], {
        replaceUrl: true,
        state: { forceRefresh: hasChanges }
      });
  
      // Recarga condicional
      if (hasChanges) {
        console.log('Forzando recarga...');
        setTimeout(() => {
          window.location.href = '/inventario';
        }, 200);
      }
  
      // Resetear cambios
      if (productId) {
        this.changeDetector.reset(`product_${productId}`);
      }
    } catch (error) {
      console.error('Error en goBack:', error);
      window.location.href = '/inventario';
    }
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
  validateProvPriceInput(event: any) {
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
    this.product!.prov_price = input;
  }
}