import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomcomboboxComponent } from '../customcombobox/customcombobox.component';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../apiservice.service';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';
import { WaterTestingRequestDTO } from '../apiinterfaces';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-watertestinglog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CustomcomboboxComponent, NotificationPopupComponent],
  templateUrl: './watertestinglog.component.html',
  styleUrl: './watertestinglog.component.css'
})
export class WatertestinglogComponent implements OnInit {
  username: any = localStorage.getItem('clinic');
  clinicAddress: string = localStorage.getItem('clinicAddress') || '';
  isLogoutOpen: boolean = false;
  showSettings = false;
  isMobile = window.innerWidth < 1024;
  menuOpen = false;
  showCustomLocationField = false;
  isLocationComboboxDisabled = false;
  currentDateTime: string;
  isSubmitting = false;
  
  // For displaying success/error messages
  showPopup = false;
  popupMessage = '';
  popupType: 'success' | 'error' = 'success';

  technicians$ = new BehaviorSubject<string[]>([]);
  locations$ = new BehaviorSubject<string[]>(['Operatory 1', 'Operatory 2', 'Add More']);
  devices$ = new BehaviorSubject<string[]>([]);
  passFailOptions$ = new BehaviorSubject<string[]>(['Pass', 'Fail']);

  formData = {
    date: '',
    dateOfResult: '',
    teamMember: '',
    location: '',
    customLocation: '',
    device: '', // Default value
    testResult: '',
    safetyLevel: '',
    correctiveAction: ''
  };

  formErrors: Record<string, boolean> = {};

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {
    this.currentDateTime = this.getCurrentDateTime();
    this.formData.date = this.currentDateTime;
    this.formData.dateOfResult = this.getCurrentDate();
  }
  
  reportsDropdownOpen = false;

  ngOnInit(): void {
    // Load data from API
    this.loadTechnicians();
    this.loadLocations();
    this.loadDevices();
  }

  toggleReportsDropdown() {
    this.reportsDropdownOpen = !this.reportsDropdownOpen;
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

  getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  loadTechnicians(): void {
    if (this.username) {
      this.apiService.getWaterTestingTechniciansByClinic(this.username).subscribe({
        next: (data) => this.technicians$.next(data),
        error: (error) => console.error('Error fetching clinic technicians:', error)
      });
    }
  }

  loadLocations(): void {
    if (this.username) {
      this.apiService.getLocationsByClinic(this.username).subscribe({
        next: (data) => {
          // Add default locations and "Add more" option
          const defaultLocations = ['Operatory 1', 'Operatory 2'];
          
          // Combine API results with default options, avoiding duplicates
          const locations = [...new Set([...defaultLocations, ...data.filter(loc => loc !== 'Operatory 1' && loc !== 'Operatory 2'), 'Add More'])];
          
          this.locations$.next(locations);
        },
        error: (error) => {
          console.error('Error fetching locations:', error);
          // If API fails, still show default options
          this.locations$.next(['Operatory 1', 'Operatory 2', 'Add More']);
        }
      });
    }
  }

  loadDevices(): void {
    if (this.username) {
      this.apiService.getDevicesByClinic(this.username).subscribe({
        next: (data) => {
          // Make sure "Source water" is in the list and at the top
          const deviceList = data.filter(device => device !== 'Source water');
          deviceList.unshift('Source water');
          this.devices$.next(deviceList);
        },
        error: (error) => {
          console.error('Error fetching devices:', error);
          // If API fails, still show default device
          this.devices$.next(['Source water']);
        }
      });
    }
  }

  onTeamMemberSelected(teamMember: string) {
    this.formData.teamMember = teamMember;
    if (this.formErrors['teamMember']) {
      this.formErrors['teamMember'] = false;
    }
  }

  onLocationSelected(location: string) {
    this.formData.location = location;
    
    // If "Add more" is selected, show custom location field and disable the combobox
    if (location === 'Add More') {
      this.showCustomLocationField = true;
      this.isLocationComboboxDisabled = true;
      this.formData.customLocation = '';
    } else {
      this.showCustomLocationField = false;
      this.isLocationComboboxDisabled = false;
    }
    
    if (this.formErrors['location']) {
      this.formErrors['location'] = false;
    }
  }

  onDeviceSelected(device: string) {
    this.formData.device = device;
    if (this.formErrors['device']) {
      this.formErrors['device'] = false;
    }
  }

  onTestResultSelected(result: string) {
    this.formData.testResult = result
    if (this.formErrors['testResult']) {
      this.formErrors['testResult'] = false;
    }
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
  
    doc.text('Clinic Name:', margin, headerStartY);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(this.username || 'Clinic Name', margin + 40, headerStartY);
  
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Clinic Address:', margin, headerStartY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(this.clinicAddress || 'Clinic Address', margin + 40, headerStartY + 8);
  
    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const title = 'Water Testing Log Sheet';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, headerStartY + 25);
  
    // Table with All Relevant Form Data
    const tableData = [
      [
        new Date(this.formData.date).toLocaleDateString('en-CA', { month: '2-digit', day: '2-digit', year: 'numeric' }) + ' ' + 
        new Date(this.formData.date).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }),
        new Date(this.formData.dateOfResult).toLocaleDateString('en-CA', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        this.formData.location === 'Add More' ? this.formData.customLocation : this.formData.location,
        this.formData.device,
        '', // Will be filled with test result in didDrawCell
        '', // Will be filled with safety level indicator in didDrawCell
        this.formData.teamMember,
      ],
    ];
  
    autoTable(doc, {
      startY: headerStartY + 30,
      head: [['Date', 'Date of Result', 'Location', 'Device', 'Test Result', 'Safety Level', 'Team Member']],
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
        0: { cellWidth: 25, cellPadding: 5 },
        1: { cellWidth: 30, cellPadding: 5 },
        2: { cellWidth: 30, cellPadding: 5 },
        3: { cellWidth: 30, cellPadding: 5 },
        4: { cellWidth: 25  },
        5: { cellWidth: 25},
        6: { cellWidth: 25, cellPadding: 5 },
      },
      didDrawCell: (data) => {
        if (data.row.section === 'body') {
          // Test Result column
          if (data.column.index === 4 && data.row.index === 0) {
            const cellCenterX = data.cell.x + (data.cell.width / 2);
            const cellCenterY = data.cell.y + (data.cell.height / 3);
            
            // Text for test result
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
          
          // Safety Level column
          if (data.column.index === 5 && data.row.index === 0) {
            const cellCenterX = data.cell.x + (data.cell.width / 2);
            const cellCenterY = data.cell.y + (data.cell.height / 3);
            
            // Circle indicators for safety level
            const circleRadius = 4;
            
            // Set color based on safety level
            if (this.formData.safetyLevel === 'safe') {
              doc.setFillColor(0, 128, 0); // Green
            } else if (this.formData.safetyLevel === 'warning') {
              doc.setFillColor(255, 255, 0); // Yellow
            } else if (this.formData.safetyLevel === 'danger') {
              doc.setFillColor(255, 0, 0); // Red
            } else {
              doc.setFillColor(128, 128, 128); // Gray for unknown
            }
            
            // Draw the circle
            doc.circle(cellCenterX, cellCenterY, circleRadius, 'F');
            
            
          }
        }
      },
    });
  
    // Get final Y position after the table
    let finalY = (doc as any).lastAutoTable.finalY || headerStartY + 150;
  
    // Corrective Action section (if any)
    if (this.formData.correctiveAction) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Corrective Action:', margin, finalY + 15);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      // Split long text into multiple lines
      const textLines = doc.splitTextToSize(this.formData.correctiveAction, pageWidth - (2 * margin));
      doc.text(textLines, margin, finalY + 25);
      
      // Update finalY based on the number of lines
      finalY += 20 + (textLines.length * 5);
    }
  
    // Notes Section
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES:', margin, 230);
    doc.setFont('helvetica', 'normal');
    const notes = [
      '1. Water testing should be conducted regularly according to clinic protocol.',
      '2. Follow manufacturer\'s instructions for the water testing device.',
      '3. For failed tests, appropriate corrective action must be taken immediately.',
      '4. Document all test results and actions taken.'
    ];
    notes.forEach((note, index) => {
      doc.text(note, margin, 240 + (index * lineHeight));
    });
  
    // Footer
    doc.setFontSize(8);
    const footerText = `Water Testing Log | ${new Date().toLocaleDateString('en-CA', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    doc.text(footerText, margin, pageHeight - margin);
    doc.text('1', pageWidth - margin, pageHeight - margin, { align: 'right' });
  
    // Save the PDF
    doc.save(`Water_Testing_Log_${new Date().toISOString().split('T')[0]}.pdf`);
  }

 
  updateSafetyColor(event: any) {
    const value = event.target.value;
    this.formData.safetyLevel = value;
    
    if (this.formErrors['safetyLevel']) {
      this.formErrors['safetyLevel'] = false;
    }
  }

  hasError(fieldName: string): boolean {
    return this.formErrors[fieldName] === true;
  }

  validateForm(): boolean {
    let isValid = true;
    
    // Reset all errors
    this.formErrors = {};
    
    // Check if team member is selected
    if (!this.formData.teamMember) {
      this.formErrors['teamMember'] = true;
      isValid = false;
    }
    
    // Check location
    if (!this.formData.location) {
      this.formErrors['location'] = true;
      isValid = false;
    }
    
    // If "Add more" is selected, check if custom location is provided
    if (this.formData.location === 'Add More' && !this.formData.customLocation) {
      this.formErrors['customLocation'] = true;
      isValid = false;
    }
    
    // Check if device is selected
    if (!this.formData.device) {
      this.formErrors['device'] = true;
      isValid = false;
    }

    if (!this.formData.testResult) {
      this.formErrors['testResult'] = true;
      isValid = false;
    }
    
    // Check if safety level is selected
    if (!this.formData.safetyLevel) {
      this.formErrors['safetyLevel'] = true;
      isValid = false;
    }
    
    return isValid;
  }

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
    
    // Determine the actual location value based on selection
    const actualLocation = this.formData.location === 'Add more' 
      ? this.formData.customLocation
      : this.formData.location;
    
    // Prepare the request DTO
    const requestDTO: WaterTestingRequestDTO = {
      date: new Date(this.formData.date),
      resultDate: new Date(this.formData.dateOfResult),
      clinicName: this.username,
      clinicAddress: this.clinicAddress,
      technicianName: this.formData.teamMember,
      locationName: actualLocation,
      deviceName: this.formData.device,
      result: this.formData.testResult,
      safetyLevel: this.formData.safetyLevel,
      correctiveAction: this.formData.correctiveAction || null
    };
    
    // Send the request to the API
    this.apiService.createWaterTestingRecord(requestDTO).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.showNotification('Record saved successfully', 'success');
        this.resetForm();
        this.ngOnInit();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error saving record:', error);
        this.showNotification('Failed to save record. Please try again.', 'error');
      }
    });
  }
  
  resetForm(): void {
    this.formData = {
      date: this.getCurrentDateTime(),
      dateOfResult: this.getCurrentDate(),
      teamMember: '',
      location: '',
      customLocation: '',
      device: 'Source water',
      testResult: 'Pass',
      safetyLevel: '',
      correctiveAction: ''
    };
    this.showCustomLocationField = false;
    this.isLocationComboboxDisabled = false;
  }
  
  showNotification(message: string, type: 'success' | 'error'): void {
    this.popupMessage = message;
    this.popupType = type;
    this.showPopup = true;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.closePopup();
    }, 3000);
  }
  
  closePopup(): void {
    this.showPopup = false;
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
}