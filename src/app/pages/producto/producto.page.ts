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
import { lastValueFrom } from 'rxjs'; // Importa lastValueFrom   
import { LoadingController, ToastController } from '@ionic/angular'; // Importa LoadingController y ToastController
import { NavController } from '@ionic/angular';
import { InventarioPage } from '../inventario/inventario.page';

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
  isUpdating = false; // Bandera para indicar si se está actualizando la visibilidad del producto
  originalValues: { current_stock?: number, max_amount?: number } = {}; // Almacena los valores originales de stock y cantidad máxima

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
    private changeDetector: ChangeDetectorService, // Inyecta ChangeDetectorService
    private loadingController: LoadingController, // Inyecta LoadingController
    private navCtrl: NavController, // Inyecta NavController
    private toastController: ToastController // Inyecta ToastController
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
    const loading = await this.loadingController.create({
        message: 'Subiendo imagen...',
        spinner: 'crescent'
    });
    await loading.present();

    try {
        const productId = this.product.product_id;
        const response = await fetch(imagePath);
        const blob = await response.blob();
    
        const formData = new FormData();
        formData.append('image', blob, `product_${productId}.jpg`);
        formData.append('product_id', productId.toString());
    
        const uploadResponse: any = await lastValueFrom(
            this.http.post('https://muebleriasolaris.com/ionic-products/ftp_image_upload.php', formData)
        );

        if (uploadResponse.status === 'success') {
            this.product.image_url = uploadResponse.image_url;
            this.imageState.getImageUrl(productId);
            this.product = {...this.product};
            this.changeDetector.setChangesDetected(`product_${this.product.product_id}`, true);
            await this.showAlert('Éxito', 'Imagen actualizada correctamente.');
        } else {
            throw new Error(uploadResponse.message || 'Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        await this.showAlert('Error', 'Ocurrió un error al subir la imagen.');
    } finally {
        await loading.dismiss();
    }
  }

  async deleteImage() {
    const loading = await this.loadingController.create({
        message: 'Eliminando imagen...',
        spinner: 'dots'
    });
    await loading.present();

    try {
        const productId = this.product.product_id;
        const formData = new FormData();
        formData.append('product_id', productId.toString());

        const deleteResponse: any = await lastValueFrom(
            this.http.post('https://muebleriasolaris.com/ionic-products/ftp_image_delete.php', formData)
        );

        if (deleteResponse.status === 'success') {
            this.product.image_url = 'assets/product_placeholder.png';
            this.changeDetector.setChangesDetected(`product_${this.product.product_id}`, true);
            await this.showAlert('Éxito', 'Imagen eliminada correctamente.');
        } else {
            throw new Error(deleteResponse.message || 'Error en la respuesta del servidor');
        }
    } catch (error) {
        console.error('Error al eliminar la imagen:', error);
        await this.showAlert('Error', 'Ocurrió un error al eliminar la imagen.');
    } finally {
        await loading.dismiss();
    }
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

  setEditMode(isEdit: boolean) {
    this.isEditMode = isEdit;
    if (isEdit) {
        // Guardar los valores originales al entrar en modo edición
        this.originalValues = {
            current_stock: this.product?.current_stock,
            max_amount: this.product?.max_amount
        };
    }
  }

  validateStocksBeforeSave(): boolean {
    const current = Number(this.product?.current_stock) || 0;
    const max = Number(this.product?.max_amount) || 0;
    
    if (current > max || max < current) {
        // Mostramos alerta
        this.showAlert(
            'Error de Validación',
            'El Stock Disponible no puede ser mayor que el Stock Máximo.'
        );
        return false;
    }
    return true;
  }
  // Función para confirmar la actualización del producto
  async confirmSaveChanges() {

    // Primero validamos los stocks
    if (!this.validateStocksBeforeSave()) {
        return; // Detenemos el proceso si hay error
    }

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
  async saveChanges() {
    if (!this.validateStocksBeforeSave()) {
      return; // Detenemos el proceso si hay error
    }

    if (!this.product || !this.product.product_id) {
        console.error('El producto no tiene un ID válido.');
        return; 
    }

    const loading = await this.loadingController.create({
        message: 'Guardando cambios...',
        spinner: 'bubbles'
    });
    await loading.present();

    try {
        // Mantenemos exactamente la misma lógica de tu versión original
        this.product.name = this.product.name; // Conserva el valor original si no se modifica
        this.product.credit_price = parseFloat(this.product.credit_price); // Convierte a número flotante
        this.product.prov_price = parseFloat(this.product.prov_price); // Convierte a número flotante
        this.product.current_stock = parseInt(this.product.current_stock, 10); // Convierte a número entero
        this.product.max_amount = parseInt(this.product.max_amount, 10); // Convierte a número entero

        console.log('Datos enviados al backend:', this.product); // Depuración

        // Convertimos el observable a promesa para usar async/await
        const response: any = await lastValueFrom(
            this.inventoryService.saveProduct(this.product)
        );

        if (response.success) {
            await this.showToast(
              `Producto actualizado correctamente`,
              'success'
            );
            // await this.showAlert('Éxito', 'Producto actualizado correctamente.');
            this.originalProduct = { ...this.product };
            this.isEditMode = false;
            this.changeDetector.setChangesDetected(`product_${this.product.product_id}`, true);
            //window.location.reload(); // Recarga completa como en tu versión original
        } else {
            throw new Error(response.message || 'Error al actualizar el producto');
        }
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        await this.showAlert('Error', (error as Error).message || 'Ocurrió un error al actualizar el producto.');
    } finally {
        await loading.dismiss();
    }
  }

  // Función para confirmar la eliminación del producto
  async confirmDelete() {
    this.deleteProduct(); // Llama a la función deleteProduct si el usuario confirma
  }

    // Función para eliminar el producto
    async deleteProduct() {
      if (!this.product || !this.product.product_id) {
          console.error('El producto no tiene un ID válido.');
          await this.showAlert('Error', 'El producto no tiene un ID válido.');
          return;
      }

      const confirmAlert = await this.alertController.create({
          header: 'Confirmar eliminación',
          message: `¿Estás seguro de que deseas eliminar "${this.product.product_name}" (ID: ${this.product.product_id})?`,
          buttons: [
              {
                  text: 'Cancelar',
                  role: 'cancel',
                  cssClass: 'secondary'
              },
              {
                  text: 'Eliminar',
                  handler: async () => {
                      const loading = await this.loadingController.create({
                          message: 'Eliminando producto...',
                          spinner: 'lines',
                          duration: 15000 // Timeout de 15 segundos
                      });
                      
                      try {
                          await loading.present();

                          // Usar await directamente en lugar de lastValueFrom
                          const response = await this.inventoryService.deleteProduct(this.product.product_id).toPromise();

                          if (response?.success) {
                              await this.showToast('Producto eliminado correctamente', 'success');
                              this.changeDetector.setChangesDetected(`product_${this.product.product_id}`, true);
                              this.goBack();
                          } else {
                              throw new Error(response?.message || 'No se pudo eliminar el producto');
                          }
                      } catch (error) {
                          console.error('Error al eliminar:', error);
                          
                          let errorMessage = 'Error desconocido al eliminar';
                          if (error instanceof Error) {
                              errorMessage = error.message;
                          } else if (typeof error === 'string') {
                              errorMessage = error;
                          }
                          
                          await this.showAlert('Error', errorMessage);
                      } finally {
                          await loading.dismiss();
                      }
                  }
              }
          ]
      });

      await confirmAlert.present();
  }

  // Método auxiliar para mostrar toasts
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

  async goBack() {
    try {
      const productId = this.product?.product_id;
      const hasChanges = productId ? this.changeDetector.hasChanges(`product_${productId}`) : false;
      
      console.log(`Navegando a inventario. Cambios: ${hasChanges}`);

      // Resetear cambios primero
      if (productId) {
        this.changeDetector.reset(`product_${productId}`);
      }

      if (hasChanges) {
        console.log('Forzando recarga de datos...');
        // Emitir el evento de refresco
        InventarioPage.refreshData.next();
        
        // Pequeño delay para asegurar que la recarga comience
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Navegar hacia atrás
      this.navCtrl.back();
      
    } catch (error) {
      console.error('Error en goBack:', error);
      this.router.navigate(['/inventario']);
    }
  }

  // Método llamado al hacer clic en el toggle
  async toggleProductVisibility() {
    if (this.isUpdating || !this.product) return;
  
    // Si es undefined, asigna un valor por defecto (0)
    if (this.product.hide_product === undefined) {
      this.product.hide_product = 0;
    }
  
    this.isUpdating = true;
    const previousState = this.product.hide_product;
  
    // Cambio optimista
    this.product.hide_product = this.product.hide_product === 0 ? 1 : 0;
  
    try {
      const response = await lastValueFrom(
        this.inventoryService.updateProductVisibility(
          this.product.product_id,
          this.product.hide_product // Envía el nuevo estado, no el anterior
        )
      );
      
      await this.showToast(
        `Producto marcado como ${this.product.hide_product === 0 ? 'visible' : 'oculto'}`,
        'success'
      );
      
    } catch (error) {
      // Revertir en caso de error
      this.product.hide_product = previousState;
      console.error('Error completo:', error);
      await this.showToast('Error al actualizar visibilidad', 'danger');
    } finally {
      this.isUpdating = false;
    }
  }

  validateStockInput(event: any) {
    let input = event.target;
    let value = input.value;
    value = value.replace(/[^0-9]/g, '');
    if (value.length > 5) {
        value = value.slice(0, 5);
    }
    input.value = value;
    this.product!.current_stock = Number(value);
  }

  validateMaxStockInput(event: any) {
      let input = event.target;
      let value = input.value;
      value = value.replace(/[^0-9]/g, '');
      if (value.length > 5) {
          value = value.slice(0, 5);
      }
      input.value = value;
      this.product!.max_amount = Number(value);
  }

  validateStockValues() {
    // Convertimos a números por si acaso
    const currentStock = Number(this.product?.current_stock) || 0;
    const maxStock = Number(this.product?.max_amount) || 0;
    
    if (currentStock > maxStock || maxStock < currentStock) {
        // Mostramos alerta
        this.showAlert(
            'Alerta de Inventario',
            'El Stock Disponible no puede ser mayor que el Stock Máximo.'
        );
        
        // Ajustamos los valores a los que corresponden por defecto
        this.product!.current_stock = this.originalValues?.current_stock;
        this.product!.max_amount = this.originalValues?.max_amount;
    }
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