import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistorialClientePageRoutingModule } from './historial-cliente-routing.module';

import { HistorialClientePage } from './historial-cliente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistorialClientePageRoutingModule
  ],
  declarations: [HistorialClientePage]
})
export class HistorialClientePageModule {}
