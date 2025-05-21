import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { AuthService } from '../../services/auth.service';
import { IonItemSliding } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { ImageStateService } from '../../services/image-state.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { lastValueFrom } from 'rxjs';  // Añade esto al inicio del archivo
import { timeout } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http'; // Importar HttpClient

// Definir la interfaz Product fuera de la clase
interface Product {
  image_url: string;
  product_id: number;
  product_name: string;
  credit_price: number;
  updated_at: string;
  category_id: number | null;
  current_count: number;
  current_stock: number;
  max_amount: number;
  prov_price: string;
  provider_name: string;
  sub_category_id: number | null; 
  position_index: number | null;
  global_position: number | null;
  hide_product: number | null; // Añadir hide_product aquí
}

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
})
export class InventarioPage implements OnInit {
  products: Product[] = []; // Lista completa de productos
  filteredProducts: Product[] = []; // Lista filtrada
  displayedProducts: Product[] = []; // Productos mostrados actualmente
  searchTerm: string = ''; // Término de búsqueda
  isAdmin: boolean = false; // Variable para verificar si el usuario es administrador
  // Propiedades para los filtros
  selectedCategory: string = '';
  selectedSubCategory: string = '';
  selectedSort: string = 'recent';
  categories: any[] = []; // Categorías obtenidas de la API
  subCategories: any[] = []; // Subcategorías obtenidas de la API
  loading: boolean = false; // Variable para mostrar el spinner de carga
  imageLoaded: {[key: number]: boolean} = {}; // Objeto para rastrear imágenes cargadas
  // Variables para manejar el doble click
  private lastClickTime: number = 0;
  private doubleClickDelay: number = 300; // Retraso para considerar un doble click (en milisegundos)
  static refreshData = new Subject<void>(); // Emite un evento para recargar los datos
  allowGlobalReorder: boolean = true; // Habilitar reordenamiento global
  isReordering: boolean = false; // Estado de reordenamiento
  showHiddenProducts: boolean = false; // Estado para mostrar productos ocultos
  esGerente: boolean = false; // Variable para verificar si el usuario es gerente

  constructor(
    private inventoryService: InventoryService, // Inyecta InventoryService para obtener productos
    private router: Router, // Inyecta Router para la navegación
    private authService: AuthService,   // Inyecta AuthService para verificar
    private cdr: ChangeDetectorRef, // Inyecta ChangeDetectorRef para actualizar la vista
    public imageState: ImageStateService, // Inyecta el servicio de estado de imagen
    private alertController: AlertController,  // Inyecta AlertController para mostrar alertas
    private loadingController: LoadingController, // Inyecta LoadingController para mostrar loaders
    private http: HttpClient,   // Inyecta HttpClient
    private toastController: ToastController // Inyecta ToastController para mostrar toasts
  ) {}

  ngOnInit() {
    console.log('Inicializando página de inventario...');
    this.isAdmin = this.authService.isAdmin();
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
    this.loading = true; // Mostrar spinner al iniciar

    // Cargar productos, categorías y subcategorías
    Promise.all([
      this.fetchProducts(),
      this.fetchCategories(),
      this.fetchSubCategories()
    ]).finally(() => {
      this.loading = false; // Ocultar spinner cuando todo esté cargado
    });

    InventarioPage.refreshData.subscribe(() => {
      this.loading = true; // Mostrar spinner al refrescar
      Promise.all([
        this.fetchProducts(),
        this.fetchCategories(),
        this.fetchSubCategories()
      ]).finally(() => {
        this.loading = false; // Ocultar spinner cuando todo esté cargado
      });
    });
  }

  // Método para marcar una imagen como cargada
  setImageLoaded(productId: number) {
    this.loading = true; // Mostrar spinner al iniciar
    console.log('Imagen cargada para producto ID:', productId);
    this.imageLoaded[productId] = true;
    this.cdr.detectChanges(); // Forzar actualización de la vista
    this.loading = false; // Ocultar spinner cuando todo esté cargado
  }

  // Método para manejar el click
  handleClick(product: any) {
    console.log('Click detectado, llamando a viewProduct dos veces...');
    this.viewProduct(product); // Primera llamada

    // Segunda llamada después de 100 ms
    setTimeout(() => {
      this.viewProduct(product);
    }, 100);
  }
  // Modifica el método handleReorder
  async handleReorder(event: CustomEvent) {
    this.isReordering = true; // Cambia el estado de reordenamiento a verdadero
    const { from, to } = event.detail;
    const newItems = [...this.displayedProducts];
    
    // Mover el elemento
    const movedItem = newItems.splice(from, 1)[0];
    newItems.splice(to, 0, movedItem);
    
    // Actualizar visualmente
    this.displayedProducts = newItems;
    
    const loading = await this.loadingController.create({ message: 'Guardando orden...' });
    await loading.present();
  
    try {
      const productIds = newItems.map(item => item.product_id);
      const isGlobal = !this.selectedSubCategory;
      
      const response = await lastValueFrom(
        this.inventoryService.updateProductOrder({
          product_ids: productIds,
          sub_category_id: isGlobal ? undefined : Number(this.selectedSubCategory),
          is_global: isGlobal
        }).pipe(timeout(5000))
      );
  
      if (response.success) {
        this.showToast('Orden guardado!');
        // Actualizar los índices localmente
        newItems.forEach((item, index) => {
          if (isGlobal) {
            item.global_position = index;
          } else {
            item.position_index = index;
          }
        });
        
        // Actualizar también en this.products para mantener consistencia
        this.products = this.products.map(product => {
          const updatedProduct = newItems.find(p => p.product_id === product.product_id);
          return updatedProduct ? {...product, 
            global_position: updatedProduct.global_position,
            position_index: updatedProduct.position_index
          } : product;
        });
      } else {
        throw new Error('Error en servidor');
      }
    } catch (error) {
      console.error('Error:', error);
      this.showToast('Error al guardar. Recargando...', 'danger');
      this.fetchProducts(); // Recargar datos completos
    } finally {
      loading.dismiss();
      event.detail.complete();
      this.isReordering = false;
      event.detail.complete();
      
      // Forzar actualización de la vista
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 100);
    }
  }

  getReorderGroupClass() {
    return {
      'reorder-visible': this.isAdmin,
      'reordering': this.isReordering
    };
  }

  // Método para mostrar toasts
  private async showToast(message: string, color: string = 'success', duration: number = 2000) {
    console.log(`Toast: ${message}`, color); // Log para depuración
    const toast = await this.toastController.create({
      message,
      duration,
      color,
      position: 'top'
    });
    await toast.present();
  }
  
  fetchProducts() {
    this.loading = true;
    const subCategoryId = this.selectedSubCategory ? Number(this.selectedSubCategory) : undefined;
    
    this.inventoryService.getProducts(this.searchTerm, subCategoryId).subscribe(
      (response) => {
        if (response && response.success) {
          // Normalizar productos y asegurar current_stock
          this.products = response.data.map((product: any) => {
            const normalized = this.normalizeProduct(product);
            // Asegurar que current_count refleje current_stock
            normalized.current_count = normalized.current_stock;
            return normalized;
          });
          
          // Ordenar por posición
          this.products.sort((a, b) => {
            // Priorizar el orden por subcategoría si está seleccionada
            if (subCategoryId) {
              const aPos = a.position_index === null ? Infinity : a.position_index;
              const bPos = b.position_index === null ? Infinity : b.position_index;
              return aPos - bPos;
            }
            // Orden global por defecto
            const aPos = a.global_position === null ? Infinity : a.global_position;
            const bPos = b.global_position === null ? Infinity : b.global_position;
            return aPos - bPos;
          });
          
          this.filteredProducts = [...this.products];
          this.applyFilters();
          this.loading = false;
        }
      },
      (error) => {
        console.error('Error al obtener productos:', error);
        this.loading = false;
      }
    );
  }

  // Método para asignar valores a los productos después de cargarlos
  assignValuesToProducts() {
    this.products.forEach((product) => {
      // Asignar valores predeterminados si no están definidos
      if (!product.sub_category_id) {
        product.sub_category_id = null; // Asignar un valor predeterminado
      }
      if (!product.category_id) {
        product.category_id = null; // Asignar un valor predeterminado
      }
      // Puedes agregar más asignaciones aquí si es necesario
    });
  }

  fetchCategories() {
    this.inventoryService.getCategories().subscribe(
      (response) => {
        if (response.success) {
          this.categories = response.data; // Asigna las categorías obtenidas de la API
        }
      },
      (error) => {
        console.error('Error al obtener categorías:', error);
      }
    );
  }

  fetchSubCategories() {
    this.inventoryService.getSubCategories().subscribe(
      (response) => {
        if (response.success) {
          this.subCategories = response.data; // Asigna las subcategorías obtenidas de la API
        }
      },
      (error) => {
        console.error('Error al obtener subcategorías:', error);
      }
    );
  }

  onSearchChange(event: any) {
    console.log('Término de búsqueda:', this.searchTerm);
    const value = this.normalizeText(this.searchTerm.toLowerCase()); // Normaliza el término de búsqueda

    // Si el término de búsqueda está vacío, restaurar la lista filtrada
    if (!value) {
      this.applyFilters(); // Restaurar la lista filtrada
      return;
    }

    // Dividir el término de búsqueda en palabras clave
    const keywords = value.split(' ').filter((word) => word.length > 0); // Eliminar palabras vacías

    // Determinar sobre qué lista se realiza la búsqueda
    const searchSource = this.selectedCategory || this.selectedSubCategory
      ? this.filteredProducts // Si hay un filtro específico, buscar en filteredProducts
      : this.products; // Si no hay filtro, buscar en todos los productos

    // Filtrar sobre la lista correspondiente
    this.filteredProducts = searchSource.filter((product) => {
      const productName = this.normalizeText(product.product_name.toLowerCase());
      const providerName = this.normalizeText(product.provider_name.toLowerCase());
      const productId = product.product_id.toString();

      // Verificar si todas las palabras clave están presentes en el nombre, proveedor o ID
      return keywords.every(
        (keyword) =>
          productName.includes(keyword) ||
          providerName.includes(keyword) ||
          productId.includes(keyword)
      );
    });

    console.log('Productos filtrados:', this.filteredProducts);

    // Reiniciar la paginación y cargar los primeros productos
    //this.currentPage = 1; 
    this.displayedProducts = []; // Reiniciar los productos mostrados
    this.loadMoreProducts(); // Cargar los primeros productos filtrados
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  normalizeText(text: string): string {
    return text
      .normalize('NFD') // Normaliza a forma descompuesta (NFD)
      .replace(/[\u0300-\u036f]/g, ''); // Elimina los caracteres diacríticos
  }

  applyFilters() {
    let filtered = [...this.products];
    
    // 1. Filtrado por categoría/subcategoría
    if (this.selectedCategory) {
      const selectedCategoryId = Number(this.selectedCategory);
      filtered = filtered.filter(product => product.category_id === selectedCategoryId);
    }
  
    if (this.selectedSubCategory) {
      const selectedSubCategoryId = Number(this.selectedSubCategory);
      filtered = filtered.filter(product => 
        product.sub_category_id === selectedSubCategoryId || !product.sub_category_id
      );
    }

    // 2. Filtrado por productos ocultos (nuevo filtro)
    if (this.showHiddenProducts) {
      // Mostrar solo productos ocultos
      filtered = filtered.filter(product => product.hide_product === 1);
    }
  
    // 2. Ordenamiento priorizando posición
    filtered = filtered.sort((a, b) => {
      // Caso 1: Hay subcategoría seleccionada -> usar position_index
      if (this.selectedSubCategory) {
        // Tratar null como infinito positivo para que vayan al final
        const aPos = a.position_index === null ? Infinity : a.position_index;
        const bPos = b.position_index === null ? Infinity : b.position_index;
        return aPos - bPos;
      }
      // Caso 2: Vista global -> usar global_position
      else {
        // Tratar null como infinito positivo para que vayan al final
        const aPos = a.global_position === null ? Infinity : a.global_position;
        const bPos = b.global_position === null ? Infinity : b.global_position;
        return aPos - bPos;
      }
    });
  
    // 3. Aplicar ordenamiento adicional solo si no hay posiciones definidas
    const hasCustomOrder = filtered.some(p => 
      this.selectedSubCategory ? p.position_index !== null : p.global_position !== null
    );
  
    if (!hasCustomOrder) {
      if (this.selectedSort === 'recent') {
        filtered = filtered.sort(
          (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      } else if (this.selectedSort === 'alphabetical') {
        filtered = filtered.sort((a, b) => a.product_name.localeCompare(b.product_name));
      }
    }
  
    this.filteredProducts = filtered;
    // this.currentPage = 1;
    this.displayedProducts = [];
    this.loadMoreProducts();
  }

  // Método para normalizar un producto
  normalizeProduct(product: Product): Product {
    // Inicializa el estado de carga para esta imagen
    this.imageLoaded[product.product_id] = false;
    
    return {
      image_url: product.image_url || 'assets/product_placeholder.png', // Asegurar que image_url tenga un valor
      product_id: product.product_id || 0, // Asegurar que product_id tenga un valor
      product_name: product.product_name || 'Producto sin nombre', // Asegurar que product_name tenga un valor
      credit_price: product.credit_price || 0, // Asegurar que credit_price tenga un valor
      updated_at: product.updated_at || new Date().toISOString(), // Asegurar que updated_at tenga un valor
      category_id: product.category_id || null, // Asegurar que category_id tenga un valor
      current_count: product.current_stock || 0, // Inicializar con current_stock
      current_stock: product.current_stock || 0, // Asegurar que siempre tenga valor
      max_amount: product.max_amount || 0, // Asegurar que max_amount tenga un valor
      prov_price: product.prov_price || '0.00', // Asegurar que prov_price tenga un valor
      provider_name: product.provider_name || 'Proveedor desconocido', // Asegurar que provider_name tenga un valor
      sub_category_id: product.sub_category_id || null, // Asegurar que sub_category_id tenga un valor
      position_index: product.position_index !== undefined ? product.position_index : null, // Asegurar que position_index tenga un valor
      global_position: product.global_position !== undefined ? product.global_position : null,  // Asegurar que global_position tenga un valor
      hide_product: product.hide_product !== undefined ? product.hide_product : null // Asegurar que hide_product tenga un valor
    };
  }

  // En tu clase
  imageLoadError(event: any, product: Product) {
    console.error('Error cargando imagen para producto:', product.product_id, event);
    event.target.src = 'assets/product_placeholder.png';
    this.imageLoaded[product.product_id] = true;
    this.cdr.detectChanges();
  }

  loadMoreProducts() {
    // Concatena los nuevos productos a la lista existente
    this.displayedProducts = [...this.filteredProducts];
  }

  onCategoryChange(event: any) {
    this.selectedCategory = event.detail.value;
    this.selectedSubCategory = ''; // Reinicia la subcategoría al cambiar la categoría
    this.applyFilters();
  }

  onSubCategoryChange(event: any) {
    this.selectedSubCategory = event.detail.value;
    this.applyFilters();
  }

  hasMoreProducts(): boolean {
    return this.displayedProducts.length < this.filteredProducts.length;
  }

  viewProduct(product: Product) {
    console.log('Método viewProduct ejecutado'); // Log para verificar que el método se está llamando

    // Verifica que el producto esté definido y tenga las propiedades necesarias
    if (!product || !product.product_id) {
      console.error('El producto no está completamente cargado o falta información:', product);
      return; // Detener la ejecución si el producto no es válido
    }

    // Verifica que sub_category_id esté definido
    if (!product.sub_category_id) {
      console.warn('El producto no tiene sub_category_id:', product);
      product.sub_category_id = null; // Asignar un valor predeterminado
    }

    console.log('Producto seleccionado:', product.product_id); // Verifica el ID del producto
    console.log('Estado del producto:', product); // Depuración: muestra el estado completo del producto

    // Navega a la página del producto con el ID
    this.router.navigate(['/producto', product.product_id]);
  }

  async increaseCount(product: Product) {
    if (product.current_count < product.max_amount) {
      product.current_count += 1;
    } else {
      await this.presentAlert(
        'Límite alcanzado',
        `Has alcanzado el stock máximo permitido: ${product.max_amount}`,
        'warning'
      );
    }
  }

  async decreaseCount(product: Product) {
    if (product.current_count > 0) {
      product.current_count--;
    } else {
      await this.presentAlert(
        'Acción no permitida',
        'No se puede disminuir, el contador ya está en 0',
        'warning'
      );
    }
  }

  private async presentAlert(
    header: string,
    message: string,
    alertType: 'success' | 'warning' | 'error' = 'warning'
  ) {
    // Define colores según el tipo de alerta
    const colorMap = {
      success: 'success',
      warning: 'warning',
      error: 'danger'
    };
  
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: `custom-alert ${colorMap[alertType]}`,
      mode: 'ios' // Puedes usar 'md' para Android o quitarlo para que se adapte
    });
  
    await alert.present();
  }

  async confirmAction(product: Product) {
    const adjustment = product.current_count - product.current_stock;
    
    // Si no hay cambios, mostrar alerta y salir
    if (adjustment === 0) {
      await this.presentAlert(
        'Sin cambios',
        'No se detectaron cambios en el inventario',
        'warning'
      );
      return;
    }
  
    // Mostrar alerta de confirmación antes de actualizar
    const confirm = await this.alertController.create({
      header: 'Confirmar acción',
      message: `¿Estás seguro de ${adjustment > 0 ? 'aumentar' : 'reducir'} el stock en ${Math.abs(adjustment)} unidades?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Confirmar',
          handler: () => this.executeInventoryUpdate(product, adjustment)
        }
      ]
    });
  
    await confirm.present();
  }
  
  private async executeInventoryUpdate(product: Product, adjustment: number) {
    // Mostrar loader mientras se procesa
    const loading = await this.presentLoading('Actualizando inventario...');
    
    try {
      this.inventoryService.updateInventory(product.product_id, adjustment).subscribe({
        next: async (response: any) => {
          await loading.dismiss();
          
          if (response.success) {
            // Actualizar valores locales
            product.current_stock = response.new_stock;
            product.current_count = response.new_stock;
            
            // Mostrar alerta de éxito
            await this.presentAlert(
              '¡Éxito!',
              `Inventario actualizado correctamente. Nuevo stock: ${response.new_stock}`,
              'success'
            );
            
            // Recargar datos manteniendo filtros
            await this.reloadDataPreservingFilters();
          } else {
            await this.presentAlert(
              'Error',
              `No se pudo actualizar el inventario: ${response.message}`,
              'error'
            );
          }
        },
        error: async (error) => {
          await loading.dismiss();
          await this.presentAlert(
            'Error',
            `Ocurrió un error al actualizar: ${error.message || 'Error desconocido'}`,
            'error'
          );
        }
      });
    } catch (error) {
      await loading.dismiss();
      await this.presentAlert(
        'Error',
        'Ocurrió un error inesperado',
        'error'
      );
    }
  }
  
  private async reloadDataPreservingFilters() {
    // Guardar el estado actual de los filtros
    const currentFilters = {
      searchTerm: this.searchTerm,
      selectedCategory: this.selectedCategory,
      selectedSubCategory: this.selectedSubCategory,
      selectedSort: this.selectedSort
    };
  
    // Mostrar loader mientras se recargan los datos
    const loading = await this.presentLoading('Actualizando lista...');
    
    try {
      // Recargar productos
      await this.fetchProducts();
      
      // Reaplicar los filtros guardados
      this.searchTerm = currentFilters.searchTerm;
      this.selectedCategory = currentFilters.selectedCategory;
      this.selectedSubCategory = currentFilters.selectedSubCategory;
      this.selectedSort = currentFilters.selectedSort;
      
      this.applyFilters();
    } catch (error) {
      console.error('Error al recargar datos:', error);
    } finally {
      await loading.dismiss();
    }
  }
  
  private async presentLoading(message: string) {
    const loading = await this.loadingController.create({
      message,
      spinner: 'crescent',
      translucent: true
    });
    
    await loading.present();
    return loading;
  }

  getButtonColor(product: Product): string {
    if (product.current_count > product.current_stock) {
      return 'success'; // Verde si incrementa
    } else if (product.current_count < product.current_stock) {
      return 'danger'; // Rojo si decrementa
    } else {
      return 'medium'; // Neutro si es igual
    }
  }

  getDynamicText(product: Product): string {
    if (product.current_count > product.current_stock) {
      return 'Agregar a Stock'; // Texto para incremento
    } else if (product.current_count < product.current_stock) {
      return 'Venta'; // Texto para decremento
    } else if (product.current_count === product.current_stock) {
      return 'Stock Disponible';
    } else {
      return 'None';
    }
  }

  // Método que inicializa los valores de los productos
  initializeProducts(product: Product) {
    if (typeof product.current_stock !== 'undefined') {
      product.current_count = product.current_stock; // Inicializa current_count con current_stock
    } else {
      console.warn('current_stock no está definido para el producto:', product);
      product.current_count = 0; // Valor predeterminado en caso de no estar definido
    }
  }

  onDrag(slidingItem: IonItemSliding, product: Product) {
    console.log('Evento ionDrag detectado'); // Log para verificar que el evento se está ejecutando

    // Verifica que el producto esté completamente cargado
    if (!product || !product.product_id || !product.sub_category_id) {
      console.warn('El producto no está completamente cargado:', product);
      slidingItem.close(); // Cierra el sliding item si el producto no está listo
      return;
    }

    // Obtén la proporción del deslizamiento
    slidingItem.getSlidingRatio().then((ratio) => {
      console.log('Proporción del deslizamiento (ratio):', ratio); // Log para ver el valor del ratio

      // Si el deslizamiento es mayor a 1 (completamente deslizado), ejecuta la acción
      if (ratio > 1) {
        console.log('Deslizamiento completado, ejecutando viewProduct...'); // Log antes de ejecutar la acción

        // Agregar un pequeño retraso para asegurar que el producto esté listo
        setTimeout(() => {
          this.viewProduct(product); // Pasa el producto completo
          slidingItem.close(); // Cierra el elemento deslizable
        }, 100); // Retraso de 100ms
      }
    }).catch((error) => {
      console.error('Error al obtener la proporción del deslizamiento:', error); // Log en caso de error
    });
  }

  ionViewDidEnter() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;
    if (navigation?.extras?.state?.['timestamp']) {
      // Cargar productos, categorías y subcategorías
      this.fetchProducts();
      this.fetchCategories();
      this.fetchSubCategories();
    }
    if (state?.['updatedProduct']) {
      this.actualizarProductoEnLista(state['updatedProduct']);
    }
  }

  
  actualizarProductoEnLista(updatedProduct: any) {
    const index = this.products.findIndex(p => p.product_id === updatedProduct.product_id);
    if (index !== -1) {
      // Actualiza solo el campo hide_product manteniendo el resto de datos
      this.products[index].hide_product = updatedProduct.hide_product;
      
      // Si usas ChangeDetection.OnPush:
      this.products = [...this.products]; // Crea nueva referencia para trigger de detección de cambios
    }
  }
}