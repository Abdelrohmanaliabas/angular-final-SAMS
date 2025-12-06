import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses implements OnInit {

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) { }

  courses: any[] = [];
  loading = false;

  /** Search */
  searchTerm = '';

  /** Info modal */
  infoOpen = false;
  selectedCourse: any = null;

  /** Form */
  formOpen = false;
  isEditMode = false;
  currentId: number | null = null;
  currentIndex: number | null = null;

  formCourse = {
    title: '',
    status: 'Active'
  };

  ngOnInit(): void {
    this.loadCourses();
  }

  /** ================= LOAD COURSES ================= */
  private loadCourses() {
    this.loading = true;

    this.api.get<any>('/groups').subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const items = payload?.data ?? payload ?? [];

        this.courses = items.map((g: any) => ({
          id: g.id,
          title: g.name,
          center: g.center?.name || '',
          teacher: g.teacher?.name || '',
          status: g.is_active ? 'Active' : 'Inactive',
          studentsCount: g.students_count ?? g.studentsCount ?? g.students?.length ?? 0,
          raw: g,
        }));

        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  /** ================= FILTER ================= */
  get filteredCourses() {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) return this.courses;

    return this.courses.filter(c =>
      (c.title || '').toLowerCase().includes(q) ||
      (c.center || '').toLowerCase().includes(q) ||
      (c.teacher || '').toLowerCase().includes(q) ||
      (c.status || '').toLowerCase().includes(q)
    );
  }

  /** ================= INFO ================= */
  openInfo(course: any) {
    this.selectedCourse = course;
    this.infoOpen = true;
  }

  closeInfo() {
    this.infoOpen = false;
    this.selectedCourse = null;
  }

  /** ================= FORM ================= */
  openForm(index?: number) {
    this.formOpen = true;

    if (index !== undefined) {
      // Edit mode
      this.isEditMode = true;
      this.currentIndex = index;
      const c = this.courses[index];

      this.currentId = c.id;

      this.formCourse = {
        title: c.title,
        status: c.status
      };
    } else {
      // Add mode
      this.isEditMode = false;
      this.currentId = null;
      this.currentIndex = null;
      this.formCourse = {
        title: '',
        status: 'Active'
      };
    }
  }

  closeForm() {
    this.formOpen = false;
    this.isEditMode = false;
    this.currentId = null;
    this.currentIndex = null;

    this.formCourse = {
      title: '',
      status: 'Active'
    };
  }

  /** ================= SAVE ================= */
  save() {
    const ref = this.currentIndex !== null ? this.courses[this.currentIndex] : null;

    const payload: any = {
      name: this.formCourse.title,
      description: '',
      subject: this.formCourse.title,
      is_active: this.formCourse.status === 'Active',
      center_id: ref?.raw?.center_id,
      teacher_id: ref?.raw?.teacher_id,
    };

    /** EDIT */
    if (this.isEditMode && this.currentId !== null) {
      this.api.put(`/groups/${this.currentId}`, payload).subscribe(() => {
        this.loadCourses();
        this.closeForm();
      });
      return;
    }

    /** CREATE */
    if (!payload.center_id || !payload.teacher_id) {
      this.closeForm();
      return;
    }

    this.api.post('/groups', payload).subscribe(() => {
      this.loadCourses();
      this.closeForm();
    });
  }
}
