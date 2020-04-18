import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkshopEditComponent } from './workshop-edit.component';

describe('WorkshopEditComponent', () => {
  let component: WorkshopEditComponent;
  let fixture: ComponentFixture<WorkshopEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkshopEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkshopEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
