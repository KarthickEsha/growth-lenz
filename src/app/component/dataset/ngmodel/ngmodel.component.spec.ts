import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgmodelComponent } from './ngmodel.component';

describe('NgmodelComponent', () => {
  let component: NgmodelComponent;
  let fixture: ComponentFixture<NgmodelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NgmodelComponent]
    });
    fixture = TestBed.createComponent(NgmodelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
