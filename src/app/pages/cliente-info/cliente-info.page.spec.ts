import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClienteInfoPage } from './cliente-info.page';

describe('ClienteInfoPage', () => {
  let component: ClienteInfoPage;
  let fixture: ComponentFixture<ClienteInfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClienteInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
