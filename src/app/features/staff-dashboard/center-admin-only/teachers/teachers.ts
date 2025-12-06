import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TeacherService } from '../../../../core/services/teacher.service';
import { TokenStorageService } from '../../../../core/auth/token-storage.service';

@Component({
  selector: 'app-staff-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css',
})
export class Teachers implements OnInit {
  constructor(
    private staffService: TeacherService,
    private tokenStorage: TokenStorageService,
    private cdr: ChangeDetectorRef
  ) { }

  teachers: any[] = [];
  loading = false;

  searchTerm = '';
  panelOpen = false;
  selectedTeacher: any = null;
  panelMode: 'info' | 'create' | 'edit' = 'info';
  form = { name: '', email: '', phone: '', role: 'teacher' as 'teacher' | 'assistant' };
  processing = false;
  private roles: string[] = [];
  private centerAccessUnavailable = false;
  activeRole: 'teacher' | 'assistant' = 'teacher';

  ngOnInit(): void {
    this.roles = this.tokenStorage.getUser()?.roles ?? [];
    this.loadTeachers();
  }

  get isCenterAdmin(): boolean {
    return this.roles.includes('center_admin');
  }

  get panelTitle(): string {
    if (this.panelMode === 'create') {
      return this.form.role === 'teacher' ? 'Add Teacher' : 'Add Assistant';
    }
    if (this.panelMode === 'edit') {
      return `Edit ${this.selectedTeacher?.name ?? 'Staff'}`;
    }
    return 'Staff info';
  }

  private loadTeachers() {
    this.loading = true;

    if (this.isCenterAdmin && !this.centerAccessUnavailable) {
      this.staffService.getMembers({ role: this.activeRole }).subscribe({
        next: (res) => {
          const payload = res?.data ?? res;
          const teachers = this.unwrapCollection(
            this.activeRole === 'teacher' ? payload?.teachers ?? payload : payload?.assistants ?? payload
          );
          this.teachers = teachers.map((t: any) => ({
            id: t.id,
            name: t.name,
            email: t.email,
            center: payload?.center?.name ?? t.center?.name ?? '',
            courses: t.groups_count ?? t.groups?.length ?? 0,
            phone: t.phone || '',
            raw: t,
          }));
          this.finishLoading();
        },
        error: (err: HttpErrorResponse) => {
          if (err?.status === 404) {
            this.centerAccessUnavailable = true;
            this.loadDirectoryTeachers();
          } else {
            this.finishLoading();
          }
        }
      });
      return;
    }

    this.loadDirectoryTeachers();
  }

  private loadDirectoryTeachers(): void {
    this.staffService.getTeachers().subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const items = this.unwrapCollection(payload);
        this.teachers = items.map((t: any) => ({
          id: t.id,
          name: t.name,
          email: t.email,
          center: t.taught_groups?.[0]?.center?.name || t.center?.name || '',
          courses: t.taught_groups_count ?? t.taughtGroups_count ?? t.taught_groups?.length ?? 0,
          phone: t.phone || '',
          raw: t,
        }));
        this.finishLoading();
      },
      error: () => this.finishLoading()
    });
  }

  private unwrapCollection(collection: any): any[] {
    if (!collection) {
      return [];
    }
    if (Array.isArray(collection)) {
      return collection;
    }
    if (Array.isArray(collection.data)) {
      return collection.data;
    }
    return Array.isArray(collection.items) ? collection.items : [];
  }

  get filteredTeachers() {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this.teachers;
    return this.teachers.filter(t =>
      (t.name || '').toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q) ||
      (t.center || '').toLowerCase().includes(q) ||
      String(t.courses ?? '').toLowerCase().includes(q) ||
      (t.phone || '').toLowerCase().includes(q)
    );
  }

  openInfo(teacher: any) {
    this.selectedTeacher = teacher;
    this.panelMode = 'info';
    this.panelOpen = true;
  }

  closeInfo() {
    this.panelOpen = false;
    this.selectedTeacher = null;
    this.panelMode = 'info';
  }

  setRoleFilter(role: 'teacher' | 'assistant'): void {
    if (this.activeRole === role) {
      return;
    }
    this.activeRole = role;
    this.loadTeachers();
  }

  openCreate(role: 'teacher' | 'assistant'): void {
    if (!this.isCenterAdmin) return;
    this.form = { name: '', email: '', phone: '', role };
    this.selectedTeacher = null;
    this.panelMode = 'create';
    this.panelOpen = true;
  }

  openEdit(teacher: any): void {
    if (!this.isCenterAdmin) return;
    this.selectedTeacher = teacher;
    this.form = {
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone ?? '',
      role: this.activeRole
    };
    this.panelMode = 'edit';
    this.panelOpen = true;
  }

  submitForm(): void {
    if (!this.isCenterAdmin || this.processing) {
      return;
    }

    if (!this.form.name || !this.form.email) {
      return;
    }

    this.processing = true;
    const payload: any = {
      name: this.form.name,
      email: this.form.email,
      phone: this.form.phone,
      role: this.form.role
    };

    const request$ =
      this.panelMode === 'create'
        ? this.staffService.createManagementUser(payload)
        : this.staffService.updateManagementUser(this.selectedTeacher.id, {
          name: this.form.name,
          email: this.form.email,
          phone: this.form.phone
        });

    request$.subscribe({
      next: () => {
        this.closeInfo();
        this.loadTeachers();
      },
      error: () => {
        this.processing = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.processing = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteSelected(): void {
    if (!this.isCenterAdmin || !this.selectedTeacher || this.processing) {
      return;
    }
    this.processing = true;
    this.staffService.deleteManagementUser(this.selectedTeacher.id).subscribe({
      next: () => {
        this.closeInfo();
        this.loadTeachers();
      },
      error: () => {
        this.processing = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.processing = false;
        this.cdr.detectChanges();
      }
    });
  }

  get canEditSelected(): boolean {
    return this.isCenterAdmin && !!this.selectedTeacher;
  }

  private finishLoading(): void {
    this.loading = false;
    this.cdr.detectChanges();
  }
}
