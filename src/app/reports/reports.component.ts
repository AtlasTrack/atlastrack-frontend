import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService} from '../apiservice.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { saveAs } from 'file-saver';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';
import { AutoReadRecord } from '../apiinterfaces';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  //   this.apiService.exportClinicPDF(this.selectedClinic, startDate, endDate).subscribe(blob => {
  //     saveAs(blob, `${this.selectedClinic}-report-${this.startTime}-to-${this.endTime}.pdf`);
  //   });
  
  
  // }



  // Updated PDF generation function with color coding
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
  
    this.apiService.getFilteredClinicRecords(this.selectedClinic, startDate, endDate, this.currentPage)
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
  
  generatePDF(data: AutoReadRecord[]) {
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
      doc.text(`${this.selectedClinic} - BI Report`, doc.internal.pageSize.width / 2, 20, { align: 'center' });
      
      // Add date range
      doc.setFontSize(12);
      doc.text(`Report Period: ${this.startTime} to ${this.endTime}`, doc.internal.pageSize.width / 2, 30, { align: 'center' });
      
      // Process the data to include colored text for results and chemical integrators
      const processedData = data.map(record => {
        // Copy all standard fields
        return [
          new Date(record.startTime).toLocaleString(),
          new Date(record.endTime).toLocaleString(),
          record.wellNumber,
          this.selectedClinic,
          record.clinicAddress || 'N/A',
          record.serialNumber,
          record.result, // We'll apply conditional styling to this cell
          record.biType,
          record.isControlTest ? 'Yes' : 'No',
          record.biLotNumber,
          record.sterilizerModels,
          record.loadNumber,
          record.isImplant ? 'Yes' : 'No',
          record.technicianNames,
          record.cycleCount,
          record.chemicalIntegrators // We'll apply conditional styling to this cell
        ];
      });
      
      // Create the table with conditional styling
      autoTable(doc, {
        startY: 40,
        head: [['Start Time', 'End Time', 'Well Number', 'Clinic Name', 'Clinic Address', 'Serial Number', 
                'Result', 'BI Type', 'Control Test', 'BI Lot Number', 'Sterilizer Model', 'Load Number', 
                'Implant Test', 'Team Member', 'Cycle Count', 'Chemical Integrator']],
        body: processedData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 20 },
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
          // Style for Result column (index 6)
          if (data.section === 'body' && data.column.index === 6) {
            const value = data.cell.text[0]?.toLowerCase();
            if (value === 'positive') {
              data.cell.styles.textColor = [0, 128, 0]; // Green
            } else if (value === 'negative') {
              data.cell.styles.textColor = [255, 0, 0]; // Red
            }
          }
          
          // Style for Chemical Integrator column (index 15)
          if (data.section === 'body' && data.column.index === 15) {
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
      doc.save(`${this.selectedClinic}-report-${this.startTime}-to-${this.endTime}.pdf`);
    };
    
    // Handle error if logo couldn't be loaded
    logoImg.onerror = () => {
      console.warn('Could not load logo, generating PDF without logo');
      this.generatePDFWithoutLogo(doc, data);
    };
  }
  generatePDFWithoutLogo(doc: any, data: AutoReadRecord[]) {
    // Add title
    doc.setFontSize(16);
    doc.text(`${this.selectedClinic} - BI Report`, doc.internal.pageSize.width / 2, 20, { align: 'center' });
    
    // Add date range
    doc.setFontSize(12);
    doc.text(`Report Period: ${this.startTime} to ${this.endTime}`, doc.internal.pageSize.width / 2, 30, { align: 'center' });
    
    // Create the table
    autoTable(doc, {
      startY: 40,
      head: [['Start Time', 'End Time', 'Well Number', 'Clinic Name', 'Clinic Address', 'Serial Number', 
              'Result', 'BI Type', 'Control Test', 'BI Lot Number', 'Sterilizer Model', 'Load Number', 
              'Implant Test', 'Team Member', 'Cycle Count', 'Chemical Integrator']],
      body: data.map(record => [
        new Date(record.startTime).toLocaleString(),
        new Date(record.endTime).toLocaleString(),
        record.wellNumber,
        this.selectedClinic,
        record.clinicAddress || 'N/A',
        record.serialNumber,
        record.result,
        record.biType,
        record.isControlTest ? 'Yes' : 'No',
        record.biLotNumber,
        record.sterilizerModels,
        record.loadNumber,
        record.isImplant ? 'Yes' : 'No',
        record.technicianNames,
        record.cycleCount,
        record.chemicalIntegrators
      ]),
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'center'
      },
      headStyles: {
        fillColor: [128, 0, 128],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
      
    });
    
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF
    doc.save(`${this.selectedClinic}-report-${this.startTime}-to-${this.endTime}.pdf`);
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
