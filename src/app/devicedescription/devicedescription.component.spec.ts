import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicedescriptionComponent } from './devicedescription.component';

describe('DevicedescriptionComponent', () => {
  let component: DevicedescriptionComponent;
  let fixture: ComponentFixture<DevicedescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevicedescriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevicedescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
