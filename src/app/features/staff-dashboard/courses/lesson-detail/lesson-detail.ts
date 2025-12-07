import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { TeacherService } from '../../../../core/services/teacher.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FeedbackService } from '../../../../core/services/feedback.service';

@Component({
  selector: 'app-lesson-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './lesson-detail.html',
  styleUrl: './lesson-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LessonDetailComponent implements OnInit {
  groupId!: number;
  lessonId!: number;
  lesson: any = null;
  students: any[] = [];
  attendanceEntries: any[] = [];

  loading = false;
  processing = false;
  errorMessage = '';

  // For attendance form
  attendanceDate = '';
  attendanceStats = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0
  };

  // Video
  videoUrlInput = '';
  safeVideoUrl: SafeResourceUrl | null = null;

  // Sidebar
  panelOpen = false;
  panelMode: 'attendance' | 'assessment' | null = null;
  panelTitle = '';

  // Assessment Form
  assessmentForm = {
    title: '',
    scheduled_at: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private staffService: TeacherService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const gId = params.get('groupId');
      const lId = params.get('lessonId');

      if (gId && lId) {
        this.groupId = +gId;
        this.lessonId = +lId;
        this.loadData();
      } else {
        this.errorMessage = 'Invalid parameters';
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      lesson: this.staffService.getLesson(this.groupId, this.lessonId),
      students: this.staffService.getGroupStudents(this.groupId).pipe(catchError(err => {
        console.error('Failed to load students', err);
        return of({ approved: [] });
      }))
    }).subscribe({
      next: ({ lesson, students }) => {
        this.loading = false;

        if (!lesson) {
          this.errorMessage = 'Lesson not found.';
          this.cdr.detectChanges();
          return;
        }

        this.lesson = lesson;

        // Set attendance date from lesson schedule (read-only)
        if (this.lesson.scheduled_at) {
          this.attendanceDate = new Date(this.lesson.scheduled_at).toISOString().slice(0, 10);
        } else {
          this.attendanceDate = new Date().toISOString().slice(0, 10); // Fallback
        }

        // Video
        if (this.lesson.video_url) {
          this.videoUrlInput = this.lesson.video_url;
          this.updateSafeVideoUrl(this.lesson.video_url);
        }

        // Process students
        const studentsData = students.data || students;
        let studentsList = studentsData.approved || studentsData.data?.approved || [];
        if (studentsList.data && Array.isArray(studentsList.data)) {
          studentsList = studentsList.data;
        }

        this.students = Array.isArray(studentsList) ? studentsList : [];

        this.prepareAttendanceEntries();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Failed to load data.';
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  prepareAttendanceEntries(): void {
    // Check if lesson already has attendance records
    const existingAttendance = this.lesson.attendances || [];
    const attendanceMap = new Map(existingAttendance.map((a: any) => [a.student_id, a.status]));

    this.attendanceEntries = this.students.map(student => ({
      student_id: student.id,
      name: student.name,
      status: attendanceMap.get(student.id) || 'present' // Default to present
    }));

    this.calculateAttendanceStats();
  }

  calculateAttendanceStats(): void {
    this.attendanceStats = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0
    };

    if (!this.lesson.attendances || !this.lesson.attendances.length) {
      // If no attendance recorded yet, don't show counts (or show 0)
      return;
    }

    // Use the entries to calculate stats, assuming they reflect current state
    // But wait, entries are initialized from lesson.attendances.
    // If user changes them in sidebar but hasn't saved, stats shouldn't update?
    // Or should they? Usually stats reflect saved state.
    // Let's calculate from lesson.attendances directly to be safe, or from entries if we want real-time preview (but we only save on button click).
    // Let's stick to saved state for the summary on main page.

    this.lesson.attendances.forEach((a: any) => {
      const status = a.status as keyof typeof this.attendanceStats;
      if (this.attendanceStats[status] !== undefined) {
        this.attendanceStats[status]++;
      }
    });
  }

  saveAttendance(): void {
    if (this.processing) return;

    this.processing = true;

    const payload = {
      date: this.attendanceDate,
      lesson_id: this.lessonId, // Link to lesson
      entries: this.attendanceEntries.map(entry => ({
        student_id: entry.student_id,
        status: entry.status
      }))
    };

    this.staffService.markAttendance(this.groupId, payload).subscribe({
      next: () => {
        this.processing = false;
        alert('Attendance saved successfully!');
        this.closePanel();
        this.loadData();
      },
      error: (err) => {
        this.processing = false;
        console.error('Failed to save attendance', err);
        alert('Failed to save attendance.');
        this.cdr.detectChanges();
      }
    });
  }

  // Video Logic
  updateSafeVideoUrl(url: string) {
    if (!url) {
      this.safeVideoUrl = null;
      return;
    }
    // Simple YouTube ID extraction (supports standard and short URLs)
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      videoId = match[2];
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    } else {
      // Fallback or invalid URL handling
      this.safeVideoUrl = null;
    }
  }

  saveVideoUrl(): void {
    if (this.processing) return;
    this.processing = true;

    const updatePayload = {
      title: this.lesson.title,
      scheduled_at: this.lesson.scheduled_at,
      description: this.lesson.description,
      video_url: this.videoUrlInput
    };

    this.staffService.updateLesson(this.lessonId, updatePayload).subscribe({
      next: (res) => {
        this.processing = false;
        this.lesson = res.data; // Update local lesson
        this.updateSafeVideoUrl(this.lesson.video_url);
        alert('Video URL updated successfully.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.processing = false;
        console.error('Failed to update video URL', err);
        alert('Failed to update video URL.');
        this.cdr.detectChanges();
      }
    });
  }

  // Assessment Logic
  getAssessmentStatus(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    return date < now ? 'Completed' : 'Upcoming';
  }

  saveAssessment(): void {
    if (this.processing || !this.assessmentForm.title || !this.assessmentForm.scheduled_at) return;
    this.processing = true;

    this.staffService.createAssessment(this.lessonId, this.assessmentForm).subscribe({
      next: () => {
        this.processing = false;
        alert('Assessment created successfully!');
        this.closePanel();
        this.loadData();
        // Reset form
        this.assessmentForm = { title: '', scheduled_at: '' };
      },
      error: (err) => {
        this.processing = false;
        console.error('Failed to create assessment', err);
        alert('Failed to create assessment.');
        this.cdr.detectChanges();
      }
    });
  }

  // Sidebar Logic
  openAttendancePanel() {
    this.panelMode = 'attendance';
    this.panelTitle = 'Take Attendance';
    this.panelOpen = true;
  }

  openAssessmentPanel() {
    this.panelMode = 'assessment';
    this.panelTitle = 'Add Assessment';
    this.panelOpen = true;
  }

  closePanel() {
    this.panelOpen = false;
    setTimeout(() => {
      this.panelMode = null;
      this.cdr.detectChanges();
    }, 300); // Wait for animation
  }

  goBack(): void {
    this.router.navigate(['/dashboard/staff/groups', this.groupId]);
  }
}
