import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-sub-categorias-info',
  templateUrl: './sub-categorias-info.page.html',
  styleUrls: ['./sub-categorias-info.page.scss'],
})
export class SubCategoriasInfoPage implements OnInit {
  subcategory: any = {};
  isEditMode: boolean = false;
  subcategoryId!: string;
  categoryName!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventoryService: InventoryService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.subcategoryId = this.route.snapshot.paramMap.get('id') || '';
    
    if (this.subcategoryId) {
      this.loadSubcategoryInfo(this.subcategoryId);
    } else {
      console.warn('No se recibió ningún ID en la URL.');
    }
  }

  loadSubcategoryInfo(id: string) {
    this.inventoryService.getSubcategoryById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.subcategory = response.data;
          // Cargar nombre de categoría
          this.loadCategoryName(this.subcategory.category_id || 14);
        } else {
          console.warn('No se encontró la subcategoría con el ID:', id);
          this.showAlert('Error', 'Subcategoría no encontrada');
        }
      },
      error: (error) => {
        console.error('Error al cargar la subcategoría:', error);
        this.showAlert('Error', 'Ocurrió un error al cargar la subcategoría');
      },
    });
  }

  loadCategoryName(categoryId: number) {
    this.inventoryService.getCategoryName(categoryId).subscribe({
      next: (response) => {
        if (response.success) {
          this.categoryName = response.data.name;
        } else {
          this.categoryName = 'Categoría General'; // Valor por defecto
        }
      },
      error: () => {
        this.categoryName = 'Categoría General'; // Valor por defecto si hay error
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  async confirmSaveChanges() {
    const alert = await this.alertController.create({
      header: 'Confirmar Actualización',
      message: '¿Estás seguro de que deseas actualizar esta subcategoría?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Actualizar',
          handler: () => {
            this.saveChanges();
          },
        },
      ],
    });

    await alert.present();
  }

  saveChanges() {
    const updatedSubcategory = {
      id: this.subcategory.id, // Asegúrate que esto tenga el ID correcto
      name: this.subcategory.name,
      category_id: this.subcategory.category_id || 14
    };
  
    this.inventoryService.updateSubcategory(updatedSubcategory).subscribe({
      next: (response) => {
        if (response.success) {
          this.showAlert('Éxito', 'Subcategoría actualizada correctamente');
          this.subcategory.updated_at = response.updated_at; // Actualiza la fecha
          this.isEditMode = false;
        } else {
          this.showAlert('Error', response.message);
        }
      },
      error: (error) => {
        console.error('Error al actualizar la subcategoría:', error);
        this.showAlert('Error', 'Ocurrió un error al actualizar la subcategoría');
      },
    });
  }

  async confirmDelete() {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar esta subcategoría?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteSubcategory();
          },
        },
      ],
    });

    await alert.present();
  }

  deleteSubcategory() {
    this.inventoryService.deleteSubcategory(this.subcategory.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.showAlert('Éxito', 'Subcategoría eliminada correctamente');
          this.router.navigate(['/categorias']);
        } else {
          this.showAlert('Error', 'Error al eliminar la subcategoría: ' + response.message);
        }
      },
      error: (error) => {
        console.error('Error al eliminar la subcategoría:', error);
        this.showAlert('Error', 'Ocurrió un error al eliminar la subcategoría');
      },
    });
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  cancelEdit() {
    this.isEditMode = false;
    this.loadSubcategoryInfo(this.subcategory.id);
  }

  goBack() {
    this.router.navigate(['/categorias']);
  }
}