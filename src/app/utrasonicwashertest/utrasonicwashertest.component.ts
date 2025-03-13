// utrasonicwashertest.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomcomboboxComponent } from '../customcombobox/customcombobox.component';
import { BehaviorSubject, timeout } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UltrasonicFormData, UltraSonicRequestDTO } from '../apiinterfaces';
import { ApiService } from '../apiservice.service';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';


@Component({
  selector: 'app-utrasonicwashertest',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CustomcomboboxComponent, NotificationPopupComponent],
  templateUrl: './utrasonicwashertest.component.html',
  styleUrl: './utrasonicwashertest.component.css'
})
export class UtrasonicwashertestComponent implements OnInit {
  clinicName: string = localStorage.getItem('clinic') || '';
  clinicAddress: string = localStorage.getItem('clinicAddress') || '';
  isLogoutOpen: boolean = false;
  showSettings = false;
  isMobile = window.innerWidth < 1024;
  menuOpen = false;
  showOtherEfficacyField = false;
  currentDateTime: string;
  isSubmitting = false;
  
  // For displaying success/error messages
  showPopup = false;
  popupMessage = '';
  popupType: 'success' | 'error' = 'success';

  technicians$ = new BehaviorSubject<string[]>([]);
  efficacyTestTypes$ = new BehaviorSubject<string[]>([]);

  formData: UltrasonicFormData = {
    logType: 'Ultrasonic Log',
    date: '',
    solutionsChanged: 'No',
    testResult: 'Pass',
    teamMember: '',
    efficacyTestType: '',
    otherEfficacyTestType: ''
  };

  formErrors: Record<string, boolean> = {};

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {
    this.currentDateTime = this.getCurrentDateTime();
    this.formData.date = this.currentDateTime;
  }
  
  reportsDropdownOpen = false;

  toggleReportsDropdown() {
    this.reportsDropdownOpen = !this.reportsDropdownOpen;
  }
  
  ngOnInit(): void {
    // Load technicians and efficacy test types when component initializes
    this.loadTechnicians();
    const savedLogType = localStorage.getItem('selectedLogType');
  if (savedLogType) {
    this.formData.logType = savedLogType;
    localStorage.removeItem('selectedLogType'); // Clear it after use
  }
    this.updateEfficacyTestTypes(this.formData.logType);
  }

  loadTechnicians(): void {
    if (this.clinicName) {
      this.apiService.getTechnicians(this.clinicName).subscribe({
        next: (data) => this.technicians$.next(data),
        error: (error) => console.error('Error fetching clinic technicians:', error)
      });
    
    }
  }

  loadEfficacyTests(): void {
    if (this.clinicName) {
      this.apiService.getEfficacyTests(this.clinicName, this.formData.logType).subscribe({
        next: (testNames: string[]) => {
          // Get default efficacy tests based on log type
          const defaultTests = this.getDefaultEfficacyTests(this.formData.logType);
  
          // Combine API results with default options, avoiding duplicates
          const combinedTests = [
            ...new Set([...defaultTests, ...testNames.filter(test => !defaultTests.includes(test)), 'Other'])
          ];
  
          // Update the BehaviorSubject with the combined list
          this.efficacyTestTypes$.next(combinedTests);
        },
        error: (error) => {
          console.error('Error loading efficacy tests:', error);
          // If API fails, still show default options with "Add More"
          const defaultTests = this.getDefaultEfficacyTests(this.formData.logType);
          this.efficacyTestTypes$.next([...defaultTests, 'Other']);
        }
      });
    }
  }

  getDefaultEfficacyTests(logType: string): string[] {
    if (logType === 'Ultrasonic Log') {
      return ['Atlas Ultrasonic Test', 'Aluminum Test'];
    } else {
      return ['Atlas Wash Test'];
    }
  }

  getCurrentDateTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  
  onTechnicianSelected(technician: string) {
    this.formData.teamMember = technician;
    if (this.formErrors['technician']) {
      this.formErrors['technician'] = false;
    }
  }

  onEfficacyTestTypeSelected(testType: string) {
    this.formData.efficacyTestType = testType;
    this.showOtherEfficacyField = testType === 'Other';
    
    if (!this.showOtherEfficacyField) {
      this.formData.otherEfficacyTestType = '';
    }
    
    if (this.formErrors['efficacyTestType']) {
      this.formErrors['efficacyTestType'] = false;
    }
  }

  hasError(fieldName: string): boolean {
    return this.formErrors[fieldName] === true;
  }

  toggleSettings(event: Event): void {
    event.stopPropagation();
    this.showSettings = !this.showSettings;
  }

  closeSettings(): void {
    this.showSettings = false;
  }
  
  onHomeClick() {
    this.router.navigate(['/home']);
  }
  
  onBILOGReport() {
    this.router.navigate(['/report']);
  }
  
  onUltrasonicReport() {
    this.router.navigate(['/ultrasonicwashertestreport']);
  }
  
  onWaterTestReport() {
    this.router.navigate(['/watertestingreport']);
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

  generatePDF(): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const lineHeight = 5;
  
    // Add logo at the top center
    const logoPath = 'assets/newui/atlasnewlogo.png';
    try {
      // Logo dimensions
      const logoWidth = 60;
      const logoHeight = 30;
      // Calculate center position
      const logoX = (pageWidth - logoWidth) / 2;
      const logoY = margin;
      doc.addImage(logoPath, 'PNG', logoX, logoY, logoWidth, logoHeight);
    } catch (error) {
      console.error('Error loading logo:', error);
    }
  
    // Header with Clinic Information - positioned below the logo
    const headerStartY = margin + 40; // Adjusted to be below the logo
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
  
    doc.text('Clinic Name:', margin , headerStartY);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
  
    doc.text(this.clinicName || 'Clinic Name', margin + 40 , headerStartY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Clinic Address:', margin  , headerStartY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(this.clinicAddress || 'Clinic Address', margin + 40, headerStartY + 8);
  
    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const title = this.formData.logType === 'Ultrasonic Log' ? 'Ultrasonic Log Sheet' : 'Washer Log Sheet';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, headerStartY + 25);
  
    // Table with All Relevant Form Data
    const tableData = [
      [
        new Date(this.formData.date).toLocaleDateString('en-CA', { month: '2-digit', day: '2-digit', year: 'numeric' }) + ' ' + 
        new Date(this.formData.date).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }),
        '', // Will be filled with radio buttons in didDrawCell
        '', // Will be filled with radio buttons in didDrawCell
        this.formData.efficacyTestType === 'Other'? this.formData.otherEfficacyTestType : this.formData.efficacyTestType || '',
        this.formData.teamMember || '',
      ],
    ];
  
    autoTable(doc, {
      startY: headerStartY + 30,
      head: [['Date','Solution changed and degassed','Test Result', 'Efficacy Test', 'Team Member']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontSize: 10,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 10,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 35, cellPadding: 5},
        1: { cellWidth: 35, cellPadding: 5 },
        2: { cellWidth: 35, cellPadding: 5 },
        3: { cellWidth: 35, cellPadding: 5 },
        4: { cellWidth: 30, cellPadding: 5 },
      },
      didDrawCell: (data) => {
        if (data.row.section === 'body') {
          // Solutions Changed column
          if (data.column.index === 1 && data.row.index === 0) {
            const cellCenterX = data.cell.x + (data.cell.width / 2);
            const cellCenterY = data.cell.y + (data.cell.height / 2);
            
            console.log('solutionsChanged value:', this.formData.solutionsChanged);
            
            // Text instead of radio buttons
            doc.setFontSize(10);
            if (this.formData.solutionsChanged === 'Yes') {
              doc.setTextColor(0, 128, 0); // Green color
              doc.text('Yes', cellCenterX, cellCenterY, { align: 'center' });
            } else {
              doc.setTextColor(255, 0, 0); // Red color
              doc.text('No', cellCenterX, cellCenterY, { align: 'center' });
            }
            doc.setTextColor(0, 0, 0); // Reset to black
          }
          
          // Test Result column
          if (data.column.index === 2 && data.row.index === 0) {
            const cellCenterX = data.cell.x + (data.cell.width / 2);
            const cellCenterY = data.cell.y + (data.cell.height / 2);
            
            console.log('testResult value:', this.formData.testResult);
            
            // Text instead of radio buttons
            doc.setFontSize(10);
            if (this.formData.testResult === 'Pass') {
              doc.setTextColor(0, 128, 0); // Green color
              doc.text('Pass', cellCenterX, cellCenterY, { align: 'center' });
            } else {
              doc.setTextColor(255, 0, 0); // Red color
              doc.text('Fail', cellCenterX, cellCenterY, { align: 'center' });
            }
            doc.setTextColor(0, 0, 0); // Reset to black
          }
        }
      },
    });
  
    // Additional Information (Efficacy Test Type)
    let finalY = (doc as any).lastAutoTable.finalY || headerStartY + 230;
  
    // Notes Section
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES:', margin, finalY + 140);
    doc.setFont('helvetica', 'normal');
    const notes = [
      '1. Manufacturer\'s instructions for ultrasonic equipment are to be onsite and easily accessible.',
      '2. Always follow the manufacturer\'s instructions when using the ultrasonic equipment. Keep the lid closed to prevent aerosolizing solution.',
      '3. Do not overload the chamber or stack the instruments.',
      '4. Rinse items manually in a separate sink after ultrasonic cleaning.',
    ];
    notes.forEach((note, index) => {
      doc.text(note, margin, finalY + 150 + (index * lineHeight));
    });
  
    // Footer
    doc.setFontSize(8);
    const footerText = `${this.formData.logType} | ${new Date().toLocaleDateString('en-CA', { day:'numeric', month: 'long', year: 'numeric' })}`;
    doc.text(footerText, margin, pageHeight - margin);
    doc.text('1', pageWidth - margin, pageHeight - margin, { align: 'right' });
  
    // Save the PDF
    doc.save(`${this.formData.logType.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  }


  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  onManageAccount() {
    this.router.navigate(['/manageaccount']);
    this.closeSettings();
  }

  onForgetPassword() {
    this.router.navigate(['/forgetpasswordemail']);
  }

  updateEfficacyTestTypes(logType: string): void {
    // Reset values
    this.formData.efficacyTestType = '';
    this.showOtherEfficacyField = false;
    this.formData.otherEfficacyTestType = '';
    
    // Load efficacy tests from API with defaults based on log type
    this.loadEfficacyTests();
  }

  onLogTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newLogType = select.value;
    
    // First, update the log type in localStorage to persist through reload
    localStorage.setItem('selectedLogType', newLogType);
    
    // Force a hard reload of the page
    window.location.href = window.location.href;
  }
  // New method to validate the form
  validateForm(): boolean {
    let isValid = true;
    
    // Reset all errors
    this.formErrors = {};
    
    // Check if team member is selected
    if (!this.formData.teamMember) {
      this.formErrors['technician'] = true;
      isValid = false;
    }
    
    // Check if efficacy test type is selected
    if (!this.formData.efficacyTestType) {
      this.formErrors['efficacyTestType'] = true;
      isValid = false;
    }
    
    // If "Other" is selected, check if the other field has a value
    if (this.formData.efficacyTestType === 'Other' && !this.formData.otherEfficacyTestType) {
      this.formErrors['otherEfficacyTestType'] = true;
      isValid = false;
    }
    
    return isValid;
  }

  // Method to handle the save button click
  onSaveClick(): void {
    if (!this.validateForm()) {
      this.showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    // Prevent multiple submissions
    if (this.isSubmitting) {
      return;
    }
    
    this.isSubmitting = true;
    
    // Prepare the request DTO
    const requestDTO: UltraSonicRequestDTO = {
      date: new Date(this.formData.date),
      testType: this.formData.logType,
      solutionChanged: this.formData.solutionsChanged === 'Yes',
      result: this.formData.testResult,
      clinicName: this.clinicName,
      clinicAddress: this.clinicAddress,
      technicianName: this.formData.teamMember,
      efficacyTestName: this.formData.efficacyTestType === 'Other' 
        ? this.formData.otherEfficacyTestType 
        : this.formData.efficacyTestType
    };
    
    // Send the request to the API
    this.apiService.createUltrasonicRecord(requestDTO).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.showNotification('Record saved successfully', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error saving record:', error);
        this.showNotification('Failed to save record. Please try again.', 'error');
      }
    });
  }
  
  // Reset form after successful submission
  resetForm(): void {
    this.formData = {
      logType: this.formData.logType, // Keep the current log type
      date: this.getCurrentDateTime(),
      solutionsChanged: 'No',
      testResult: 'Pass',
      teamMember: '',
      efficacyTestType: '',
      otherEfficacyTestType: ''
    };
    this.showOtherEfficacyField = false;
  }
  
  // Display notification (you'll need to implement a notification component)
  showNotification(message: string, type: 'success' | 'error'): void {
    this.popupMessage = message;
    this.popupType = type;
    this.showPopup = true;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.closePopup();
    }, 1500);
  }
  
  closePopup(): void {
    this.showPopup = false;
  }



}