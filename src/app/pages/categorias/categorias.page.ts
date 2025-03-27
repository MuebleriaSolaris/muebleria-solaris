import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.page.html',
  styleUrls: ['./categorias.page.scss'],
})
export class CategoriasPage implements OnInit {
  subcategories: any[] = []; // Lista de subcategorías

  constructor(
    private inventoryService: InventoryService, // Inyecta InventoryService
    private router: Router, // Inyecta Router
    private alertController: AlertController   // Inyecta AlertController
  ) {}

  ngOnInit() {
    this.loadSubcategories();
  }
  
  // Cargar subcategorías usando el servicio
  loadSubcategories() {
    this.inventoryService.getSubs().subscribe({
      next: (response) => {
        if (response.success) {
          this.subcategories = response.data;
        } else {
          console.warn('No se pudieron cargar las subcategorías:', response.message);
        }
      },
      error: (error) => {
        console.error('Error al cargar subcategorías:', error);
      },
    });
  }

  // Formatear fecha para mostrar
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Redirigir a la página de detalles
  viewSubcategoryDetails(id: number) {
    this.router.navigate(['/sub-categorias-info', id]);
  }

  // Ir a la página de agregar subcategoría
  goToAddSubcategory() {
    this.router.navigate(['/agregar-subcategoria']);
  }

  // Confirmar eliminación
  async confirmDelete(subcategory: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Eliminar la subcategoría "${subcategory.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteSubcategory(subcategory.id);
          }
        }
      ]
    });

    await alert.present();
  }

  // Eliminar subcategoría
  deleteSubcategory(id: number) {
    this.inventoryService.deleteSubcategory(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadSubcategories(); // Recargar la lista
        } else {
          console.warn('No se pudo eliminar la subcategoría:', response.message);
        }
      },
      error: (error) => {
        console.error('Error al eliminar subcategoría:', error);
      },
    });
  }
}