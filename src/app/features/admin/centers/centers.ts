import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../../core/services/translate.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-centers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centers.html',
  styleUrl: './centers.css',
})
export class Centers {
  constructor(public i18n: TranslateService) {}
  centers = [
    { name: 'Skyline Learning', city: 'Cairo', phone: '+20 123 456 7890', paid: true },
    { name: 'Future Skills Hub', city: 'Alexandria', phone: '+20 111 222 3344', paid: false },
    { name: 'Gulf Academy', city: 'Riyadh', phone: '+966 50 123 4567', paid: true },
  ];

  isFormOpen = false;
  isEditMode = false;
  currentIndex: number | null = null;
  formCenter = { name: '', city: '', phone: '', paid: false };

  openForm(center?: typeof this.formCenter) {
    this.isFormOpen = true;
    if (center) {
      this.isEditMode = true;
      this.formCenter = { ...center };
      this.currentIndex = this.centers.findIndex(c => c.name === center.name && c.phone === center.phone);
    } else {
      this.isEditMode = false;
      this.currentIndex = null;
      this.formCenter = { name: '', city: '', phone: '', paid: false };
    }
  }

  save() {
    if (this.isEditMode && this.currentIndex !== null) {
      this.centers[this.currentIndex] = { ...this.formCenter };
    } else {
      this.centers = [...this.centers, { ...this.formCenter }];
    }
    this.closeForm();
  }

  delete(center: typeof this.formCenter) {
    this.centers = this.centers.filter(c => !(c.name === center.name && c.phone === center.phone));
  }

  closeForm() {
    this.isFormOpen = false;
  }
}
