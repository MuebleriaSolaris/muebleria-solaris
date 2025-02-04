import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarMarcaProductoPageRoutingModule } from './agregar-marca-producto-routing.module';

import { AgregarMarcaProductoPage } from './agregar-marca-producto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarMarcaProductoPageRoutingModule
  ],
  declarations: [AgregarMarcaProductoPage]
})
export class AgregarMarcaProductoPageModule {}
