import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboardlogin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboardlogin.component.html',
  styleUrl: './dashboardlogin.component.css'
})
export class DashboardloginComponent {

  email: string = '';
  password: string = '';
  isError: boolean = false;


  constructor(private router: Router) { }

   ngOnInit(): void {
    // Reset form state when component initializes
    this.email = '';
    this.password = '';
    this.isError = false;
  }

  onSigninClick(): void {

    if (this.email === 'atlas@tracker.com' && this.password === 'atlas123') {
      this.isError = false;
      console.log('Login successful, navigating to dashboard');
      this.router.navigate(['/dashboard']);
    } else {
      this.isError = true;
      console.log('Login failed');
    }
  }
}
