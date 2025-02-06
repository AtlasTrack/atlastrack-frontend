import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ApiService } from '../apiservice.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  providers: [{ provide: HttpClient }],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  selectedCountryCode: string = '+92'; // Default country code

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.signupForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        countryCode: ['+92'], // New form control for country code
        phoneNumber: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        clinicName: ['', [Validators.required]],
        clinicAddress: ['', [Validators.required]],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  onCountryCodeChange(event: any) {
    this.selectedCountryCode = event.target.value;
    this.signupForm.patchValue({
      countryCode: event.target.value
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  isFieldInvalid(field: string): boolean {
    const control = this.signupForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.signupForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) return `${fieldName} is required`;
      if (control.errors['email']) return 'Invalid email format';
      if (control.errors['minlength'])
        return `${fieldName} must be at least ${control.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSignupClick() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      const formData = this.signupForm.value;
      
      // Concatenate country code and phone number
      const fullPhoneNumber = `${formData.countryCode}${formData.phoneNumber}`;
      
      // Create the final registration data
      const registrationData = {
        ...formData,
        phoneNumber: fullPhoneNumber,
        countryCode: undefined // Remove the separate country code field
      };

      // Remove confirm password from the request
      const { confirmPassword, ...finalRegistrationData } = registrationData;

      console.log('Starting signup process with form data:', { 
        ...finalRegistrationData,
        password: '[REDACTED]'
      });

      this.apiService.register(finalRegistrationData).subscribe({
        next: (success) => {
          if (success) this.router.navigate(['/home']);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Final signup error:', error);
          this.isLoading = false;
          let errorMessage = 'Registration failed. Please try again.';
          if (error.message) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }
          alert(errorMessage);
        },
        complete: () => {
          console.log('Signup process completed');
          this.isLoading = false;
        }
      });
    } else {
      console.log('Form validation failed:', 
        Object.keys(this.signupForm.controls)
          .filter(key => this.signupForm.get(key)?.invalid)
          .map(key => ({
            field: key,
            errors: this.signupForm.get(key)?.errors
          }))
      );
      
      Object.keys(this.signupForm.controls).forEach(key => {
        const control = this.signupForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}