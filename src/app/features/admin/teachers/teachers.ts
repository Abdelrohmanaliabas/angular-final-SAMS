import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../../core/services/translate.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css',
})
export class Teachers {
  constructor(public i18n: TranslateService) {}
  teachers = [
    {name: 'Mohamed Adel', email: 'mohamed@example.com', center: 'Skyline Learning', courses: 5, phone: '+20 123 456 7890'},
    {name: 'Sara Ibrahim', email: 'sara@example.com', center: 'Future Skills Hub', courses: 3, phone: '+20 111 222 3344'},
    {name: 'Ali Hassan', email: 'ali@example.com', center: 'Gulf Academy', courses: 7, phone: '+966 50 123 4567'},
  ];

  isFormOpen = false;
  isEditMode = false;
  currentIndex: number | null = null;
  formTeacher = { name: '', email: '', center: '', courses: 0, phone: '' };

  openForm(teacher?: typeof this.formTeacher) {
    this.isFormOpen = true;
    if (teacher) {
      this.isEditMode = true;
      this.formTeacher = { ...teacher };
      this.currentIndex = this.teachers.indexOf(teacher);
    } else {
      this.isEditMode = false;
      this.currentIndex = null;
      this.formTeacher = { name: '', email: '', center: '', courses: 0, phone: '' };
    }
  }

  save() {
    if (this.isEditMode && this.currentIndex !== null) {
      this.teachers[this.currentIndex] = { ...this.formTeacher };
    } else {
      this.teachers = [...this.teachers, { ...this.formTeacher }];
    }
    this.closeForm();
  }

  delete(teacher: typeof this.formTeacher) {
    this.teachers = this.teachers.filter(t => t !== teacher);
  }

  closeForm() {
    this.isFormOpen = false;
  }
}
