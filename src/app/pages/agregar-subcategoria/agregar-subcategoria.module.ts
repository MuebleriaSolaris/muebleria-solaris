import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarSubcategoriaPageRoutingModule } from './agregar-subcategoria-routing.module';

import { AgregarSubcategoriaPage } from './agregar-subcategoria.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarSubcategoriaPageRoutingModule
  ],
  declarations: [AgregarSubcategoriaPage]
})
export class AgregarSubcategoriaPageModule {}
