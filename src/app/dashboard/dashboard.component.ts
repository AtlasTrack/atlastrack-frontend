// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../apiservice.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';
import { Chart, registerables } from 'chart.js';
import { saveAs } from 'file-saver';
import { AutoReadRecord } from '../apiinterfaces';

Chart.register(...registerables);

interface DashboardStats {
  totalReports: number;
  successRate: number;
  avgProcessingTime: number;
  previousMonthReports?: number;
  avgProcessingTimeBaseline?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationPopupComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  records: AutoReadRecord[] = [];
  currentPage = 0;
  totalPages = 0;
  startTime!: string;
  endTime!: string;
  stats: DashboardStats = {
    totalReports: 0,
    successRate: 0,
    avgProcessingTime: 0
  };
  recentActivity: AutoReadRecord[] = [];
  searchQuery: string = '';
  controlTest: number = 0;
  implantTest: number = 0;
  showPopup = false;
  popupMessage = '';
  popupType: 'success' | 'error' = 'success';

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.fetchDashboardStats();
    this.fetchRecentActivity();
    this.initializeCharts();
    this.fetchRecords();
  }

  fetchDashboardStats() {
    this.apiService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        this.showPopup = true;
        this.popupMessage = 'Error fetching dashboard statistics';
        this.popupType = 'error';
      }
    });
  }

  fetchRecentActivity() {
    this.apiService.getPaginatedRecords(0).subscribe({
      next: (response) => {
        this.recentActivity = response.content.slice(0, 5); // Show only last 5 records
      },
      error: (error) => {
        this.showPopup = true;
        this.popupMessage = 'Error fetching recent activity';
        this.popupType = 'error';
      }
    });
  }

  initializeCharts() {
    this.initializeWeeklyChart();
    this.initializeDistributionChart();
  }

  initializeWeeklyChart() {
    const ctx = document.getElementById('mainChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.apiService.getWeeklyTestData().subscribe({
      next: (data) => {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.labels,
            datasets: [{
              label: 'Tests Completed',
              data: data.values,
              borderColor: '#9333ea',
              tension: 0.4,
              fill: false
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              }
            }
          }
        });
      }
    });
  }

  initializeDistributionChart() {
    const ctx = document.getElementById('doughnutChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.apiService.getTestDistribution().subscribe({
      next: (data) => {
        this.controlTest = data.controlTests;
        this.implantTest = data.implantTests;
        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Control Tests', 'Implant Tests', 'Other'],
            datasets: [{
              data: [data.controlTests, data.implantTests, data.otherTests],
              backgroundColor: [
                '#9333ea',
                '#c084fc',
                '#f3e8ff'
              ],
              borderColor: '#ffffff',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#6b7280',
                  font: {
                    size: 14
                  }
                }
              }
            }
          }
        });
      }
    });
  }

  onSearch() {
    // Implement search functionality
  }

  closePopup() {
    this.showPopup = false;
    this.popupMessage = '';
  }

  navigateToReports() {
    this.router.navigate(['/reports']);
  }


  onDateChange() {
    if (this.validateDates()) {
      this.currentPage = 0; // Reset pagination to first page
      this.fetchFilteredRecords();
    }
  }

  onLogoutClick() {
    this.router.navigate(['/atlasindex']);
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
    if (startDate.includes('undefinedT') || endDate.includes('undefinedT')) {
      this.showPopup = true;
      this.popupMessage = 'Select the valid date';
      this.popupType = 'error'
       return;
     }
  
    this.apiService.exportExcel(startDate, endDate).subscribe(blob => {
      saveAs(blob, `report-${this.startTime}-to-${this.endTime}.xlsx`);
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
    this.apiService.exportPDF(startDate, endDate).subscribe(blob => {
      saveAs(blob, `report-${this.startTime}-to-${this.endTime}.pdf`);
    });
  }

  onHomeClick() {
    this.router.navigate(['/home']);
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

  onclinicClick() {
    this.router.navigate(['clinicdashboard']);
  }


}