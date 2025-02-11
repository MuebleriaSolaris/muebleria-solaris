import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarcasProductosPage } from './marcas-productos.page';

describe('MarcasProductosPage', () => {
  let component: MarcasProductosPage;
  let fixture: ComponentFixture<MarcasProductosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MarcasProductosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
