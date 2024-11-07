import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarClientesPage } from './agregar-clientes.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarClientesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarClientesPageRoutingModule {}
