import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggridDesignComponent } from './aggrid-design.component';

describe('AggridDesignComponent', () => {
  let component: AggridDesignComponent;
  let fixture: ComponentFixture<AggridDesignComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AggridDesignComponent]
    });
    fixture = TestBed.createComponent(AggridDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
