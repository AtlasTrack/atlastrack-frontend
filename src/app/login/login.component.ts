import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../apiservice.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm!: FormGroup;
  constructor(private router: Router, private apiService: ApiService, private fb: FormBuilder) { 
   
  }
 
  
  ngOnInit() {
    this.initializeForm();
    this.checkRememberedUser();
  }

  private initializeForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  private checkRememberedUser() {
    const rememberedUser = this.apiService.getRememberedUser();
    if (rememberedUser) {
      this.loginForm.patchValue({
        email: rememberedUser.email,
        password: rememberedUser.password,
        rememberMe: true
      });
    }
  }

  onCreateAccount() {
    this.router.navigate(['/signup']);
  }

  onLoginClick() {
    if (this.loginForm.valid) {
      const { email, password, rememberMe } = this.loginForm.value;
      
      this.apiService.login(email, password).subscribe({
        next: (success) => {
          if (success) {
            if (rememberMe) {
              this.apiService.rememberUser(email, password);
            } else {
              this.apiService.forgetUser();
            }
            this.router.navigate(['/home']);
          } else {
            alert('Invalid credentials');
          }
        },
        error: (error) => {
          alert(error.message);
        }
      });
    }
  }
  
}
