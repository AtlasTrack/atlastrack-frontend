import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-forgetpasswordotppage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgetpasswordotppage.component.html',
  styleUrl: './forgetpasswordotppage.component.css'
})
export class ForgetpasswordotppageComponent {
  otpForm: FormGroup;
  showError = false;
  errorMessage = '';
  correctOtp = '1234';
  phoneNumber: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.otpForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      digit2: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      digit3: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
      digit4: ['', [Validators.required, Validators.pattern('^[0-9]$')]]
    });
  }

  ngOnInit(): void {
    // Get phone number from query params
    this.route.queryParams.subscribe(params => {
      this.phoneNumber = params['phone'] || '';
      if (!this.phoneNumber) {
        this.router.navigate(['/forgetpasswordemail']);
      }
    });

    // Form status changes listener
    this.otpForm.statusChanges.subscribe(status => {
      if (status === 'VALID') {
        // Auto-verify when all digits are entered correctly
        this.verifyOtp(true);
      }
    });
  }

  // Handle digit input and auto-focus next field
  onDigitInput(event: any, currentInput: HTMLInputElement, nextInput: HTMLInputElement | null, prevInput: HTMLInputElement | null = null) {
    // Allow only numbers
    if (!/^\d*$/.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^\d]/g, '');
      return;
    }

    // Auto-focus logic
    if (event.key === 'Backspace' && prevInput && !currentInput.value) {
      prevInput.focus();
      return;
    }

    const value = event.target.value;
    
    // If a value is entered and there's a next input, focus on it
    if (value && nextInput) {
      nextInput.focus();
    }
  }

  // Handle keyboard navigation
  onKeyDown(event: KeyboardEvent) {
    // Allow only numbers, backspace, tab, and arrow keys
    if (
      !/^\d$/.test(event.key) && 
      event.key !== 'Backspace' && 
      event.key !== 'Tab' && 
      event.key !== 'ArrowLeft' && 
      event.key !== 'ArrowRight'
    ) {
      event.preventDefault();
    }
  }

  // Verify OTP
  verifyOtp(isAutoVerify: boolean = false) {
    if (!this.otpForm.valid) {
      return;
    }

    const enteredOtp = 
      this.otpForm.get('digit1')?.value +
      this.otpForm.get('digit2')?.value +
      this.otpForm.get('digit3')?.value +
      this.otpForm.get('digit4')?.value;

    // In a real app, verify with backend API
    if (enteredOtp === this.correctOtp) {
      // For real implementation:
      // this.http.post('/api/auth/verify-otp', {
      //   phoneNumber: this.phoneNumber,
      //   otp: enteredOtp
      // }).subscribe(...)

      // OTP is correct
      this.showError = false;
      this.router.navigate(['/forgetpasswordnewpass'], { 
        queryParams: { phone: this.phoneNumber, verified: 'true' } 
      });
    } else {
      // OTP is incorrect
      this.showError = true;
      this.errorMessage = 'Invalid OTP. Please try again.';
      
      // Don't show error for auto-verify unless all digits are filled
      if (isAutoVerify && !this.isAllDigitsFilled()) {
        this.showError = false;
      }
    }
  }
  // Check if all digits are filled
  isAllDigitsFilled(): boolean {
    return (
      !!this.otpForm.get('digit1')?.value &&
      !!this.otpForm.get('digit2')?.value &&
      !!this.otpForm.get('digit3')?.value &&
      !!this.otpForm.get('digit4')?.value
    );
  }

  // Resend OTP logic
  resendOtp() {
    // Reset form
    this.otpForm.reset();
    this.showError = false;
    
  }
}
