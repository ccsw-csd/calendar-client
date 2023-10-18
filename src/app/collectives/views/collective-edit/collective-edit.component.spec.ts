import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectiveEditComponent } from './collective-edit.component';

describe('CollectiveEditComponent', () => {
  let component: CollectiveEditComponent;
  let fixture: ComponentFixture<CollectiveEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectiveEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectiveEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
