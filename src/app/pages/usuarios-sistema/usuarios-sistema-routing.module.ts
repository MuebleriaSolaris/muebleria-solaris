import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsuariosSistemaPage } from './usuarios-sistema.page';

const routes: Routes = [
  {
    path: '',
    component: UsuariosSistemaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuariosSistemaPageRoutingModule {}
