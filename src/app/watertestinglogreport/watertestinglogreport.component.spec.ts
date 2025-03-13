import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatertestinglogreportComponent } from './watertestinglogreport.component';

describe('WatertestinglogreportComponent', () => {
  let component: WatertestinglogreportComponent;
  let fixture: ComponentFixture<WatertestinglogreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatertestinglogreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WatertestinglogreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
