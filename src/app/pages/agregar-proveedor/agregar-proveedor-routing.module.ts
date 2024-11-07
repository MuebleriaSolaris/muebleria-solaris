import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarProveedorPage } from './agregar-proveedor.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarProveedorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarProveedorPageRoutingModule {}
