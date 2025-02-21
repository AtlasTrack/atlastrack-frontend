import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetpasswordemailpageComponent } from './forgetpasswordemailpage.component';

describe('ForgetpasswordemailpageComponent', () => {
  let component: ForgetpasswordemailpageComponent;
  let fixture: ComponentFixture<ForgetpasswordemailpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgetpasswordemailpageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgetpasswordemailpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
