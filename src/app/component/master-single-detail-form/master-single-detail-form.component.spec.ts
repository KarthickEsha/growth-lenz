import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MasterSingleDetailFormComponent } from './master-single-detail-form.component';

describe('MasterSingleDetailFormComponent', () => {
  let component: MasterSingleDetailFormComponent;
  let fixture: ComponentFixture<MasterSingleDetailFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterSingleDetailFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterSingleDetailFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
