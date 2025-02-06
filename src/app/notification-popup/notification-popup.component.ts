import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notification-popup',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './notification-popup.component.html',
  styleUrl: './notification-popup.component.css'
})
export class NotificationPopupComponent {
  @Input() isOpen: boolean = false;
  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';
  @Output() onClose = new EventEmitter<void>();

  closePopup(): void {
    this.onClose.emit();
  }

  // Close popup when clicking outside
  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('popup-overlay')) {
      this.closePopup();
    }
  }
}
