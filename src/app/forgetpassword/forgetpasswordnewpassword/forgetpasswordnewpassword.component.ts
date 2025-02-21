import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPasswordDTO } from '../../apiinterfaces';
import { ApiService } from '../../apiservice.service';

@Component({
  selector: 'app-forgetpasswordnewpassword',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgetpasswordnewpassword.component.html',
  styleUrl: './forgetpasswordnewpassword.component.css'
})
export class ForgetpasswordnewpasswordComponent {
  passwordForm: FormGroup;
  phoneNumber: string = '';
  isVerified: boolean = false;
  showError = false;
  errorMessage = '';
  showSuccess = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private apiService: ApiService
  ) {
    this.passwordForm = this.fb.group({
      newPassword: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]]
    });
  }
  
  ngOnInit(): void {
    // Get phone number and verification status from query params
    this.route.queryParams.subscribe(params => {
      this.phoneNumber = params['phone'] || '';
      this.isVerified = params['verified'] === 'true';
      
      if (!this.phoneNumber || !this.isVerified) {
        this.router.navigate(['/forgetpasswordemail']);
      }
    });
  }
  
  updatePassword() {
    if (this.passwordForm.valid) {
      const newPassword = this.passwordForm.get('newPassword')?.value;
      
      const resetPasswordData: ResetPasswordDTO = {
        phoneNumber: this.phoneNumber,
        newPassword: newPassword
      };
      
      this.apiService.resetPassword(resetPasswordData).subscribe(
        (response: any) => {
          this.showSuccess = true;
          this.successMessage = 'Password updated successfully!';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        (error) => {
          this.showError = true;
          this.errorMessage = error.message || 'Failed to update password. Please try again.';
        }
      );
    } else {
      // Mark form controls as touched to show validation errors
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
    }
  }
}
