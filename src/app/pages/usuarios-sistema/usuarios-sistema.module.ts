import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuariosSistemaPageRoutingModule } from './usuarios-sistema-routing.module';

import { UsuariosSistemaPage } from './usuarios-sistema.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuariosSistemaPageRoutingModule
  ],
  declarations: [UsuariosSistemaPage]
})
export class UsuariosSistemaPageModule {}
