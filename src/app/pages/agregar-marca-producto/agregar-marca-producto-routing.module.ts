import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarMarcaProductoPage } from './agregar-marca-producto.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarMarcaProductoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarMarcaProductoPageRoutingModule {}
