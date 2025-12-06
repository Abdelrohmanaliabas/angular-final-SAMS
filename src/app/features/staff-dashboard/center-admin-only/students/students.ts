import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { TeacherService } from '../../../../core/services/teacher.service';
import { TokenStorageService } from '../../../../core/auth/token-storage.service';

@Component({
  selector: 'app-staff-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students.html',
  styleUrl: './students.css'
})
export class Students implements OnInit {
  constructor(
    private staffService: TeacherService,
    private tokenStorage: TokenStorageService,
    private cdr: ChangeDetectorRef
  ) { }

  students: any[] = [];
  loading = false;
  searchTerm = '';
  panelOpen = false;
  selectedStudent: any = null;
  panelMode: 'info' | 'create-student' | 'create-parent' | 'edit-student' = 'info';
  studentForm = { name: '', email: '', phone: '', groupId: '' };
  parentForm = { name: '', email: '', phone: '', studentId: '' };
  processing = false;
  private roles: string[] = [];
  availableGroups: any[] = [];
  centerGroupsUnavailable = false;

  ngOnInit(): void {
    this.roles = this.tokenStorage.getUser()?.roles ?? [];
    this.loadStudents();
    this.loadGroupsForForms();
  }

  get isCenterAdmin(): boolean {
    return this.roles.includes('center_admin');
  }

  private loadStudents(): void {
    this.loading = true;

    if (this.isCenterAdmin) {
      this.staffService.getMembers().subscribe({
        next: (res) => {
          const payload = res?.data ?? res;
          const collection = payload?.students ?? [];
          const items = this.unwrapCollection(collection);
          this.students = items.map((student: any) => ({
            id: student.id,
            name: student.name,
            email: student.email,
            center: payload?.center?.name ?? student.center?.name ?? '',
            status: student.status ?? 'active',
            phone: student.phone ?? '',
            groups: [],
            raw: student
          }));
          this.finishLoading();
        },
        error: (err: HttpErrorResponse) => {
          if (err?.status === 404) {
            this.loadTeacherStudents();
          } else {
            this.finishLoading();
          }
        }
      });
      return;
    }

    this.loadTeacherStudents();
  }

  private loadTeacherStudents(): void {
    this.staffService.getGroups().subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const groups = this.unwrapCollection(payload);

        if (!groups.length) {
          this.students = [];
          this.finishLoading();
          return;
        }

        const requests = groups.map((group: any) =>
          this.staffService.getGroupStudents(group.id)
        );

        forkJoin(requests).subscribe({
          next: (results) => {
            const aggregated = new Map<number, any>();

            results.forEach((result, index) => {
              const students = this.unwrapCollection(result);
              const group = groups[index];

              students.forEach((student: any) => {
                const groupName = group?.name ?? 'Group';
                const existing = aggregated.get(student.id);

                if (existing) {
                  if (!existing.groups.includes(groupName)) {
                    existing.groups.push(groupName);
                  }
                } else {
                  aggregated.set(student.id, {
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    center: group?.center?.name ?? '',
                    status: 'active',
                    phone: student.phone ?? '',
                    groups: [groupName],
                    raw: student
                  });
                }
              });
            });

            this.students = Array.from(aggregated.values());
            this.finishLoading();
          },
          error: () => this.finishLoading()
        });
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

  get filteredStudents(): any[] {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) {
      return this.students;
    }

    return this.students.filter((student) =>
      [student.name, student.email, student.center, student.status, (student.groups ?? []).join(', ')]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }

  openInfo(student: any): void {
    this.selectedStudent = student;
    this.panelMode = 'info';
    this.panelOpen = true;
  }

  closeInfo(): void {
    this.panelOpen = false;
    this.selectedStudent = null;
    this.panelMode = 'info';
  }

  private finishLoading(): void {
    this.loading = false;
    this.cdr.detectChanges();
  }

  get canAddMembers(): boolean {
    return (
      this.isCenterAdmin ||
      this.roles.some((role) => role === 'teacher' || role === 'assistant')
    );
  }

  get canEditStudents(): boolean {
    return this.isCenterAdmin;
  }

  get panelTitle(): string {
    switch (this.panelMode) {
      case 'create-student':
        return 'Add Student';
      case 'create-parent':
        return 'Add Parent';
      case 'edit-student':
        return `Edit ${this.selectedStudent?.name ?? 'Student'}`;
      default:
        return 'Student info';
    }
  }

  private loadGroupsForForms(): void {
    const source$ =
      this.isCenterAdmin && !this.centerGroupsUnavailable
        ? this.staffService.getCenterGroups()
        : this.staffService.getGroups();

    source$.subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const items = payload?.data ?? payload ?? [];
        this.availableGroups = items.map((g: any) => ({
          id: g.id,
          name: g.name ?? 'Group',
          subject: g.subject ?? ''
        }));
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        if (err?.status === 404) {
          this.centerGroupsUnavailable = true;
        }
      }
    });
  }

  openCreateStudent(): void {
    this.studentForm = { name: '', email: '', phone: '', groupId: this.availableGroups[0]?.id ?? '' };
    this.panelMode = 'create-student';
    this.panelOpen = true;
  }

  openCreateParent(): void {
    this.parentForm = { name: '', email: '', phone: '', studentId: this.students[0]?.id ?? '' };
    this.panelMode = 'create-parent';
    this.panelOpen = true;
  }

  openEditStudent(student: any): void {
    if (!this.isCenterAdmin) return;
    this.selectedStudent = student;
    this.studentForm = {
      name: student.name,
      email: student.email,
      phone: student.phone ?? '',
      groupId: ''
    };
    this.panelMode = 'edit-student';
    this.panelOpen = true;
  }

  submitStudent(): void {
    if (this.processing || !this.studentForm.name || !this.studentForm.email) {
      return;
    }
    const payload: any = {
      name: this.studentForm.name,
      email: this.studentForm.email,
      phone: this.studentForm.phone,
      role: 'student',
      group_id: this.studentForm.groupId
    };
    this.processing = true;
    const request$ =
      this.panelMode === 'edit-student' && this.selectedStudent
        ? this.staffService.updateManagementUser(this.selectedStudent.id, {
          name: this.studentForm.name,
          email: this.studentForm.email,
          phone: this.studentForm.phone
        })
        : this.isCenterAdmin
          ? this.staffService.createManagementUser(payload)
          : this.staffService.createTeacherManagedUser(payload);

    request$.subscribe({
      next: () => {
        this.closeInfo();
        this.loadStudents();
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

  submitParent(): void {
    if (this.processing || !this.parentForm.name || !this.parentForm.email || !this.parentForm.studentId) {
      return;
    }
    const payload = {
      name: this.parentForm.name,
      email: this.parentForm.email,
      phone: this.parentForm.phone,
      role: 'parent',
      student_id: this.parentForm.studentId
    };
    this.processing = true;
    const request$ = this.isCenterAdmin
      ? this.staffService.createManagementUser(payload)
      : this.staffService.createTeacherManagedUser(payload);
    request$.subscribe({
      next: () => {
        this.closeInfo();
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

  deleteStudent(): void {
    if (!this.isCenterAdmin || !this.selectedStudent || this.processing) {
      return;
    }
    this.processing = true;
    this.staffService.deleteManagementUser(this.selectedStudent.id).subscribe({
      next: () => {
        this.closeInfo();
        this.loadStudents();
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
}
