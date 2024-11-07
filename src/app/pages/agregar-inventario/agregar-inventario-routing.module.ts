import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarInventarioPage } from './agregar-inventario.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarInventarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarInventarioPageRoutingModule {}
