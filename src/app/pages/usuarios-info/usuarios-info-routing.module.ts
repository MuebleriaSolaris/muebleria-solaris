import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsuariosInfoPage } from './usuarios-info.page';

const routes: Routes = [
  {
    path: '',
    component: UsuariosInfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuariosInfoPageRoutingModule {}
