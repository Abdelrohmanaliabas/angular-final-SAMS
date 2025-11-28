import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateService } from '../../../core/services/translate.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})

export class AdminDashboard {
  constructor(public i18n: TranslateService) {}
  // small sample data to render the overview
  stats = {
    centers: 12,
    paidCenters: 8,
    unpaidCenters: 4,
    courses: 48,
    activeCourses: 34,
    teachers: 28,
    onlineTeachers: 10,
    students: 420,
    attendanceToday: 388,
  };

  recent = [
    { titleKey: 'recent.item1', time: 'Today, 10:00 AM' },
    { titleKey: 'recent.item2', time: 'Today, 03:00 PM' },
    { titleKey: 'recent.item3', time: 'Today, 05:00 PM' },
  ];
}
