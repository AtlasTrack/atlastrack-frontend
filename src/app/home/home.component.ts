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
  isMobile = window.innerWidth < 1024; // Initial check for screen size
  menuOpen = false;
  constructor(private router: Router) {}

  bilogformOpen() {
    this.router.navigate(['/rendervalueform']);
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
  openLogout() {
    this.isLogoutOpen = !this.isLogoutOpen;
  }

  onLogoutClick() {
    localStorage.removeItem('access_token');
   localStorage.removeItem('profile');
   localStorage.removeItem('clinic');
   localStorage.removeItem('clinicAddress');
   this.router.navigate(['/atlasindex']);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth < 1024;
  }
}
