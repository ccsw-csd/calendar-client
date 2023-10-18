import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterEditComponent } from './center-edit.component';

describe('CenterEditComponent', () => {
  let component: CenterEditComponent;
  let fixture: ComponentFixture<CenterEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CenterEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CenterEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
