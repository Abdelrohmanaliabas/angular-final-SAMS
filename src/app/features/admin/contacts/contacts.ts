import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { finalize, map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
}

import { OnDestroy } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin-contacts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacts.html',
  styleUrl: './contacts.css',
})
export class Contacts implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);
  private destroy$ = new Subject<void>();

  contacts: Contact[] = [];
  isLoading = true;
  errorMessage = '';

  // Pagination
  page = 1;
  perPage = 10;
  total = 0;
  lastPage = 1;

  ngOnInit(): void {
    // Poll every 10 seconds
    interval(10000)
      .pipe(
        startWith(0),
        takeUntil(this.destroy$),
        switchMap(() => {
          // Only show loading spinner on initial load (when contacts is empty)
          const isSilent = this.contacts.length > 0;
          return this.loadContactsObservable(this.page, isSilent);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContactsObservable(page = this.page, silent = false) {
    if (!silent) {
      this.isLoading = true;
      this.errorMessage = '';
      this.cdr.detectChanges();
    }

    const params = new HttpParams()
      .set('page', page)
      .set('per_page', this.perPage);

    return this.apiService
      .get<{ data?: Contact[], meta?: any } | Contact[]>('/admin/contacts', params)
      .pipe(
        map((response: any) => {
          this.zone.run(() => {
            const payload = response?.data ?? response;
            const items = Array.isArray(payload) ? payload : (payload?.data ?? []);

            // Only update if data has changed to avoid unnecessary re-renders
            if (JSON.stringify(items) !== JSON.stringify(this.contacts)) {
              this.contacts = items;
            }

            const pagination = response?.meta?.pagination ?? response?.meta ?? {};
            this.page = pagination.current_page ?? page;
            this.perPage = pagination.per_page ?? this.perPage;
            this.total = pagination.total ?? this.contacts.length;
            this.lastPage = pagination.last_page ?? this.lastPage ?? 1;

            this.isLoading = false;
            this.cdr.detectChanges();
          });
          return response;
        }),
        finalize(() => {
          if (!silent) {
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        })
      );
  }

  // Keep original method for manual calls (pagination)
  loadContacts(page = this.page): void {
    this.loadContactsObservable(page, false).subscribe({
      error: (error: any) => {
        this.zone.run(() => {
          this.errorMessage = error.error?.message || 'Failed to load contacts';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  changePage(page: number) {
    if (page < 1 || page > this.lastPage) return;
    this.page = page;
    // Reset polling when page changes to fetch new page immediately
    this.destroy$.next(); // Stop current polling
    this.destroy$ = new Subject<void>(); // Reset subject

    // Restart polling with new page
    interval(10000)
      .pipe(
        startWith(0),
        takeUntil(this.destroy$),
        switchMap(() => this.loadContactsObservable(this.page, this.contacts.length > 0))
      )
      .subscribe();
  }

  get rangeStart(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.perPage + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.rangeStart + this.contacts.length - 1, this.total);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
