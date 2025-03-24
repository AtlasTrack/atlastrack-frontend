import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ApiService } from '../apiservice.service';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';
import { countryCodes } from '../countrycode';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, NotificationPopupComponent],
  providers: [{ provide: HttpClient }],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  showPassword = false;
  countrycode = countryCodes;
  showConfirmPassword = false;
  isLoading = false;
  showPopup = false;
  popupMessage = '';
  popupType: 'success' | 'error' = 'success';
  clinicTypes: string[] = [];
  isAddNewClinic: boolean = false;
  selectedCountryCode: string = '+1'; // Default country code

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
        countryCode: ['+1'], // Default country code (Pakistan)
        phoneNumber: ['', [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.minLength(10),
          Validators.maxLength(15)
        ]],
        password: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/)
        ]],
        confirmPassword: ['', [Validators.required]],
        clinicName: ['', [Validators.required]],
        clinicAddress: ['', [Validators.required]],
        clinicType: ['', [Validators.required]],
        addNewClinic: [''],
      },
      { validator: this.passwordMatchValidator }

    );

    this.fetchClinicTypes();
    
    // Watch for changes in clinicType to toggle the addNewClinic field
    this.signupForm.get('clinicType')?.valueChanges.subscribe(value => {
      if (value === 'Add Other') { // "Add New Clinic" option
        this.isAddNewClinic = true;
        this.signupForm.get('addNewClinic')?.setValidators([Validators.required]);
      } else {
        this.isAddNewClinic = false;
        this.signupForm.get('addNewClinic')?.clearValidators();
        this.signupForm.get('addNewClinic')?.setValue('');
      }
      this.signupForm.get('addNewClinic')?.updateValueAndValidity();
    });
  }



  fetchClinicTypes() {
    this.apiService.getClinicTypes().subscribe({
      next: (types) => {
        // Add default options
        this.clinicTypes = ['Dental Clinic', 'Medical Clinic', 'Add Other'];
        
        // Add unique clinic types from API
        if (types && types.length) {
          const uniqueTypes = types.filter(type => 
            !this.clinicTypes.includes(type) && type !== 'Add Other');
          this.clinicTypes = [...this.clinicTypes.slice(0, 2), ...uniqueTypes, 'Add Other'];
        }
      },
      error: (error) => {
        console.error('Error fetching clinic types:', error);
      }
    });
  }


  onCountryCodeChange(event: any) {
    this.selectedCountryCode = event.target.value;
    this.signupForm.patchValue({
      countryCode: event.target.value
    });
  }

  getSelectedCountryName(): string {
    const selectedCountry = this.countrycode.find(c => c.code === this.selectedCountryCode);
    return selectedCountry ? selectedCountry.country : '';
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
      if (control.errors['pattern']) {
        if (fieldName === 'password') {
          return 'At least one uppercase, lowercase, digit and one special character.';
        }
      }
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
    if (this.signupForm.get('password')?.value !== this.signupForm.get('confirmPassword')?.value) {
      this.showPopup = true;
      this.popupMessage = 'Passwords do not match';
      this.popupType = 'error';
      return;
    }

    if (this.signupForm.valid) {
      this.isLoading = true;
      const formData = this.signupForm.value;
      
      // Concatenate country code and phone number
      const fullPhoneNumber = `${formData.countryCode}${formData.phoneNumber}`;
      
      let clinicTypeValue = formData.clinicType;
      
      // If "Add New Clinic" is selected, use the addNewClinic value
      if (formData.clinicType === 'Add Other') {
        clinicTypeValue = formData.addNewClinic;
      }
      
      // Create the final registration data
      const registrationData = {
        ...formData,
        clinicType: clinicTypeValue,
        phoneNumber: fullPhoneNumber,
        countryCode: undefined
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
          this.showPopup = true;
          this.popupMessage = errorMessage;
          this.popupType = 'error';
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

  closePopup() {
    this.showPopup = false;
    this.popupMessage = '';
  }

  onPhoneInput(event: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.signupForm.patchValue({
      phoneNumber: input.value
    });
  }
}