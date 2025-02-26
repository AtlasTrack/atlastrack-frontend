import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetpasswordotppageComponent } from './forgetpasswordotppage.component';

describe('ForgetpasswordotppageComponent', () => {
  let component: ForgetpasswordotppageComponent;
  let fixture: ComponentFixture<ForgetpasswordotppageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgetpasswordotppageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgetpasswordotppageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
