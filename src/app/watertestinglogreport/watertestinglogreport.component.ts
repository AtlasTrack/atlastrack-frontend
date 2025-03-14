import { Component } from '@angular/core';
import { WaterTestingRequestDTO } from '../apiinterfaces';
import { Router } from '@angular/router';
import { ApiService } from '../apiservice.service';
import { saveAs } from 'file-saver';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

  //   this.apiService.exportWaterTestingClinicPDF(this.selectedClinic, startDate, endDate).subscribe(blob => {
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
  
    this.apiService.getWaterTestingFilteredClinicRecords(this.selectedClinic, startDate, endDate, this.currentPage)
      .subscribe({
        next: (response) => {
          // Get all records at once for PDF
          const allRecords = response.content;
          this.generatePDF(allRecords);
        },
        error: (err) => {
          console.error('Error fetching records for PDF:', err);
          this.showPopup = true;
          this.popupMessage = 'Error generating PDF report';
          this.popupType = 'error';
        }
      });
  }
  
  generatePDF(data: WaterTestingRequestDTO[]) {
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
      doc.text(`${this.selectedClinic} - Water Testing Report`, doc.internal.pageSize.width / 2, 20, { align: 'center' });
      
      // Add date range
      doc.setFontSize(12);
      doc.text(`Report Period: ${this.startTime} to ${this.endTime}`, doc.internal.pageSize.width / 2, 30, { align: 'center' });
      
      // Process the data
      var processedData = data.map(record => {
        return [
          new Date(record.date).toLocaleString(),
          new Date(record.resultDate).toLocaleString(),
          record.technicianName,
          record.locationName, 
          record.deviceName,
          record.result,
          record.safetyLevel || 'unknown', // Keep the actual safety level as text
          record.correctiveAction || 'N/A',
        ];
      });
      
      // Create the table with conditional styling
      autoTable(doc, {
        startY: 40,
        head: [['Test Date', 'Date of Result', 'Team Member', 'Location', 'Device', 'Result', 
                'Safety Level', 'Corrective Action']],
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
          // Style for Result column (index 5)
          if (data.section === 'body' && data.column.index === 5) {
            const value = data.cell.text[0]?.toLowerCase();
            if (value === 'pass') {
              data.cell.styles.textColor = [0, 128, 0]; // Green
            } else if (value === 'fail') {
              data.cell.styles.textColor = [255, 0, 0]; // Red
            }
          }
          
          // Process Safety Level column (index 6)
          if (data.section === 'body' && data.column.index === 6) {
            const safetyLevel = data.cell.text[0]?.toLowerCase();
            
            // Store the safety level for use in didDrawCell
            data.cell.text[0] = safetyLevel;
            
            // Make the text color match the background (effectively hiding it)
            // But keep the text for proper processing
            data.cell.styles.textColor = [255, 255, 255]; // Transparent
          }
        },
        // Custom drawing for cells
        didDrawCell: function(data) {
          // Only process Safety Level column (index 6)
          if (data.section === 'body' && data.column.index === 6 ) {
            const safetyLevel = data.cell.text[0];
            let circleColor;
            
            // Set circle color based on safety level
            if (safetyLevel === 'safe') {
              circleColor = [0, 128, 0]; // Green
            } else if (safetyLevel === 'warning') {
              circleColor = [255, 165, 0]; // Orange/Yellow
            } else if (safetyLevel === 'danger') {
              circleColor = [255, 0, 0]; // Red
            } else {
              circleColor = [128, 128, 128]; // Gray for unknown
            }
            
            // Draw the colored circle in the center of the cell
            const x = data.cell.x + data.cell.width / 2;
            const y = data.cell.y + data.cell.height / 2;
            const radius = 2; // Larger circle for better visibility
            
            doc.setFillColor(circleColor[0], circleColor[1], circleColor[2]);
            doc.circle(x, y, radius, 'F');
          }
        }
      });
      
      // Save the PDF
      doc.save(`${this.selectedClinic}-water-testing-report-${this.startTime}-to-${this.endTime}.pdf`);
    };
    
    // Handle error if logo couldn't be loaded
    logoImg.onerror = () => {
      console.warn('Could not load logo, generating PDF without logo');
      // Call the same PDF generation without the logo
      // We should implement this part if needed
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
