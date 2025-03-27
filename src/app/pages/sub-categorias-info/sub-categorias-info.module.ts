import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SubCategoriasInfoPageRoutingModule } from './sub-categorias-info-routing.module';

import { SubCategoriasInfoPage } from './sub-categorias-info.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SubCategoriasInfoPageRoutingModule
  ],
  declarations: [SubCategoriasInfoPage]
})
export class SubCategoriasInfoPageModule {}
