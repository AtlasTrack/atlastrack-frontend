import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { countryCodes } from '../countrycode';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiService } from '../apiservice.service';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';

@Component({
  selector: 'app-manageaccount',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, NotificationPopupComponent],
  templateUrl: './manageaccount.component.html',
  styleUrl: './manageaccount.component.css'
})
export class ManageaccountComponent implements OnInit {
  countrycode = countryCodes;
  showSettings = false;
  menuOpen = false;
  username: any = localStorage.getItem('clinic');
  showPopup = false;
  popupMessage = '';
  popupType: 'success' | 'error' = 'success';
  
  // Form fields
  clinicName: string = '';
  clinicAddress: string = '';
  email: string = '';
  phoneNumber: string = '';
  userName: string = '';
  
  // Track original values for comparison
  originalClinicName: string = '';
  originalClinicAddress: string = '';
  originalEmail: string = '';
  originalPhoneNumber: string = '';
  originalUserName: string = '';
  
  selectedCountryCode: string = '+92'; // Default country code
  
  constructor(private router: Router, private http: HttpClient, private apiService: ApiService) {}
  
  ngOnInit() {
    // Load values from localStorage
    this.clinicName = localStorage.getItem('clinic') || '';
    this.clinicAddress = localStorage.getItem('clinicAddress') || '';
    this.email = localStorage.getItem('email') || '';
    this.phoneNumber = localStorage.getItem('phoneNumber') || '';
    this.userName = localStorage.getItem('fullName') || '';
    
    // Store original values for comparison
    this.originalClinicName = this.clinicName;
    this.originalClinicAddress = this.clinicAddress;
    this.originalEmail = this.email;
    this.originalPhoneNumber = this.phoneNumber;
    this.originalUserName = this.userName;
  }

  saveChanges() {
    // Check if any changes were made
    if (this.hasChanges()) {
      const password = localStorage.getItem('password'); // Assuming password is stored in localStorage
      
      if (!this.apiService.isAuthenticated()) {
        alert('You are not logged in. Please log in again.');
        this.router.navigate(['/login']);
        return;
      }
      
      // Create the update request payload
      const updateData = {
        originalEmail: this.originalEmail,
        newEmail: this.email,
        userName: this.userName,
        clinicName: this.clinicName,
        clinicAddress: this.clinicAddress,
        phoneNumber: this.phoneNumber,
        password: password || '' // Handle null case
      };
      
      // Call the API service method
      this.apiService.updateUserProfile(updateData).subscribe({
        next: (response) => {
          // Update original values to track future changes
          this.originalClinicName = this.clinicName;
          this.originalClinicAddress = this.clinicAddress;
          this.originalEmail = this.email;
          this.originalPhoneNumber = this.phoneNumber;
          this.originalUserName = this.userName;
          this.showPopup = true;
          this.popupMessage = 'Profile updated successfully!'
         this.popupType = 'success';
         
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.showPopup = true;
          this.popupMessage = error.message || 'Unknown error'
         this.popupType = 'error';
        }
      });
    } else {
      this.showPopup = true;
      this.popupMessage = 'No changes detected!';
     this.popupType = 'error';
    }
  }
  
  // Helper method to check if any changes were made
  private hasChanges(): boolean {
    return this.originalClinicName !== this.clinicName ||
           this.originalClinicAddress !== this.clinicAddress ||
           this.originalEmail !== this.email ||
           this.originalPhoneNumber !== this.phoneNumber ||
           this.originalUserName !== this.userName;
  }

  onManageAccount() {
    this.router.navigate(['/manageaccount']);
    this.closeSettings();
  }

  toggleSettings(event: Event): void {
    event.stopPropagation();
    this.showSettings = !this.showSettings;
  }

  closeSettings(): void {
    this.showSettings = false;
  }

  onHomeClick() {
    this.router.navigate(['/home']);
  }
  
  onReportClick() {
    this.router.navigate(['/report']);
  }
  
  onDeviceDetail() {
    this.router.navigate(['/devicedescription']);
  }
  
  onLogoutClick() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('profile');
    localStorage.removeItem('clinic');
    localStorage.removeItem('clinicAddress');
    localStorage.removeItem('password'); // Also remove password if stored
    this.router.navigate(['/login']);
    this.closeSettings();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  onCountryCodeChange(event: any) {
    this.selectedCountryCode = event.target.value;
  }

  getSelectedCountryName(): string {
    const selectedCountry = this.countrycode.find(c => c.code === this.selectedCountryCode);
    return selectedCountry ? selectedCountry.country : '';
  }

  onPhoneInput(event: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }

  closePopup() {
    this.showPopup = false;
    this.popupMessage = '';
  }

  onForgetPassword() {
    this.router.navigate(['forgetpasswordemail']);
  }
}