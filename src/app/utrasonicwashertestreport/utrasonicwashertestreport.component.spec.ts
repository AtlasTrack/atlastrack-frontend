import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtrasonicwashertestreportComponent } from './utrasonicwashertestreport.component';

describe('UtrasonicwashertestreportComponent', () => {
  let component: UtrasonicwashertestreportComponent;
  let fixture: ComponentFixture<UtrasonicwashertestreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtrasonicwashertestreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtrasonicwashertestreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
