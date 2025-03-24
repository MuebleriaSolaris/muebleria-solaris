import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss'],
})
export class ImageViewerComponent {
  @Input() imageUrl: string | undefined; // Recibir la URL de la imagen

  constructor(private modalController: ModalController) {}

  // Método para cerrar el modal
  dismissModal() {
    this.modalController.dismiss();
  }
}