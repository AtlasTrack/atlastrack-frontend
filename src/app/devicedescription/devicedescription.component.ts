import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';
import { Router } from '@angular/router'; 
import { ApiService } from '../apiservice.service';

@Component({
  selector: 'app-devicedescription',
  standalone: true,
  imports: [FormsModule, CommonModule, NotificationPopupComponent],
  templateUrl: './devicedescription.component.html',
  styleUrl: './devicedescription.component.css'
})
export class DevicedescriptionComponent {
  incubatorSerialNumber: string = 'SN-111 222 333';
  biType: string = 'Atlas Rapid AX224';
  incubatorModel: string = 'Atlas Rapid Mini'; 
  showSettings = false;
  showPopup = false;
  popupMessage = '';
  username: any = localStorage.getItem('clinic');
  clinicAddress: any = localStorage.getItem('clinicAddress');
  showSidebar: boolean = false;
  popupType: 'success' | 'error' = 'success';
  isMobile = window.innerWidth < 1024; // Initial check for screen size
  menuOpen = false;
  isSubmitting = false; // Add loading state

  constructor(
    private router: Router,
    private apiService: ApiService // Inject ApiService
  ) {}
  
  reportsDropdownOpen = false;

  // Add this method to your component class
  toggleReportsDropdown() {
    this.reportsDropdownOpen = !this.reportsDropdownOpen;
  }

  // Add these methods for the report options
  onBILOGReport() {
    this.router.navigate(['/report']);
  }

  onUltrasonicReport() {
    this.router.navigate(['/ultrasonicwashertestreport']);
  }

  onWaterTestReport() {
    this.router.navigate(['/watertestingreport']);
  }
  
  onServicePackClick() {
    // Get clinic data from localStorage
    const clinicName = localStorage.getItem('clinic');
    const clinicAddress = localStorage.getItem('clinicAddress');
    
    if (!clinicName || !clinicAddress) {
      this.showPopup = true;
      this.popupMessage = 'Clinic information not found. Please log in again.';
      this.popupType = 'error';
      return;
    }
    
    // Set loading state
    this.isSubmitting = true;
    
    // Call the API to store serial number and BI type
    this.apiService.createSerialAndBIType(
      clinicName, 
      clinicAddress, 
      this.incubatorSerialNumber, 
      this.biType
    ).subscribe({
      next: (response) => {
        // Store values in localStorage for client-side access
        localStorage.setItem('servicePackSerial', this.incubatorSerialNumber);
        localStorage.setItem('biType', this.biType);
        
        // Show success popup
        this.showPopup = true;
        this.popupMessage = 'Serial and BI Type stored successfully!';
        this.popupType = 'success';
        
        console.log('API response:', response);
      },
      error: (error) => {
        // Show error popup
        this.showPopup = true;
        this.popupMessage = error.error?.error || 'Failed to save serial number and BI type.';
        this.popupType = 'error';
        
        console.error('API error:', error);
      },
      complete: () => {
        // Reset loading state
        this.isSubmitting = false;
      }
    });
  }

  closePopup() {
    this.showPopup = false;
    this.popupMessage = '';
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
 
  onCloseClick() {
    this.router.navigate(['/home']);
  }

  onLogoutClick() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('profile');
    localStorage.removeItem('clinic');
    localStorage.removeItem('clinicAddress');
    this.router.navigate(['/login']);
    this.closeSettings();
  }
  
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
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

  onForgetPassword() {
    this.router.navigate(['forgetpasswordemail']);
  }
}