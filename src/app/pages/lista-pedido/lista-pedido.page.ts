import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-lista-pedido',
  templateUrl: './lista-pedido.page.html',
  styleUrls: ['./lista-pedido.page.scss'],
})
export class ListaPedidoPage implements OnInit {
  providerId: number | null = null;
  providerName: string = '';
  providerProducts: any[] = [];
  totalCost: number = 0; // Total general
  isLargeScreen: boolean = window.innerWidth > 425; // Detectar tamaño de la pantalla

  constructor(
    private route: ActivatedRoute,
    private inventoryService: InventoryService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    // Inicialización básica
    this.providerId = Number(this.route.snapshot.paramMap.get('id'));
  }

  // Este evento se ejecuta cada vez que la página está por mostrarse
  ionViewWillEnter() {
    if (this.providerId) {
      this.loadProviderProducts(this.providerId);
    }
  }

  // Escuchar cambios en el tamaño de la ventana
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isLargeScreen = event.target.innerWidth > 425;
  }

  loadProviderProducts(providerId: number) {
    this.inventoryService.getProductsByProvider(providerId).subscribe({
      next: (response) => {
        if (response.success) {
          
          this.providerProducts = response.data; // Asignar datos de productos

          if (this.providerProducts.length > 0) {
            this.providerName = this.providerProducts[0]?.provider_name || '';
          }

          // Calcular el costo total general
          this.calculateTotalCost();
          // El nombre del proveedor ya estará incluido en los datos si usas la consulta SQL actualizada.
        } else {
          console.warn('No se pudieron cargar los productos del proveedor.');
        }
      },
      error: (error) => {
        console.error('Error al cargar productos del proveedor:', error);
      },
    });
    
  }
  
  getProductsWithMissingItems() {
    return this.providerProducts.filter(item => {
      // Filtrar productos que:
      // 1. Tengan faltantes (max_amount - current_stock > 0)
      // 2. NO estén ocultos (hide_product !== 1)
      return (item.max_amount - item.current_stock) > 0 && item.hide_product !== 1;
    });
  }

  calculateTotalCost() {
    this.totalCost = this.providerProducts.reduce((acc, item) => {
      // Solo sumar al total si el producto no está oculto
      if (item.hide_product !== 1) {
        const faltantes = item.max_amount - item.current_stock;
        return acc + faltantes * item.credit_price;
      }
      return acc;
    }, 0);
  }

  goBack() {
    this.navCtrl.back(); // Navega a la página anterior
  }

}
