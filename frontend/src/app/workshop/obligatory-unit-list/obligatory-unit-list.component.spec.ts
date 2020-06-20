import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObligatoryUnitListComponent } from './obligatory-unit-list.component';

describe('ObligatoryUnitListComponent', () => {
  let component: ObligatoryUnitListComponent;
  let fixture: ComponentFixture<ObligatoryUnitListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObligatoryUnitListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObligatoryUnitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
