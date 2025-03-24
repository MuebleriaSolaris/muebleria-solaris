import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarSubcategoriaPage } from './agregar-subcategoria.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarSubcategoriaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarSubcategoriaPageRoutingModule {}
