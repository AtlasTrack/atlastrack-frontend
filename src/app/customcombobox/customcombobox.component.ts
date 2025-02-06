import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-customcombobox',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './customcombobox.component.html',
  styleUrl: './customcombobox.component.css'
})
export class CustomcomboboxComponent implements OnInit {
  @Input() items$?: Observable<string[]>;  // Items passed to the combobox (can be dynamic)
  @Input() placeholder: string = ''; // Placeholder text for the input field
  @Input() initialValue: string = ''; // Initial value to show in the input field
  @Output() selectionChange = new EventEmitter<string>(); // Emit the selected value
  
  inputValue: string = '';
  filteredItems: string[] = [];
  showDropdown: boolean = false;
  private allItems: string[] = [];

  ngOnInit() {
    this.inputValue = this.initialValue;
    
    // Subscribe to items$ if provided
    if (this.items$) {
      this.items$.subscribe(items => {
        this.allItems = items;
        this.filteredItems = [...items];
        // If there's an initial value, try to select it
        if (this.initialValue && items.includes(this.initialValue)) {
          this.selectItem(this.initialValue);
        }
      });
    } else if (this.items$) {
      this.allItems = [...this.items$];
      this.filteredItems = [...this.items$];
    }
  }


  // Method to filter items based on user input
  filterItems() {
    this.filteredItems = this.allItems.filter(item => 
      item.toLowerCase().includes(this.inputValue.toLowerCase())
    );
  }
  // Method to select an item from the dropdown
  
  selectItem(item: string) {
    this.inputValue = item;
    this.showDropdown = false;
    this.selectionChange.emit(item);
  }

  // Method to add a new item (if applicable)
  addNewItem() {
  
      if (this.inputValue && !this.allItems.includes(this.inputValue)) {
        this.allItems.push(this.inputValue);
        this.filteredItems = [...this.allItems];
        this.selectItem(this.inputValue);
      } else if (this.inputValue) {
        this.selectItem(this.inputValue);
      }
      this.showDropdown = false;
  }

  onFocus() {
    this.showDropdown = true;
    this.filterItems();
  }

  onBlur() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  onInputChange(value: string) {
    this.selectionChange.emit(value);
  }
}
