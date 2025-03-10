import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService} from '../apiservice.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { saveAs } from 'file-saver';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';
import { AutoReadRecord } from '../apiinterfaces';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [FormsModule, CommonModule, NotificationPopupComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  records: AutoReadRecord[] = [];
  showSettings = false;
  filteredRecords: AutoReadRecord[] = [];
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
    this.apiService.getRecordsByClinic(
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
    this.apiService.getFilteredClinicRecords(this.selectedClinic, startDate, endDate, this.currentPage)
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

    this.apiService.exportClinicExcel(this.selectedClinic, startDate, endDate).subscribe(blob => {
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

    this.apiService.exportClinicPDF(this.selectedClinic, startDate, endDate).subscribe(blob => {
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

  isControlButtonEnabled(record: AutoReadRecord): boolean {
    return record.isControlTest === true;
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


  applySearchAndFilter() {
    // If no search text, show all records
    if (!this.searchText || this.searchText.trim() === '') {
      this.filteredRecords = [];
      return;
    }
  
    // Convert search text to lowercase for case-insensitive search
    const searchLower = this.searchText.toLowerCase().trim();
  
    // Filter records across all columns
    this.filteredRecords = this.records.filter(record => {
      // Search in all string properties of the record
      return (
        // Basic info
        (record.wellNumber?.toString() || '').toLowerCase().includes(searchLower) ||
        (record.serialNumber || '').toLowerCase().includes(searchLower) ||
        (record.result || '').toLowerCase().includes(searchLower) ||
        (record.biType || '').toLowerCase().includes(searchLower) ||
        (record.biLotNumber || '').toLowerCase().includes(searchLower) ||
        (record.sterilizerModels || '').toLowerCase().includes(searchLower) ||
        (record.loadNumber?.toString() || '').toLowerCase().includes(searchLower) ||
        (record.cycleCount?.toString() || '').toLowerCase().includes(searchLower) ||
        (record.chemicalIntegrators || '').toLowerCase().includes(searchLower) ||
        
        // Additional fields if they exist in your data model
        (record.clinicName || '').toLowerCase().includes(searchLower) ||
        (record.clinicAddress || '').toLowerCase().includes(searchLower) ||
        
        // Date fields - convert to string format for searching
        (record.startTime ? new Date(record.startTime).toLocaleString() : '').toLowerCase().includes(searchLower) ||
        (record.endTime ? new Date(record.endTime).toLocaleString() : '').toLowerCase().includes(searchLower)
      );
    });
  }

  // Toggle filter options dropdown
  toggleFilterOptions() {
    this.showFilterOptions = !this.showFilterOptions;
  }

  // Set filter criteria
  setFilterCriteria(criteria: string) {
    this.filterCriteria = criteria;
    this.showFilterOptions = false;
    this.applySearchAndFilter();
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
