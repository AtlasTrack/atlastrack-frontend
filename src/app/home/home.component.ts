import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  username: any = localStorage.getItem('clinic');
  isLogoutOpen: boolean = false;
  showSettings = false;
  isMobile = window.innerWidth < 1024; // Initial check for screen size
  menuOpen = false;
  constructor(private router: Router) {}


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
  toggleSettings(event: Event): void {
    event.stopPropagation();
    this.showSettings = !this.showSettings;
  }

  closeSettings(): void {
    this.showSettings = false;
  }
  bilogformOpen() {
    this.router.navigate(['/rendervalueform']);
  }
  onHomeClick() {
    this.router.navigate(['/home']);
  }

  onDeviceDetail() {
    this.router.navigate(['/devicedescription']);
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

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth < 1024;
  }

  onManageAccount() {
    this.router.navigate(['/manageaccount']);
    this.closeSettings();
  }

  onForgetPassword() {
    this.router.navigate(['/forgetpasswordemail']);
  }

  onWaterTesting() {
    this.router.navigate(['/watertestinglog']);
  }

  onUltraSonicTest() {
    this.router.navigate(['/ultrasonicwashertest']);
  }

}
