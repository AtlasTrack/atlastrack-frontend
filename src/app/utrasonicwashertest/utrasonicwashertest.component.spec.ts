import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtrasonicwashertestComponent } from './utrasonicwashertest.component';

describe('UtrasonicwashertestComponent', () => {
  let component: UtrasonicwashertestComponent;
  let fixture: ComponentFixture<UtrasonicwashertestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtrasonicwashertestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtrasonicwashertestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
