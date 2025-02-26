import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { countryCodes } from '../../countrycode';
import { ApiService } from '../../apiservice.service';

@Component({
  selector: 'app-forgetpasswordemailpage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgetpasswordemailpage.component.html',
  styleUrl: './forgetpasswordemailpage.component.css'
})
export class ForgetpasswordemailpageComponent {
  emailForm: FormGroup;
  showError = false;
  errorMessage = '';
  countrycode = countryCodes;
  isLoading = false; 
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSendOTPClick() {
    if (this.emailForm.valid) {
      this.isLoading = true; 
      const email = this.emailForm.get('email')?.value;
      this.apiService.sendOtp(email).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/forgetpasswordotp'], { 
            queryParams: { email: email } 
          });
          // Optionally show success message
        },
        error: (error) => {
          this.isLoading = false; 
          this.showError = true;
          this.errorMessage = error.message || 'Failed to send OTP';
          
        }
      });
  }
}
}
