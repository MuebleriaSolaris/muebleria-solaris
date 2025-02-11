import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarcasProductosPage } from './marcas-productos.page';

const routes: Routes = [
  {
    path: '',
    component: MarcasProductosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarcasProductosPageRoutingModule {}
