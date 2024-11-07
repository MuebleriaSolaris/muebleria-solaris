import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarInventarioPage } from './agregar-inventario.page';

describe('AgregarInventarioPage', () => {
  let component: AgregarInventarioPage;
  let fixture: ComponentFixture<AgregarInventarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarInventarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
