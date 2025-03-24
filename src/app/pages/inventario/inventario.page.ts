import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { AuthService } from '../../services/auth.service';
import { IonItemSliding } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { ImageStateService } from '../../services/image-state.service';

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

  // Propiedades para la paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Variables para manejar el doble click
  private lastClickTime: number = 0;
  private doubleClickDelay: number = 300; // Retraso para considerar un doble click (en milisegundos)

  constructor(
    private inventoryService: InventoryService, // Inyecta InventoryService para obtener productos
    private router: Router, // Inyecta Router para la navegación
    private authService: AuthService,   // Inyecta AuthService para verificar
    private cdr: ChangeDetectorRef, // Inyecta ChangeDetectorRef para actualizar la vista
    public imageState: ImageStateService // Inyecta el servicio de estado de imagen
  ) {}

  ngOnInit() {
    console.log('Inicializando página de inventario...');
    this.isAdmin = this.authService.isAdmin(); // Verificar si es administrador

    // Cargar productos, categorías y subcategorías
    this.fetchProducts();
    this.fetchCategories();
    this.fetchSubCategories();
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

  fetchProducts() {
    this.inventoryService.getProducts(this.searchTerm).subscribe(
      (response) => {
        if (response && response.success) {
          // Normalizar los productos al cargarlos
          this.products = response.data.map((product: any) => this.normalizeProduct(product));
  
          // Inicializar los valores de los productos
          this.products.forEach(product => this.initializeProducts(product));
  
          // Asignar valores después de cargar los productos
          this.assignValuesToProducts();
  
          this.filteredProducts = this.products; // Inicializa la lista filtrada
          this.applyFilters(); // Aplica los filtros iniciales
          this.loadMoreProducts(); // Carga los primeros productos
  
          // Forzar la detección de cambios
          this.cdr.detectChanges();
        } else {
          console.warn('Respuesta no válida de la API:', response);
        }
      },
      (error) => {
        console.error('Error al obtener productos:', error);
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
    this.currentPage = 1;
    this.displayedProducts = [];
    this.loadMoreProducts();

    this.cdr.detectChanges(); // Forzar la detección de cambios
  }

  normalizeText(text: string): string {
    return text
      .normalize('NFD') // Normaliza a forma descompuesta (NFD)
      .replace(/[\u0300-\u036f]/g, ''); // Elimina los caracteres diacríticos
  }

  applyFilters() {
    let filtered = [...this.products]; // Crear una copia de los productos
  
    // Filtrar por categoría
    if (this.selectedCategory) {
      const selectedCategoryId = Number(this.selectedCategory); // Convertir a número
      filtered = filtered.filter((product) => {
        return product && product.category_id === selectedCategoryId;
      });
    }
  
    // Filtrar por subcategoría
    if (this.selectedSubCategory) {
      const selectedSubCategoryId = Number(this.selectedSubCategory); // Convertir a número
      filtered = filtered.filter((product) => {
        return product && (product.sub_category_id === selectedSubCategoryId || !product.sub_category_id);
      });
    }
  
    // Ordenar
    if (this.selectedSort === 'recent') {
      filtered = filtered.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } else if (this.selectedSort === 'alphabetical') {
      filtered = filtered.sort((a, b) => a.product_name.localeCompare(b.product_name));
    }
  
    // Normalizar los productos después de aplicar los filtros
    this.filteredProducts = filtered.map((product) => this.normalizeProduct(product));
  
    // Reiniciar la paginación y cargar los primeros productos
    this.currentPage = 1;
    this.displayedProducts = [];
    this.loadMoreProducts();
  
    // Forzar la detección de cambios
    this.cdr.detectChanges();
  }

  // Método para normalizar un producto
  normalizeProduct(product: Product): Product {
    return {
      image_url: product.image_url || 'assets/product_placeholder.png',
      product_id: product.product_id || 0,
      product_name: product.product_name || 'Producto sin nombre',
      credit_price: product.credit_price || 0,
      updated_at: product.updated_at || new Date().toISOString(),
      category_id: product.category_id || null,
      current_count: product.current_count || 0,
      current_stock: product.current_stock || 0,
      max_amount: product.max_amount || 0,
      prov_price: product.prov_price || '0.00',
      provider_name: product.provider_name || 'Proveedor desconocido',
      sub_category_id: product.sub_category_id || null, // Valor predeterminado para sub_category_id
    };
  }

  loadMoreProducts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    // Obtén los nuevos productos de la lista filtrada
    const newProducts = this.filteredProducts.slice(startIndex, endIndex);

    // Concatena los nuevos productos a la lista existente
    this.displayedProducts = this.displayedProducts.concat(newProducts);

    // Incrementa la página para la próxima carga
    this.currentPage++;
  }

  showMoreProducts() {
    this.currentPage++; // Incrementa la página actual
    this.loadMoreProducts(); // Carga los siguientes productos
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

  increaseCount(product: Product) {
    if (product.current_count < product.max_amount) {
      product.current_count = product.current_count ? product.current_count + 1 : product.current_stock + 1;
    } else {
      console.warn(`No se puede incrementar, valor máximo alcanzado (${product.max_amount})`);
      alert(`Has alcanzado el stock máximo permitido: ${product.max_amount}`);
    }
  }

  decreaseCount(product: Product) {
    if (product.current_count > 0) {
      product.current_count--;
    }
  }

  confirmAction(product: Product) {
    const adjustment = product.current_count - product.current_stock;
    if (adjustment === 0) {
      return;
    }

    this.inventoryService.updateInventory(product.product_id, adjustment).subscribe({
      next: (response: any) => {
        if (response.success) {
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
    if (navigation?.extras?.state?.['timestamp']) {
      // Cargar productos, categorías y subcategorías
      this.fetchProducts();
      this.fetchCategories();
      this.fetchSubCategories();
    }
  }
}