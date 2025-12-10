import { Component, OnInit, inject, signal } from '@angular/core';
import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../core/services/student.service';
import { RouterLink } from '@angular/router';

type Profile = {
  name: string;
  email: string;
  phone: string;
  address?: string;
  studentId?: string;
  grade?: string;
  role?: string;
};

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class StudentProfile implements OnInit {
  private tokenService = inject(TokenStorageService);
  private studentService = inject(StudentService);

  profile = signal<Profile | null>(null);
  initialProfile = signal<Profile | null>(null);
  loading = signal(false);
  isEditMode = signal(false);
  saving = signal(false);
  success = signal('');
  error = signal('');
  passwordSaving = signal(false);
  passwordError = signal('');
  passwordSuccess = signal('');
  passwordForm = signal({
    current: '',
    password: '',
    confirm: ''
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  get isParent(): boolean {
    return this.tokenService.getUser()?.roles.includes('parent') ?? false;
  }

  private mapProfile(raw: any): Profile {
    const user = raw?.user ?? raw ?? {};
    const roles = Array.isArray(user.roles)
      ? user.roles
      : typeof user.roles === 'string'
        ? [user.roles]
        : [];

    return {
      name: user.name ?? '—',
      email: user.email ?? '—',
      phone: user.phone ?? user.mobile ?? '—',
      address: user.address ?? raw.address ?? '',
      studentId: user.student_id ?? user.studentId ?? user.id ?? '—',
      grade: user.grade ?? user.level ?? '—',
      role: roles.join(', ') || user.role || 'Student'
    };
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.error.set('');
    this.studentService.getProfile().subscribe({
      next: (data) => {
        const mapped = this.mapProfile(data);
        this.profile.set(mapped);
        this.initialProfile.set({ ...mapped });
      },
      error: () => {
        this.error.set('Unable to load your profile right now.');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

  toggleEditMode(): void {
    if (!this.profile()) return;
    this.success.set('');
    this.error.set('');
    this.isEditMode.set(!this.isEditMode());
  }

  saveProfile(): void {
    const current = this.profile();
    if (!current) return;
    this.saving.set(true);
    this.success.set('');
    this.error.set('');

    this.studentService.updateProfile({
      name: current.name,
      phone: current.phone
    }).subscribe({
      next: () => {
        this.isEditMode.set(false);
        this.saving.set(false);
        this.success.set('Profile updated.');
        this.loadProfile();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Could not save changes. Please try again.');
      }
    });
  }

  cancelEdit(): void {
    this.isEditMode.set(false);
    this.success.set('');
    this.error.set('');
    if (this.initialProfile()) {
      this.profile.set({ ...this.initialProfile()! });
    }
  }

  changePassword(): void {
    this.passwordError.set('');
    this.passwordSuccess.set('');
    const pwd = this.passwordForm();
    if (!pwd.current || !pwd.password || !pwd.confirm) {
      this.passwordError.set('Please fill in all password fields.');
      return;
    }
    if (pwd.password !== pwd.confirm) {
      this.passwordError.set('New passwords do not match.');
      return;
    }

    this.passwordSaving.set(true);
    this.studentService.updatePassword({
      current_password: pwd.current,
      password: pwd.password,
      password_confirmation: pwd.confirm
    }).subscribe({
      next: () => {
        this.passwordSaving.set(false);
        this.passwordSuccess.set('Password updated successfully.');
        this.passwordForm.set({ current: '', password: '', confirm: '' });
      },
      error: () => {
        this.passwordSaving.set(false);
        this.passwordError.set('Could not update password. Check your current password and try again.');
      }
    });
  }
}
