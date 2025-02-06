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
  currentPage = 0;
  totalPages = 0;
  startTime!: string;
  endTime!: string;
  showPopup = false;
  popupMessage = '';
  showSidebar: boolean = false;
  popupType: 'success' | 'error' = 'success';
  constructor(private router: Router, private apiService: ApiService) { }


  ngOnInit(): void {
    this.fetchRecords();
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

  fetchRecords() {
    this.apiService.getPaginatedRecords(this.currentPage).subscribe({
      next: (response) => {
        this.records = response.content;
        this.totalPages = response.totalPages;
      }
    });
  }

  fetchFilteredRecords() {
    if (!this.validateDates()) return;
  
    // Append time to dates
    const startDate = `${this.startTime}T00:00:00`;
    const endDate = `${this.endTime}T23:59:59`;
  
    this.currentPage = 0; // Reset to first page
    this.apiService.getFilteredRecords(startDate, endDate, this.currentPage)
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
  
    this.apiService.exportExcel(startDate, endDate).subscribe(blob => {
      saveAs(blob, `report-${this.startTime}-to-${this.endTime}.xlsx`);
    });
  }
  
  exportPDF() {
    if (!this.validateDates()) return;
  
    const startDate = `${this.startTime}T00:00:00`;
    const endDate = `${this.endTime}T23:59:59`;
  
    this.apiService.exportPDF(startDate, endDate).subscribe(blob => {
      saveAs(blob, `report-${this.startTime}-to-${this.endTime}.pdf`);
    });
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
    this.fetchRecords();
  }

  closePopup() {
    this.showPopup = false;
    this.popupMessage = '';
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }
}
