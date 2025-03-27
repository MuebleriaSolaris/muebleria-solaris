import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubCategoriasInfoPage } from './sub-categorias-info.page';

describe('SubCategoriasInfoPage', () => {
  let component: SubCategoriasInfoPage;
  let fixture: ComponentFixture<SubCategoriasInfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SubCategoriasInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
