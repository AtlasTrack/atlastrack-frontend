import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';

@Component({
  selector: 'app-devicedescription',
  standalone: true,
  imports: [FormsModule, CommonModule, NotificationPopupComponent],
  templateUrl: './devicedescription.component.html',
  styleUrl: './devicedescription.component.css'
})
export class DevicedescriptionComponent {
  incubatorSerialNumber: string = 'SN-111 222 333';
  biType: string = 'Atlas Rapid AX224';

  showPopup = false;
  popupMessage = '';
  showSidebar: boolean = false;
  popupType: 'success' | 'error' = 'success';

   onServicePackClick() {
    // Store values in localStorage
    localStorage.setItem('servicePackSerial', this.incubatorSerialNumber);
    localStorage.setItem('biType', this.biType)
    
    // Optional: You can add confirmation logic here
    console.log('Values stored in localStorage:', {
      incubatorSerial: this.incubatorSerialNumber,
      biType: this.biType
    });

    this.showPopup = true;
    this.popupMessage = 'Serial and BI Type stored successfully!';
    this.popupType = 'success';

  }

  closePopup() {
    this.showPopup = false;
    this.popupMessage = '';
  }

}
