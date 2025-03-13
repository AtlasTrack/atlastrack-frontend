import { Component } from '@angular/core';
import { WaterTestingRequestDTO } from '../apiinterfaces';
import { Router } from '@angular/router';
import { ApiService } from '../apiservice.service';
import { saveAs } from 'file-saver';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';

@Component({
  selector: 'app-watertestinglogreport',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NotificationPopupComponent],
  templateUrl: './watertestinglogreport.component.html',
  styleUrl: './watertestinglogreport.component.css'
})
export class WatertestinglogreportComponent {
records: WaterTestingRequestDTO[] = [];
  showSettings = false;
  filteredRecords: WaterTestingRequestDTO[] = [];
  currentPage = 0;
  totalPages = 0;
  startTime!: string;
  endTime!: string;
  showPopup = false;
  popupMessage = '';
  showSidebar: boolean = false;
  popupType: 'success' | 'error' = 'success';
  searchText: string = '';
  showFilterOptions: boolean = false;
  filterCriteria: string = 'all';
  selectedClinic!: string;
  isMobile = window.innerWidth < 1024; // Initial check for screen size
  menuOpen = true;
  username: any = localStorage.getItem('clinic');
  constructor(private router: Router, private apiService: ApiService) { }

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

  ngOnInit(): void {
    this.selectedClinic = localStorage.getItem('clinic') ?? ''; // Provide default empty string
    this.fetchClinicRecords();
  }

  onDateChange() {
    if (this.validateDates()) {
      this.currentPage = 0; // Reset pagination to first page
      this.fetchFilteredRecords();
    }
  }

  validateDates(): boolean {
    // if(!this.startTime || !this.endTime) {
    //   alert('Both dates are required');
    //   return false;
    // }
    
    const start = new Date(this.startTime);
    const end = new Date(this.endTime);
    
    if(start > end) {
      this.records = [];
      
      this.showPopup = true;
      this.popupMessage = 'Start date cannot be after end date';
      this.popupType = 'error';
      return false;
    }
    
  
    
    return true;
  }

  fetchClinicRecords() {
    this.apiService.getWaterTestingRecordsByClinic(
      this.selectedClinic, 
      this.currentPage
    ).subscribe({
      next: (response) => {
        this.records = response.content;
        this.totalPages = response.totalPages;
      }
    });
  }

  // fetchRecords() {
  //   this.apiService.getPaginatedRecords(this.currentPage).subscribe({
  //     next: (response) => {
  //       this.records = response.content;
  //       this.totalPages = response.totalPages;
  //     }
  //   });
  // }

  fetchFilteredRecords() {
    if (!this.validateDates()) return;

  const startDate = `${this.startTime}T00:00:00`;
  const endDate = `${this.endTime}T23:59:59`;

  this.currentPage = 0; // Reset to first page
  
  
    // Use clinic-specific filter if a clinic is selected
    this.apiService.getWaterTestingFilteredClinicRecords(this.selectedClinic, startDate, endDate, this.currentPage)
      .subscribe({
        next: (response) => {
          this.records = response.content;
          this.totalPages = response.totalPages;
        },
        error: (err) => {
          console.error('Error fetching filtered records:', err);
        }
      });
  
  }
  
  exportExcel() {
    if (!this.validateDates()) return;

  const startDate = `${this.startTime}T00:00:00`;
  const endDate = `${this.endTime}T23:59:59`;

  if (startDate.includes('undefinedT') || endDate.includes('undefinedT')) {
    this.showPopup = true;
    this.popupMessage = 'Select the valid date';
    this.popupType = 'error'
    return;
  }

    this.apiService.exportWaterTestingClinicExcel(this.selectedClinic, startDate, endDate).subscribe(blob => {
      saveAs(blob, `${this.selectedClinic}-report-${this.startTime}-to-${this.endTime}.xlsx`);
    });
  }
  
  exportPDF() {
   
    if (!this.validateDates()) return;

  const startDate = `${this.startTime}T00:00:00`;
  const endDate = `${this.endTime}T23:59:59`;

  if (startDate.includes('undefinedT') || endDate.includes('undefinedT')) {
    this.showPopup = true;
    this.popupMessage = 'Select the valid date';
    this.popupType = 'error'
    return;
  }

    this.apiService.exportWaterTestingClinicPDF(this.selectedClinic, startDate, endDate).subscribe(blob => {
      saveAs(blob, `${this.selectedClinic}-report-${this.startTime}-to-${this.endTime}.pdf`);
    });
  
  
  }
  onLogoutClick() {
    localStorage.removeItem('access_token');
   localStorage.removeItem('profile');
   localStorage.removeItem('clinic');
   localStorage.removeItem('clinicAddress');
   this.router.navigate(['/login']);
   this.closeSettings();
  }

  onHomeClick() {
    this.router.navigate(['/home']);
  }
  onDeviceDetailClick() {
    this.router.navigate(['/devicedescription'])
  }

  onreportClick() {
    this.router.navigate(['/report']);
  }


  changePage(page: number) {
    this.currentPage = page;
    this.fetchClinicRecords();
  }

  closePopup() {
    this.showPopup = false;
    this.popupMessage = '';
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }


  

  // Toggle filter options dropdown
  toggleFilterOptions() {
    this.showFilterOptions = !this.showFilterOptions;
  }

  // Set filter criteria
  setFilterCriteria(criteria: string) {
    this.filterCriteria = criteria;
    this.showFilterOptions = false;
    
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
