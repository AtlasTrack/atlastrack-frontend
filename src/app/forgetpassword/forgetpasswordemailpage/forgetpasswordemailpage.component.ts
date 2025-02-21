import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { countryCodes } from '../../countrycode';

@Component({
  selector: 'app-forgetpasswordemailpage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgetpasswordemailpage.component.html',
  styleUrl: './forgetpasswordemailpage.component.css'
})
export class ForgetpasswordemailpageComponent {
  phoneForm: FormGroup;
  countrycode = countryCodes;
  
  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.phoneForm = this.fb.group({
      countryCode: ['+92', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,12}$')]]
    });
  }

  getSelectedCountryName() {
    const selectedCode = this.phoneForm.get('countryCode')?.value;
    const country = this.countrycode.find(c => c.code === selectedCode);
    return country ? country.country : '';
  }

  onSendOTPClick() {
    if (this.phoneForm.valid) {
      const fullPhoneNumber = this.phoneForm.get('countryCode')?.value + this.phoneForm.get('phoneNumber')?.value;
      
      // Navigate to OTP page with phone number as query param
      this.router.navigate(['forgetpasswordotp'], { 
        queryParams: { phone: fullPhoneNumber } 
      });
    } else {
      // Mark form controls as touched to show validation errors
      Object.keys(this.phoneForm.controls).forEach(key => {
        this.phoneForm.get(key)?.markAsTouched();
      });
    }
  }
}
