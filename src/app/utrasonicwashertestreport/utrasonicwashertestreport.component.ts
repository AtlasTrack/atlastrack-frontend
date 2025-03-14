import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutoReadRecord, UltraSonicRequestDTO } from '../apiinterfaces';
import { ApiService } from '../apiservice.service';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';

@Component({
  selector: 'app-utrasonicwashertestreport',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NotificationPopupComponent],
  templateUrl: './utrasonicwashertestreport.component.html',
  styleUrl: './utrasonicwashertestreport.component.css'
})
export class UtrasonicwashertestreportComponent {
records: UltraSonicRequestDTO[] = [];
  showSettings = false;
  filteredRecords: UltraSonicRequestDTO[] = [];
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
    this.apiService.getUltraSonicRecordsByClinic(
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
    this.apiService.getUltrasonicFilteredClinicRecords(this.selectedClinic, startDate, endDate, this.currentPage)
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

    this.apiService.exportUltraSonicClinicExcel(this.selectedClinic, startDate, endDate).subscribe(blob => {
      saveAs(blob, `${this.selectedClinic}-report-${this.startTime}-to-${this.endTime}.xlsx`);
    });
  }
  
  // exportPDF() {
   
  //   if (!this.validateDates()) return;

  // const startDate = `${this.startTime}T00:00:00`;
  // const endDate = `${this.endTime}T23:59:59`;

  // if (startDate.includes('undefinedT') || endDate.includes('undefinedT')) {
  //   this.showPopup = true;
  //   this.popupMessage = 'Select the valid date';
  //   this.popupType = 'error'
  //   return;
  // }

  //   this.apiService.exportUltraSonicClinicPDF(this.selectedClinic, startDate, endDate).subscribe(blob => {
  //     saveAs(blob, `${this.selectedClinic}-report-${this.startTime}-to-${this.endTime}.pdf`);
  //   });
  
  
  // }


  exportPDF() {
    if (!this.validateDates()) return;
  
    const startDate = `${this.startTime}T00:00:00`;
    const endDate = `${this.endTime}T23:59:59`;
  
    if (startDate.includes('undefinedT') || endDate.includes('undefinedT')) {
      this.showPopup = true;
      this.popupMessage = 'Select the valid date';
      this.popupType = 'error';
      return;
    }
  
    this.apiService.getUltrasonicFilteredClinicRecords(this.selectedClinic, startDate, endDate, this.currentPage)
      .subscribe({
        next: (response) => {
          // Get all records at once for PDF
          const allRecords = response.content;
          this.generatePDF(allRecords);
          this.showPopup = true;
          this.popupMessage = 'PDF Generated Successfully';
          this.popupType = 'success';
        },
        error: (err) => {
          console.error('Error fetching records for PDF:', err);
          this.showPopup = true;
          this.popupMessage = 'Error generating PDF report';
          this.popupType = 'error';
        }
      });
  }
  
  generatePDF(data: UltraSonicRequestDTO[]) {
    const doc = new jsPDF('landscape');
    
    // Add logo
    const logoPath = 'assets/newui/atlasnewlogo.png';
    const logoImg = new Image();
    logoImg.src = logoPath;
    
    // When the image is loaded, continue with PDF generation
    logoImg.onload = () => {
      // Add logo to the PDF
      doc.addImage(logoImg, 'PNG', 10, 10, 50, 20);
      
      // Add title
      doc.setFontSize(16);
      doc.text(`${this.selectedClinic} - Ultrasonic Washer Test Report`, doc.internal.pageSize.width / 2, 20, { align: 'center' });
      
      // Add date range
      doc.setFontSize(12);
      doc.text(`Report Period: ${this.startTime} to ${this.endTime}`, doc.internal.pageSize.width / 2, 30, { align: 'center' });
      
      // Process the data to include colored text for results
      const processedData = data.map(record => {
        // Copy all standard fields
        return [
          new Date(record.date).toLocaleString(),
          record.testType || 'N/A',
          record.solutionChanged,
          record.result, // We'll apply conditional styling to this cell
          record.technicianName || 'N/A',
          record.efficacyTestName || 'N/A',

        ];
      });
      
      // Create the table with conditional styling
      autoTable(doc, {
        startY: 40,
        head: [['Test Date', 'Test Type', 'Solutions Changed & Degassed', 'Test Result', 'Team Member', 'Efficacy Test Type' ]],
        body: processedData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 25 },
          // Other column widths as needed
        },
        headStyles: {
          fillColor: [189, 226, 189], // RGB color 189,226,189
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        // Custom cell styling for conditional formatting
        didParseCell: function(data) {
          // Style for Test Result column (index 4)
          if (data.section === 'body' && data.column.index === 2) {
            const value = data.cell.text[0] === 'false' ? 'no' : 'yes' .toLowerCase();
            if (value === 'yes') {
              data.cell.styles.textColor = [0, 128, 0];// Green
              data.cell.text[0] = 'Yes'
            } else if (value === 'no') {
              data.cell.styles.textColor = [255, 0, 0]; // Red
              data.cell.text[0] = 'No'
            }

          }
          if (data.section === 'body' && data.column.index === 3) {
            const value = data.cell.text[0]?.toLowerCase();
            if (value === 'pass') {
              data.cell.styles.textColor = [0, 128, 0]; // Green
            } else if (value === 'fail') {
              data.cell.styles.textColor = [255, 0, 0]; // Red
            }

          }
        }
      });
      
    
      // Save the PDF
      doc.save(`${this.selectedClinic}-ultrasonic-report-${this.startTime}-to-${this.endTime}.pdf`);
    };
    
    // Handle error if logo couldn't be loaded
    logoImg.onerror = () => {
      console.warn('Could not load logo, generating PDF without logo');
      
    };
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
