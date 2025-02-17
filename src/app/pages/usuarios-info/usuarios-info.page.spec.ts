import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuariosInfoPage } from './usuarios-info.page';

describe('UsuariosInfoPage', () => {
  let component: UsuariosInfoPage;
  let fixture: ComponentFixture<UsuariosInfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuariosInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
