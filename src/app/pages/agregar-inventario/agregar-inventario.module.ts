import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarInventarioPageRoutingModule } from './agregar-inventario-routing.module';

import { AgregarInventarioPage } from './agregar-inventario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarInventarioPageRoutingModule
  ],
  declarations: [AgregarInventarioPage]
})
export class AgregarInventarioPageModule {}
