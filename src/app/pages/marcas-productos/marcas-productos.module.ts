import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarcasProductosPageRoutingModule } from './marcas-productos-routing.module';

import { MarcasProductosPage } from './marcas-productos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarcasProductosPageRoutingModule
  ],
  declarations: [MarcasProductosPage]
})
export class MarcasProductosPageModule {}
