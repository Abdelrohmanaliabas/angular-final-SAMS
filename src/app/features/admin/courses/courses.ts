import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../../core/services/translate.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses {
  constructor(public i18n: TranslateService) {}
  courses = [
    { title: 'React Bootcamp', center: 'Skyline Learning', teacher: 'Mohamed Adel', status: 'Active' },
    { title: 'Python Fundamentals', center: 'Future Skills Hub', teacher: 'Sara Ibrahim', status: 'Draft' },
    { title: 'UI Design Basics', center: 'Gulf Academy', teacher: 'Ali Hassan', status: 'Active' },
  ];

  isFormOpen = false;
  isEditMode = false;
  currentIndex: number | null = null;
  formCourse = { title: '', center: '', teacher: '', status: 'Active' };

  openForm(course?: typeof this.formCourse) {
    this.isFormOpen = true;
    if (course) {
      this.isEditMode = true;
      this.formCourse = { ...course };
      this.currentIndex = this.courses.indexOf(course);
    } else {
      this.isEditMode = false;
      this.currentIndex = null;
      this.formCourse = { title: '', center: '', teacher: '', status: 'Active' };
    }
  }

  save() {
    if (this.isEditMode && this.currentIndex !== null) {
      this.courses[this.currentIndex] = { ...this.formCourse };
    } else {
      this.courses = [...this.courses, { ...this.formCourse }];
    }
    this.closeForm();
  }

  delete(course: typeof this.formCourse) {
    this.courses = this.courses.filter(c => c !== course);
  }

  closeForm() {
    this.isFormOpen = false;
  }
}
