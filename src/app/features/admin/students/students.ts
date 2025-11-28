import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../../core/services/translate.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students {
  constructor(public i18n: TranslateService) {}
  students = [
    { name: 'Omar Khaled', email: 'student1@example.com', center: 'Skyline Learning', status: 'Active' },
    { name: 'Mona El-Sayed', email: 'student2@example.com', center: 'Future Skills Hub', status: 'Pending' },
    { name: 'Sara Ibrahim', email: 'student3@example.com', center: 'Gulf Academy', status: 'Active' },
  ];

  isFormOpen = false;
  isEditMode = false;
  currentIndex: number | null = null;
  formStudent = { name: '', email: '', center: '', status: '' };

  openForm(student?: typeof this.formStudent) {
    this.isFormOpen = true;
    if (student) {
      this.isEditMode = true;
      this.formStudent = { ...student };
      this.currentIndex = this.students.indexOf(student);
    } else {
      this.isEditMode = false;
      this.currentIndex = null;
      this.formStudent = { name: '', email: '', center: '', status: '' };
    }
  }

  save() {
    if (this.isEditMode && this.currentIndex !== null) {
      this.students[this.currentIndex] = { ...this.formStudent };
    } else {
      this.students = [...this.students, { ...this.formStudent }];
    }
    this.closeForm();
  }

  delete(student: typeof this.formStudent) {
    this.students = this.students.filter(s => s !== student);
  }

  closeForm() {
    this.isFormOpen = false;
  }
}
