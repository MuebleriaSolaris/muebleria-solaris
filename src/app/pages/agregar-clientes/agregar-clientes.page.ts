// src/app/pages/agregar-clientes/agregar-clientes.page.ts
import { Component } from '@angular/core';
import { ClientesService } from '../../services/clientes.services';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

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
    type: 0,
  };

  constructor(
    private clientesService: ClientesService,
    private router: Router,
    private alertController: AlertController
  ) {}

  // Capitalizar el nombre
  capitalizeName() {
    if (this.newClient.name) {
      this.newClient.name = this.newClient.name
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }
  }

  // Método para validar y guardar el cliente
  async saveClient() {
    const { name, address, phone, type } = this.newClient;

    // Validar campos vacíos
    if (!name || !address || !phone || type === 0) {
      await this.showAlert(
        'Campos incompletos',
        'Por favor, llena todos los campos antes de guardar.'
      );
      return;
    }

    // Llamar al servicio para guardar el cliente
    this.clientesService.addClient(this.newClient).subscribe({
      next: async (response) => {
        if (response.status === 'success') {
          console.log(response.message);
          await this.showAlert('Éxito', 'Cliente guardado exitosamente.');
          this.resetForm();
          this.router.navigate(['/clientes']); // Navegar a la lista de clientes
        } else {
          await this.showAlert('Error', response.message);
          console.error(response.message);
        }
      },
      error: async (error) => {
        await this.showAlert(
          'Error',
          'Hubo un problema al guardar el cliente. Inténtalo más tarde.'
        );
        console.error('Error saving client:', error);
      },
    });
  }

  // Mostrar mensajes de alerta
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  // Limpiar el formulario después de guardar
  resetForm() {
    this.newClient = {
      name: '',
      address: '',
      phone: '',
      type: 0,
    };
  }

  // Validar entrada numérica para el teléfono
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
