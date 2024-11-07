import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarProveedorPage } from './agregar-proveedor.page';

describe('AgregarProveedorPage', () => {
  let component: AgregarProveedorPage;
  let fixture: ComponentFixture<AgregarProveedorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarProveedorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
