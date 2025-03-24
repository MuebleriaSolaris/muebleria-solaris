import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AgregarInventarioPageRoutingModule } from './agregar-inventario-routing.module';
import { AgregarInventarioPage } from './agregar-inventario.page';
import { ImageViewerModule } from '../../components/image-viewer/image-viewer.module'; // Importa el módulo

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarInventarioPageRoutingModule,
    ImageViewerModule, // Importa el módulo del componente
  ],
  declarations: [AgregarInventarioPage]
})
export class AgregarInventarioPageModule {}
