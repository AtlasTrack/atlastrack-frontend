import { Component, OnInit, ViewChild, ElementRef,AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../apiservice.service';
import { Chart, registerables } from 'chart.js';
import { Router } from '@angular/router';

Chart.register(...registerables);


@Component({
  selector: 'app-clinicsdashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './clinicsdashboard.component.html',
  styleUrl: './clinicsdashboard.component.css'
})
export class ClinicsdashboardComponent implements AfterViewInit{
  @ViewChild('weeklyChart') weeklyChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('distributionChart') distributionChartRef!: ElementRef<HTMLCanvasElement>;

  private weeklyChart: Chart | null = null;
  private distributionChart: Chart | null = null;

  clinics: string[] = [];
  selectedClinic: string = '';
  clinicStats: any = null;
  clinicRecords: any[] = [];

  totalPages = 0;
  currentPage = 0;

 ngAfterViewInit() {
    if (this.clinicStats) {
      this.renderWeeklyChart(this.clinicStats.weeklySummary);
      this.renderDistributionChart();
    }
  }

  fetchClinicRecords() {
    this.apiService.getRecordsByClinic(
      this.selectedClinic, 
      this.currentPage
    ).subscribe({
      next: (response) => {
        this.clinicRecords = response.content;
        this.totalPages = response.totalPages;
      }
    });
  }

  changePage(page: number) {
    this.currentPage = page;
    this.fetchClinicRecords();
  }

 
  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.fetchClinicNames();
  }


  onclinicClick() {
    this.router.navigate(['clinicdashboard']);
  }

  onDashboarClick() {
    this.router.navigate(['/dashboard']);
  }

  onLogoutClick() {
    this.router.navigate(['/dashboardlogin']);
  }


  fetchClinicNames() {
    this.apiService.getClinicNames().subscribe({
      next: (clinics) => {
        this.clinics = clinics;
        if (clinics.length > 0) {
          this.selectedClinic = clinics[0];
          this.fetchClinicStats();
        }
      }
    });
  }
  fetchClinicStats() {
    this.apiService.getClinicStats(this.selectedClinic).subscribe({
      next: (stats) => {
        this.clinicStats = stats;
        // Only render charts if the view has been initialized
        if (this.weeklyChartRef && this.distributionChartRef) {
          this.renderWeeklyChart(stats.weeklySummary);
          this.renderDistributionChart();
        }
        this.fetchClinicRecords();
      }
    });
  }

  renderWeeklyChart(weeklySummary: Record<string, number>) {
    // Destroy existing chart if it exists
    if (this.weeklyChart) {
      this.weeklyChart.destroy();
    }

    const ctx = this.weeklyChartRef.nativeElement;
    this.weeklyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Object.keys(weeklySummary),
        datasets: [{
          label: 'Tests per Day',
          data: Object.values(weeklySummary),
          borderColor: '#9333ea',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  renderDistributionChart() {
    // Destroy existing chart if it exists
    if (this.distributionChart) {
      this.distributionChart.destroy();
    }

    const ctx = this.distributionChartRef.nativeElement;
    this.distributionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Control Tests', 'Implant Tests'],
        datasets: [{
          data: [
            this.clinicStats.controlTests, 
            this.clinicStats.implantTests
          ],
          backgroundColor: ['#9333ea', '#c084fc']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }




}
