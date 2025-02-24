import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../apiservice.service';

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
  email: string = '';
  isResending = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private apiService: ApiService
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
      this.email = params['email'] || '';
      if (!this.email) {
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

  verifyOtp(isAutoVerify: boolean = false) {
    if (this.otpForm.valid) {
      const enteredOtp = 
        this.otpForm.get('digit1')?.value +
        this.otpForm.get('digit2')?.value +
        this.otpForm.get('digit3')?.value +
        this.otpForm.get('digit4')?.value;

      this.apiService.verifyOtp(this.email, enteredOtp).subscribe({
        next: () => {
          // Clear error if it was showing
          this.showError = false;
          this.errorMessage = '';
          
          // Navigate to new password page
          this.router.navigate(['/forgetpasswordnewpass'], { 
            queryParams: { 
              email: this.email, 
              verified: 'true' 
            } 
          });
        },
        error: (error) => {
          if (!isAutoVerify || this.isAllDigitsFilled()) {
            this.showError = true;
            this.errorMessage = error.message || 'Invalid OTP';
          }
        }
      });
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
      if (!this.isResending) {
        this.isResending = true; // Set resending state to true
        
        this.apiService.sendOtp(this.email).subscribe({
          next: () => {
            this.isResending = false; // Reset loading state
            this.otpForm.reset();
            this.showError = false;
            // Optionally show success message
          },
          error: (error) => {
            this.isResending = false; // Reset loading state
            this.showError = true;
            this.errorMessage = error.message || 'Failed to resend OTP';
          }
        });
      }
    }
}
