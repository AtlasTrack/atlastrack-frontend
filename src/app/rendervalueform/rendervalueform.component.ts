import { CommonModule } from '@angular/common';
import { Component, inject, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomcomboboxComponent } from '../customcombobox/customcombobox.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ApiService } from '../apiservice.service';
import { BehaviorSubject } from 'rxjs';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';

interface FormData {
  startTime: string;
  endTime: string;
  wellNumber: string;
  serialNumber: string;
  result: string;
  biType: string;
  control: boolean;
  biLotNumber: string;
  sterilizerModel: string;
  loadNumber: string;
  implant: boolean;
  technician: string;
  cycleType: string;
  chemicalIntegrator: string;
}

@Component({
  selector: 'app-rendervalueform',
  standalone: true,
  imports: [FormsModule, CommonModule, CustomcomboboxComponent, NotificationPopupComponent],

  templateUrl: './rendervalueform.component.html',
  styleUrl: './rendervalueform.component.css'
})
export class RendervalueformComponent {

  private apiService=inject(ApiService);

  serialNumbers$ = new BehaviorSubject<string[]>([]);
  results$ = new BehaviorSubject<string[]>([]);
  biTypes$ = new BehaviorSubject<string[]>([]);
  sterilizerModels$ = new BehaviorSubject<string[]>([]);
  technicians$ = new BehaviorSubject<string[]>([]);
  chemicalIntegrators$ = new BehaviorSubject<string[]>([]);
  biLotNumbers$ = new BehaviorSubject<string[]>([]);
  loadNumbers$ = new BehaviorSubject<string[]>([]);
  cycleCounts$ = new BehaviorSubject<string[]>([]);
  wellNumbers$ =new BehaviorSubject<string[]>(['1', '2', '3', '4', '5', '6', '7']);

  startDateTime: string;
  endDateTime: string;
  showPopup = false;
  popupMessage = '';
  popupType: 'success' | 'error' = 'success';

  formData: FormData = {
    startTime: new Date().toLocaleString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }),
    endTime: new Date().toLocaleString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }),
    wellNumber: '',
    serialNumber: '',
    result: '',
    biType: '',
    control: false,
    biLotNumber: '',
    sterilizerModel: '',
    loadNumber: '',
    implant: false,
    technician: '',
    cycleType: '',
    chemicalIntegrator: ''
  };

 
  
  initialSerialNumber: any = localStorage.getItem('servicePackSerial');
  initialBIType: any = localStorage.getItem('biType');
  username: any = localStorage.getItem('clinic');
  clinicAddress: any = localStorage.getItem('clinicAddress');

  constructor(private router: Router) {
    const now = new Date();
    this.startDateTime = this.formatDateTimeForInput(now);
    this.endDateTime = this.formatDateTimeForInput(now);
  }

  ngOnInit() {
    const now = new Date();
    this.startDateTime = this.formatDateTimeForInput(now);
    this.endDateTime = this.formatDateTimeForInput(now);
    this.formData.serialNumber = this.initialSerialNumber;
    this.formData.biType = this.initialBIType;
    this.updateFormTimes();
    this.fetchDropdownData();
    console.log("Serial ", this.initialSerialNumber);
    console.log('Bi type', this.initialBIType);
  }


  private fetchDropdownData(): void {
    this.apiService.getSerialNumbers().subscribe({
      next: (data) => this.serialNumbers$.next(data),
      error: (error) => console.error('Error fetching serial numbers:', error)
    });

    this.apiService.getResults().subscribe({
      next: (data) => this.results$.next(data),
      error: (error) => console.error('Error fetching results:', error)
    });

    this.apiService.getBiTypes().subscribe({
      next: (data) => this.biTypes$.next(data),
      error: (error) => console.error('Error fetching BI types:', error)
    });

    this.apiService.getSterilizerModels().subscribe({
      next: (data) => this.sterilizerModels$.next(data),
      error: (error) => console.error('Error fetching sterilizer models:', error)
    });

    this.apiService.getTechnicians().subscribe({
      next: (data) => this.technicians$.next(data),
      error: (error) => console.error('Error fetching technicians:', error)
    });

    this.apiService.getChemicalIntegrators().subscribe({
      next: (data) => this.chemicalIntegrators$.next(data),
      error: (error) => console.error('Error fetching chemical integrators:', error)
    });

    this.apiService.getBiLotNumbers().subscribe({
      next: (data) => this.biLotNumbers$.next(data),
      error: (error) => console.error('Error fetching BI lot numbers:', error)
    });

    this.apiService.getLoadNumbers().subscribe({
      next: (data) => this.loadNumbers$.next(data),
      error: (error) => console.error('Error fetching load numbers:', error)
    });

    this.apiService.getCycleCounts().subscribe({
      next: (data) => this.cycleCounts$.next(data),
      error: (error) => console.error('Error fetching cycle counts:', error)
    });
  }
  // Updated to include seconds
  private formatDateTimeForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  onStartDateTimeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const date = new Date(input.value);
      this.formData.startTime = date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }
  }

  onEndDateTimeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const date = new Date(input.value);
      this.formData.endTime = date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }
  }

  private updateFormTimes() {
    const start = new Date(this.startDateTime);
    const end = new Date(this.endDateTime);
    this.formData.startTime = start.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    this.formData.endTime = end.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
  onSerialNumberSelected(serial: string) {
    this.formData.serialNumber = serial;
  }

  onWellNumberSelected(wellNumber: string) {
    this.formData.wellNumber = wellNumber;
  }

  onResultSelected(result: string) {
    this.formData.result = result;
  }

  onBITypeSelected(biType: string) {
    this.formData.biType = biType;
  }

  onSterilizerModelSelected(model: string) {
    this.formData.sterilizerModel = model;
  }

  onTechnicianSelected(technician: string) {
    this.formData.technician = technician;
  }

  onChemicalIntegratorSelected(integrator: string) {
    this.formData.chemicalIntegrator = integrator;
  }

   // Add event handlers for new dropdowns if needed
   onBiLotNumberSelected(lotNumber: string): void {
    this.formData.biLotNumber = lotNumber;
  }

  onLoadNumberSelected(loadNumber: string): void {
    this.formData.loadNumber = loadNumber;
  }

  onCycleTypeSelected(cycleType: string): void {
    this.formData.cycleType = cycleType;
  }

  onCloseClick() {
    this.router.navigate(['/home']);
  }

  generatePDF() {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Atlas Track', doc.internal.pageSize.width / 2, 15, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Auto-reader Values Report', doc.internal.pageSize.width / 2, 25, { align: 'center' });
    
    const tableData = [
      ['Start Time', this.formData.startTime],
      ['End Time', this.formData.endTime],
      ['Clinic Name', this.username],
      ['Clinic Address', this.clinicAddress],
      ['Well Number', this.formData.wellNumber],
      ['Serial Number', this.formData.serialNumber],
      ['Result', this.formData.result],
      ['BI Type', this.formData.biType],
      ['Control', this.formData.control ? 'Yes' : 'No'],
      ['BI Lot Number', this.formData.biLotNumber],
      ['Sterilizer Model', this.formData.sterilizerModel],
      ['Load Number', this.formData.loadNumber],
      ['Implant', this.formData.implant ? 'Yes' : 'No'],
      ['Technician', this.formData.technician],
      ['Cycle Type / Parameters', this.formData.cycleType],
      ['Chemical Integrator', this.formData.chemicalIntegrator]
    ];

    autoTable(doc, {
      startY: 35,
      head: [['Field', 'Value']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [85, 85, 85],
        textColor: 255
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      columnStyles: {
        0: { fontStyle: 'bold' }
      }
    });

    const today = new Date();
    doc.setFontSize(10);
    doc.text(`Generated on: ${today}`, 14, doc.internal.pageSize.height - 10);

    doc.save('auto-reader-values.pdf');
  }

  onSave() {
    const startDate = new Date(this.startDateTime);
    const endDate = new Date(this.endDateTime);

    if (endDate < startDate) {
      this.showPopup = true;
      this.popupMessage = 'End time cannot be before start time';
      this.popupType = 'error';
      return;
    }

    const requestData = {
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      wellNumber: parseInt(this.formData.wellNumber),
      serialNumber: this.formData.serialNumber,
      result: this.formData.result,
      biType: this.formData.biType,
      isControlTest: this.formData.control,
      biLotNumber: this.formData.biLotNumber,
      sterilizerModels: this.formData.sterilizerModel,
      loadNumber: this.formData.loadNumber,
      isImplant: this.formData.implant,
      technicianNames: this.formData.technician,
      cycleCount: this.formData.cycleType,
      chemicalIntegrators: this.formData.chemicalIntegrator,
      clinicName: this.username,
      clinicAddress:this.clinicAddress
    };

    this.apiService.createRecord(requestData).subscribe({
      next: (response) => {
        console.log('Record created successfully:', response);
        this.showPopup = true;
        this.popupMessage = 'Record saved successfully!';
        this.popupType = 'success';
        this.resetForm();
      },
      error: (error) => {
        console.error('Error creating record:', error);
        this.showPopup = true;
        this.popupMessage = `Error saving record: Please Fill All Fields`;
        this.popupType = 'error';
      }
    });
  }

  // Add this method to close the popup
  closePopup() {
    this.showPopup = false;
    this.popupMessage = '';
  }
  // onVisitMore() {
  //   this.router.navigate(['/report']); 
  // }


  private resetForm() {
    // Reset dates to current time
    const now = new Date();
    this.startDateTime = this.formatDateTimeForInput(now);
    this.endDateTime = this.formatDateTimeForInput(now);
  
    // Reset all form fields
    this.formData = {
      startTime: now.toLocaleString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      endTime: now.toLocaleString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      wellNumber: '',
      serialNumber: '',
      result: '',
      biType: '',
      control: false,
      biLotNumber: '',
      sterilizerModel: '',
      loadNumber: '',
      implant: false,
      technician: '',
      cycleType: '',
      chemicalIntegrator: ''
    };
  
    // Reset the CustomCombobox components
    // You'll need to add these ViewChild references at the top of your component
    const comboboxInputs = document.querySelectorAll('app-customcombobox input') as NodeListOf<HTMLInputElement>;
    comboboxInputs.forEach(input => {
      input.value = '';
    });
  }
}