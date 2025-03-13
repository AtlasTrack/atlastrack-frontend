import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatertestinglogComponent } from './watertestinglog.component';

describe('WatertestinglogComponent', () => {
  let component: WatertestinglogComponent;
  let fixture: ComponentFixture<WatertestinglogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatertestinglogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WatertestinglogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
