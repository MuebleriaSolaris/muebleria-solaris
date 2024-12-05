// src/app/pages/agregar-clientes/agregar-clientes.page.ts
import { Component } from '@angular/core';
import { ClientesService } from '../../services/clientes.services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agregar-clientes',
  templateUrl: './agregar-clientes.page.html',
  styleUrls: ['./agregar-clientes.page.scss'],
})
export class AgregarClientesPage {
  newClient = {
    name: '',
    address: '',
    phone: '',
    type: 0
  };

  constructor(private clientesService: ClientesService, private router: Router) {}

  capitalizeName() {
    if (this.newClient.name) {
      this.newClient.name = this.newClient.name
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
    }
  }

  saveClient() {
    this.clientesService.addClient(this.newClient).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          console.log(response.message);
          this.router.navigate(['/clientes']); // Navigate back to clients page after success
        } else {
          console.error(response.message);
        }
      },
      error: (error) => {
        console.error('Error saving client:', error);
      }
    });
  }

  validateNumericInput(event: any) {
    let input = event.target.value;
  
    // Reemplaza caracteres no numéricos
    input = input.replace(/[^0-9]/g, '');
  
    // Limita a 10 caracteres
    if (input.length > 10) {
      input = input.slice(0, 10);
    }
  
    // Actualiza el valor del campo
    event.target.value = input;
    this.newClient.phone = input; // Sincroniza con el modelo
  }
  
  
}
