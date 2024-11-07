import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarClientesPageRoutingModule } from './agregar-clientes-routing.module';

import { AgregarClientesPage } from './agregar-clientes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarClientesPageRoutingModule
  ],
  declarations: [AgregarClientesPage]
})
export class AgregarClientesPageModule {}
