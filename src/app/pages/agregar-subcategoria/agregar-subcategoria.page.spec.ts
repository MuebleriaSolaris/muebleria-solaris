import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarSubcategoriaPage } from './agregar-subcategoria.page';

describe('AgregarSubcategoriaPage', () => {
  let component: AgregarSubcategoriaPage;
  let fixture: ComponentFixture<AgregarSubcategoriaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarSubcategoriaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
