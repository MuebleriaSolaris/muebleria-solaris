import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientesPageRoutingModule } from './clientes-routing.module';

import { ClientesPage } from './clientes.page';

import { FooterComponent } from '../../components/footer/footer.component'; // Import the FooterComponent

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientesPageRoutingModule
  ],
  declarations: [ClientesPage, FooterComponent]
})
export class ClientesPageModule {}
