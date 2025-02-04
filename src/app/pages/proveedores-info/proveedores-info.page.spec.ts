import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProveedoresInfoPage } from './proveedores-info.page';

describe('ProveedoresInfoPage', () => {
  let component: ProveedoresInfoPage;
  let fixture: ComponentFixture<ProveedoresInfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProveedoresInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
