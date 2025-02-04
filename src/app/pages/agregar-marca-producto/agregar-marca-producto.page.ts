import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../services/inventory.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-agregar-marca-producto',
  templateUrl: './agregar-marca-producto.page.html',
  styleUrls: ['./agregar-marca-producto.page.scss'],
})
export class AgregarMarcaProductoPage implements OnInit {
  newBrand: any = {
    name: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  constructor(
    private inventoryService: InventoryService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {}

  // Método para guardar la marca
  saveBrand() {
    this.inventoryService.saveBrand(this.newBrand).subscribe({
      next: (response) => {
        console.log('API Response:', response)
        // Redirige a la lista de marcas o muestra una confirmación
        // this.navCtrl.navigateBack('/marcas');
      },
      error: (error) => {
        console.error('API Error:', error);
      },
    });
  }
}
