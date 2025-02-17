import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuariosInfoPageRoutingModule } from './usuarios-info-routing.module';

import { UsuariosInfoPage } from './usuarios-info.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuariosInfoPageRoutingModule
  ],
  declarations: [UsuariosInfoPage]
})
export class UsuariosInfoPageModule {}
