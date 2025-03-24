import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';  // Import AuthService


// Import the new MenuComponent
import { MenuComponent } from './components/menu/menu.component';
//import { ImageViewerComponent } from './components/image-viewer/image-viewer.component'; // Importa el componente

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent, // Declare MenuComponent here
    //ImageViewerComponent, // Declara el componente ImageViewerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AuthService  // AuthService should be provided here or directly in the service file
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
