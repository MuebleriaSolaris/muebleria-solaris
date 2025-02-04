import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProveedoresInfoPage } from './proveedores-info.page';

const routes: Routes = [
  {
    path: '',
    component: ProveedoresInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProveedoresInfoPageRoutingModule {}
