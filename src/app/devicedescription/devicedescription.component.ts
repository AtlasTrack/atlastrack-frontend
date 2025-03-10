import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';
import { Router } from '@angular/router';

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
  showSidebar: boolean = false;
  popupType: 'success' | 'error' = 'success';
  isMobile = window.innerWidth < 1024; // Initial check for screen size
  menuOpen = false;

  constructor(private router: Router){}

   onServicePackClick() {
    // Store values in localStorage
    localStorage.setItem('servicePackSerial', this.incubatorSerialNumber);
    localStorage.setItem('biType', this.biType)
    
    // Optional: You can add confirmation logic here
    console.log('Values stored in localStorage:', {
      incubatorSerial: this.incubatorSerialNumber,
      biType: this.biType
    });

    this.showPopup = true;
    this.popupMessage = 'Serial and BI Type stored successfully!';
    this.popupType = 'success';

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
