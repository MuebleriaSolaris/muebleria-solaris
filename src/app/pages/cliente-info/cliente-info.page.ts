// src/app/pages/cliente-info/cliente-info.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
    private router: Router
  ) {}

  ngOnInit() {
    const customerId = this.route.snapshot.paramMap.get('id');
    if (customerId) {
      this.fetchCustomerInfo(customerId);
    }
  }

  fetchCustomerInfo(id: string) {
    this.http.get<{ status: string; data: CustomerInfo }>(`http://localhost/ionic-users/cliente_id_info.php?id=${id}`)
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
      this.http.post('http://localhost/ionic-users/update_cliente_info.php', this.customerInfo)
        .subscribe({
          next: () => {
            console.log('Customer info updated successfully');
            this.isEditMode = false;
            this.originalCustomerInfo = JSON.parse(JSON.stringify(this.customerInfo)); // Update original data
          },
          error: (error) => {
            console.error('Error updating customer info:', error);
          }
        });
    }
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
}
