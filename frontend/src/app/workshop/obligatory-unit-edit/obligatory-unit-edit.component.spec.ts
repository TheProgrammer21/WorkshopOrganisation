import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObligatoryUnitEditComponent } from './obligatory-unit-edit.component';

describe('ObligatoryUnitEditComponent', () => {
  let component: ObligatoryUnitEditComponent;
  let fixture: ComponentFixture<ObligatoryUnitEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObligatoryUnitEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObligatoryUnitEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
