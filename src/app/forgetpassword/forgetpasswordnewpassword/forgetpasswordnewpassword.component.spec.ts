import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetpasswordnewpasswordComponent } from './forgetpasswordnewpassword.component';

describe('ForgetpasswordnewpasswordComponent', () => {
  let component: ForgetpasswordnewpasswordComponent;
  let fixture: ComponentFixture<ForgetpasswordnewpasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgetpasswordnewpasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgetpasswordnewpasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
