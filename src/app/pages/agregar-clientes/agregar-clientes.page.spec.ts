import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarClientesPage } from './agregar-clientes.page';

describe('AgregarClientesPage', () => {
  let component: AgregarClientesPage;
  let fixture: ComponentFixture<AgregarClientesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarClientesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
