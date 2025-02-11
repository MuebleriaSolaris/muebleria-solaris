import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuariosSistemaPage } from './usuarios-sistema.page';

describe('UsuariosSistemaPage', () => {
  let component: UsuariosSistemaPage;
  let fixture: ComponentFixture<UsuariosSistemaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuariosSistemaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
