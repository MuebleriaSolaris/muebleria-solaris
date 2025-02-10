// src/app/pages/cliente-info/cliente-info.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular';


interface CustomerInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
  type: number;
  updated_at: string;
}

@Component({
  selector: 'app-cliente-info',
  templateUrl: './cliente-info.page.html',
  styleUrls: ['./cliente-info.page.scss'],
})
export class ClienteInfoPage implements OnInit {
  customerInfo: CustomerInfo | null = null;
  isEditMode = false; // Toggle for edit mode
  originalCustomerInfo: CustomerInfo | null = null; // Store original data for cancel functionality

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
  ) {}

  ngOnInit() {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId) {
      this.fetchCustomerInfo(customerId);
    }
  }

  fetchCustomerInfo(id: string) {
    this.http.get<{ status: string; data: CustomerInfo }>(`https://muebleriasolaris.com/ionic-users/cliente_id_info.php?id=${id}`)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.customerInfo = response.data;
            this.originalCustomerInfo = JSON.parse(JSON.stringify(response.data));
          } else {
            console.error('Failed to fetch customer information');
          }
        },
        error: (error) => {
          console.error('Error fetching customer info:', error);
        }
      });
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    
    if (this.isEditMode && this.customerInfo) {
      // Update updated_at to the current date and time
      this.customerInfo.updated_at = new Date().toLocaleString();
    } else if (!this.isEditMode) {
      // Reset to original data if cancelling
      this.customerInfo = JSON.parse(JSON.stringify(this.originalCustomerInfo));
    }
  }

  saveChanges() {
    if (this.customerInfo) {

      const alert = this.alertController.create({
        header: 'Confirmar actualización',
        message: `¿Estás seguro de que deseas actualizar a ${this.customerInfo?.name}?`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
          },
          {
            text: 'Actualizar',
            handler: () => {
              this.confirmchanges();
            },
          },
        ],
      });

      alert.then((alert) => alert.present());
      
    }
  }
  confirmchanges(){
    console.log('Customer Info to be updated:', this.customerInfo);
      
    // Enviar los datos actualizados al servidor
    this.http.post('https://muebleriasolaris.com/ionic-users/update_cliente_info.php', this.customerInfo)
      .subscribe({
        next: () => {
          console.log('Customer info updated successfully');
          this.isEditMode = false;
          this.originalCustomerInfo = JSON.parse(JSON.stringify(this.customerInfo)); // Update original data
          this.toastController
          .create({
            message: 'Cliente actualizado exitosamente.',
            duration: 2000,
            color: 'success',
          })
          .then((toast) => toast.present());
          // Redirigir a la página /clientes y recargarla
          window.location.href = '/clientes'; // Esto redirige y recarga la página
        },
        error: (error) => {
          console.error('Error updating customer info:', error);
        }
      });
  }
  
  cancelEdit() {
    if (this.originalCustomerInfo) {
      this.customerInfo = JSON.parse(JSON.stringify(this.originalCustomerInfo)); // Revert changes
    }
    this.isEditMode = false;
  }

  goBack() {
    this.router.navigate(['/clientes']);
  }

  // Utility function to get type text
  getCustomerTypeText(type: number | undefined): string {
    switch (type) {
      case 1:
        return 'Bueno';
      case 2:
        return 'Regular';
      case 0:
        return 'Malo';
      default:
        return 'Desconocido';
    }
  }

  // cliente-info.page.ts
  viewCustomerHistory() {
    if (this.customerInfo?.id) {
      this.router.navigate(['/historial-cliente', this.customerInfo.id]);
    } else {
      console.error('El ID del cliente no está definido');
    }
  }

  confirmDelete() {
    const alert = this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar a ${this.customerInfo?.name}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteCustomer();
          },
        },
      ],
    });
  
    alert.then((alert) => alert.present());
  }
  
  deleteCustomer() {
    this.http
      .post('https://muebleriasolaris.com/ionic-users/delete_cliente.php', {
        id: this.customerInfo?.id,
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/clientes']);
          this.toastController
            .create({
              message: 'Cliente eliminado exitosamente.',
              duration: 2000,
              color: 'success',
            })
            .then((toast) => toast.present());
        },
        error: (error) => {
          console.error('Error eliminando cliente:', error);
          this.toastController
            .create({
              message: 'Error al eliminar cliente. Intenta nuevamente.',
              duration: 2000,
              color: 'danger',
            })
            .then((toast) => toast.present());
        },
      });
  }
}
