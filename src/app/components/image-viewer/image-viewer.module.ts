import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ImageViewerComponent } from './image-viewer.component';

@NgModule({
  declarations: [ImageViewerComponent], // Declara el componente
  imports: [
    CommonModule,
    IonicModule, // Importa IonicModule
  ],
  exports: [ImageViewerComponent], // Exporta el componente para que otros módulos puedan usarlo
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Agrega CUSTOM_ELEMENTS_SCHEMA
})
export class ImageViewerModule {}