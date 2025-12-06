import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TeacherService } from '../../../core/services/teacher.service';
import { TokenStorageService } from '../../../core/auth/token-storage.service';

interface StaffGroupRow {
  id: number;
  title: string;
  subject: string;
  center: string;
  teacher: string;
  status: 'Active' | 'Inactive';
  schedule?: string;
  studentsCount?: number;
  raw: any;
}

@Component({
  selector: 'app-staff-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class StaffGroups implements OnInit {
  constructor(
    private staffService: TeacherService,
    private tokenStorage: TokenStorageService,
    private cdr: ChangeDetectorRef
  ) {}

  loading = false;
  searchTerm = '';
  panelOpen = false;
  panelMode: 'info' | 'create' = 'info';
  selectedGroup: StaffGroupRow | null = null;
  groups: StaffGroupRow[] = [];
  processing = false;
  groupForm = {
    name: '',
    subject: '',
    description: '',
    scheduleDays: ['Monday', 'Wednesday'] as string[],
    schedule_time: '16:00',
    sessions_count: 8
  };
  readonly dayOptions = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  private roles: string[] = [];
  private centerAccessUnavailable = false;

  ngOnInit(): void {
    this.roles = this.tokenStorage.getUser()?.roles ?? [];
    this.loadGroups();
  }

  get isCenterAdmin(): boolean {
    return this.roles.includes('center_admin');
  }

  get canCreateGroup(): boolean {
    return this.roles.some((role) => role === 'teacher' || role === 'assistant');
  }

  private loadGroups(): void {
    this.loading = true;

    if (this.isCenterAdmin && !this.centerAccessUnavailable) {
      this.staffService.getCenterGroups().subscribe({
        next: (res) => {
          this.groups = this.mapGroups(res);
          this.finishLoading();
        },
        error: (error: HttpErrorResponse) => {
          if (error?.status === 404) {
            this.centerAccessUnavailable = true;
            this.loadTeacherGroups();
          } else {
            this.finishLoading();
          }
        }
      });
      return;
    }

    this.loadTeacherGroups();
  }

  private loadTeacherGroups(): void {
    this.staffService.getGroups().subscribe({
      next: (res) => {
        this.groups = this.mapGroups(res);
        this.finishLoading();
      },
      error: () => this.finishLoading()
    });
  }

  private mapGroups(response: any): StaffGroupRow[] {
    const payload = response?.data ?? response ?? [];
    const items = payload?.data ?? payload ?? [];

    return items.map((g: any) => ({
      id: g.id,
      title: g.name,
      subject: g.subject ?? 'General',
      center: g.center?.name ?? '-',
      teacher: g.teacher?.name ?? '-',
      status: g.is_active ? 'Active' : 'Inactive',
      schedule: this.formatSchedule(g),
      studentsCount: g.students_count ?? g.students?.length ?? undefined,
      raw: g
    }));
  }

  private formatSchedule(group: any): string {
    if (!group?.schedule_days || !group?.schedule_time) {
      return 'Flexible schedule';
    }

    const days = Array.isArray(group.schedule_days)
      ? group.schedule_days.join(', ')
      : group.schedule_days;
    return `${days} @ ${group.schedule_time}`;
  }

  get filteredGroups(): StaffGroupRow[] {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) {
      return this.groups;
    }

    return this.groups.filter((group) =>
      [group.title, group.subject, group.teacher, group.center]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }

  openInfo(group: StaffGroupRow): void {
    this.selectedGroup = group;
    this.panelMode = 'info';
    this.panelOpen = true;
  }

  closeInfo(): void {
    this.panelOpen = false;
    this.selectedGroup = null;
    this.panelMode = 'info';
    this.processing = false;
  }

  openCreate(): void {
    if (!this.canCreateGroup) return;
    this.groupForm = {
      name: '',
      subject: '',
      description: '',
      scheduleDays: ['Monday', 'Wednesday'],
      schedule_time: '16:00',
      sessions_count: 8
    };
    this.panelMode = 'create';
    this.panelOpen = true;
  }

  toggleScheduleDay(day: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.groupForm.scheduleDays.includes(day)) {
        this.groupForm.scheduleDays.push(day);
      }
    } else {
      this.groupForm.scheduleDays = this.groupForm.scheduleDays.filter((d) => d !== day);
    }
  }

  submitGroup(): void {
    if (!this.canCreateGroup || this.processing || !this.groupForm.name || !this.groupForm.subject) {
      return;
    }
    if (!this.groupForm.scheduleDays.length) {
      return;
    }
    this.processing = true;
    this.staffService
      .createTeacherManagedGroup({
        name: this.groupForm.name,
        subject: this.groupForm.subject,
        description: this.groupForm.description,
        schedule_days: this.groupForm.scheduleDays,
        schedule_time: this.groupForm.schedule_time,
        sessions_count: this.groupForm.sessions_count
      })
      .subscribe({
        next: () => {
          this.closeInfo();
          this.loadGroups();
        },
        error: () => {
          this.processing = false;
          this.cdr.detectChanges();
        }
      });
  }

  private finishLoading(): void {
    this.loading = false;
    this.cdr.detectChanges();
  }
}
