import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyformComponent } from './formlyform.component';

describe('FormlyformComponent', () => {
  let component: FormlyformComponent;
  let fixture: ComponentFixture<FormlyformComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormlyformComponent]
    });
    fixture = TestBed.createComponent(FormlyformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
