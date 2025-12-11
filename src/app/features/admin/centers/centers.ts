import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { HttpParams } from '@angular/common/http';
import { PaginationComponent } from '../../../shared/ui/pagination/pagination';
import { FeedbackService } from '../../../core/services/feedback.service';

@Component({
  selector: 'app-admin-centers',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './centers.html',
  styleUrl: './centers.css',
})
export class Centers implements OnInit {
  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private feedback: FeedbackService
  ) {}

  centers: any[] = [];
  loading = false;
  currentId: number | null = null;
  searchTerm = '';
  infoOpen = false;
  selectedCenter: any = null;

  isFormOpen = false;
  isEditMode = false;
  currentIndex: number | null = null;
  formCenter = { name: '', city: '', phone: '', paid: false };

  // Pagination
  page = 1;
  perPage = 10;
  total = 0;
  lastPage = 1;

  ngOnInit(): void {
    this.loadCenters();
  }

  loadCenters(page = this.page) {
    this.loading = true;
    const params = new HttpParams()
      .set('page', page)
      .set('per_page', this.perPage)
      .set('search', this.searchTerm.trim());

    this.api.get<any>('/centers', params).subscribe({
      next: (res) => {
        const payload = res?.data ?? res;
        const items = payload?.data ?? payload ?? [];
        this.centers = items.map((c: any) => ({
          id: c.id,
          name: c.name,
          city: c.subdomain || '',
          phone: c.owner?.phone || '',
          paid: !!c.is_active,
          courses: (c.groups || []).map((g: any) => ({
            id: g.id,
            name: g.name,
            teacher: g.teacher?.name || '',
            studentsCount: g.students_count ?? g.studentsCount ?? 0,
          })),
          raw: c,
        }));

        const pagination = res?.meta?.pagination ?? payload?.meta ?? {};
        this.page = pagination.current_page ?? page;
        this.perPage = pagination.per_page ?? this.perPage;
        this.total = pagination.total ?? this.centers.length;
        this.lastPage = pagination.last_page ?? this.lastPage ?? 1;

        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); },
      complete: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  // Removed client-side filtering as we now use backend search
  get filteredCenters() {
    return this.centers;
  }

  /** Handle page change from pagination component */
  onPageChange(page: number): void {
    if (page < 1 || page > this.lastPage) return;
    this.page = page;
    this.loadCenters(page);
  }

  /** Handle per-page change from pagination component */
  onPerPageChange(perPage: number): void {
    this.perPage = perPage;
    this.page = 1;
    this.loadCenters(1);
  }

  onSearchChange() {
    this.page = 1;
    this.loadCenters(1);
  }

  openForm(center?: typeof this.formCenter) {
    this.isFormOpen = true;
    if (center) {
      this.isEditMode = true;
      this.formCenter = { ...center };
      this.currentIndex = this.centers.findIndex(c => c.name === center.name && c.phone === center.phone);
      this.currentId = this.centers[this.currentIndex]?.id ?? null;
    } else {
      this.isEditMode = false;
      this.currentIndex = null;
      this.currentId = null;
      this.formCenter = { name: '', city: '', phone: '', paid: false };
    }
  }

  save() {
    const payload = {
      name: this.formCenter.name,
      subdomain: this.formCenter.city,
      is_active: this.formCenter.paid,
    };

    if (this.isEditMode && this.currentId !== null) {
      this.api.put<any>(`/centers/${this.currentId}`, payload).subscribe({
        next: () => {
          this.feedback.showToast({
            title: 'Center updated',
            message: `"${this.formCenter.name}" has been updated.`,
            tone: 'success'
          });
          this.loadCenters();
          this.closeForm();
        },
        error: () => {
          this.closeForm();
          this.feedback.showToast({
            title: 'Update failed',
            message: 'Could not update the center. Please try again.',
            tone: 'error'
          });
          this.cdr.detectChanges();
        }
      });
    } else {
      this.api.post<any>('/centers', payload).subscribe({
        next: () => {
          this.feedback.showToast({
            title: 'Center created',
            message: `"${this.formCenter.name}" has been added.`,
            tone: 'success'
          });
          this.loadCenters();
          this.closeForm();
        },
        error: () => {
          this.feedback.showToast({
            title: 'Create failed',
            message: 'Could not create the center. Please try again.',
            tone: 'error'
          });
          this.cdr.detectChanges();
        }
      });
    }
  }

  delete(center: typeof this.formCenter) {
    const found = this.centers.find(c => c.name === center.name && c.phone === center.phone);
    if (!found?.id) {
      this.centers = this.centers.filter(c => !(c.name === center.name && c.phone === center.phone));
      return;
    }

    this.feedback.openModal({
      icon: 'warning',
      title: 'Delete Center?',
      message: `Are you sure you want to delete "${found.name}"? This action cannot be undone.`,
      primaryText: 'Delete',
      secondaryText: 'Cancel',
      onPrimary: () => {
        this.loading = true;
        this.api.delete(`/centers/${found.id}`).subscribe({
          next: () => {
            this.feedback.showToast({
              title: 'Center deleted',
              message: `"${found.name}" has been removed.`,
              tone: 'success'
            });
            this.loadCenters(); // Reload to update pagination
          },
          error: () => {
            this.loading = false;
            this.feedback.showToast({
              title: 'Delete failed',
              message: 'Could not delete the center. Please try again.',
              tone: 'error'
            });
            this.cdr.detectChanges();
          }
        });
      },
      onSecondary: () => this.feedback.closeModal()
    });
  }

  closeForm() {
    this.isFormOpen = false;
  }

  openInfo(center: any) {
    this.selectedCenter = center;
    this.infoOpen = true;
  }

  closeInfo() {
    this.infoOpen = false;
    this.selectedCenter = null;
  }
}
