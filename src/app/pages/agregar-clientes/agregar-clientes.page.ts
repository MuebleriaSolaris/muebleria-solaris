// src/app/pages/agregar-clientes/agregar-clientes.page.ts
import { Component } from '@angular/core';
import { ClientesService } from '../../services/clientes.services';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Location } from '@angular/common';

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
    private alertController: AlertController,
    private toastController: ToastController,
    private location: Location,
  ) {}

  // Capitalizar el nombre
  capitalizeName(event: any) {
    const inputElement = event.target;
    const cursorPosition = inputElement.selectionStart; // Guarda la posición del cursor
  
    if (this.newClient.name) {
      this.newClient.name = this.newClient.name
        .toLowerCase()
        .replace(/(^|\s)\p{L}/gu, (match) => match.toUpperCase());
    }
  
    setTimeout(() => {
      inputElement.setSelectionRange(cursorPosition, cursorPosition); // Restaura el cursor
    }, 0);
  }
  

  // Método para validar y guardar el cliente
  async saveClient() {
    const { name, address, phone, type } = this.newClient;

    if (!this.newClient.type) {
      this.newClient.type = 0; // Asignar un valor por defecto si no se selecciona
    }

    // Validar campos vacíos
    if (!name || !address || !phone) {
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
          this.toastController
            .create({
              message: 'Cliente guardado exitosamente.',
              duration: 4000,
              color: 'success',
            })
            .then((toast) => toast.present());
          console.log(response.message);
          this.resetForm();
          // Retrasar la recarga de la página para que el toast se muestre
          setTimeout(() => {
            this.location.go('/clientes');
            window.location.reload();
          }, 2000); // Retraso de 2 segundos (ajusta según sea necesario)
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
  
  // Validar si el campo tiene valor
  hasValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
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
