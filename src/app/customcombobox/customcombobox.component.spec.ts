import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomcomboboxComponent } from './customcombobox.component';

describe('CustomcomboboxComponent', () => {
  let component: CustomcomboboxComponent;
  let fixture: ComponentFixture<CustomcomboboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomcomboboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomcomboboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
