import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardloginComponent } from './dashboardlogin.component';

describe('DashboardloginComponent', () => {
  let component: DashboardloginComponent;
  let fixture: ComponentFixture<DashboardloginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardloginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardloginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
