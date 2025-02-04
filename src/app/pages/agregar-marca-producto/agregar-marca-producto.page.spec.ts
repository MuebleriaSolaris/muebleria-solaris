import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarMarcaProductoPage } from './agregar-marca-producto.page';

describe('AgregarMarcaProductoPage', () => {
  let component: AgregarMarcaProductoPage;
  let fixture: ComponentFixture<AgregarMarcaProductoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarMarcaProductoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
