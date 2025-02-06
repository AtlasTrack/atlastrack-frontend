import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicsdashboardComponent } from './clinicsdashboard.component';

describe('ClinicsdashboardComponent', () => {
  let component: ClinicsdashboardComponent;
  let fixture: ComponentFixture<ClinicsdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicsdashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicsdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
