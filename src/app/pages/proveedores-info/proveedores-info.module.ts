import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProveedoresInfoPageRoutingModule } from './proveedores-info-routing.module';

import { ProveedoresInfoPage } from './proveedores-info.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProveedoresInfoPageRoutingModule
  ],
  declarations: [ProveedoresInfoPage]
})
export class ProveedoresInfoPageModule {}
