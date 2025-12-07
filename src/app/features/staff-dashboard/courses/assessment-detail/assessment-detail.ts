import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { TeacherService } from '../../../../core/services/teacher.service';
import { FeedbackService } from '../../../../core/services/feedback.service';

@Component({
  selector: 'app-assessment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './assessment-detail.html',
  styleUrl: './assessment-detail.css'
})
export class AssessmentDetailComponent implements OnInit {
  assessmentId!: number;
  groupId!: number;
  lessonId!: number;
  
  assessment: any = null;
  students: any[] = [];
  loading = false;
  errorMessage = '';

  // Track saving state per student
  savingStates: { [studentId: number]: 'idle' | 'saving' | 'saved' | 'error' } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private staffService: TeacherService,
    private feedback: FeedbackService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.groupId = Number(params.get('groupId'));
      this.lessonId = Number(params.get('lessonId'));
      this.assessmentId = Number(params.get('assessmentId'));

      if (this.assessmentId) {
        this.loadData();
      } else {
        this.errorMessage = 'Invalid assessment ID';
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.staffService.getAssessment(this.assessmentId).subscribe({
      next: (res) => {
        this.loading = false;
        const data = res.data || res;
        this.assessment = data.assessment;
        this.students = data.students || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Failed to load assessment details.';
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  saveGrade(student: any): void {
    // Basic validation
    if (student.score === null || student.score === undefined || student.score === '') {
        return; // Don't save empty
    }
    
    if (student.score < 0 || student.score > this.assessment.max_score) {
        this.feedback.showToast({ title: 'Invalid Score', message: `Score must be between 0 and ${this.assessment.max_score}`, tone: 'error' });
        return;
    }

    this.savingStates[student.id] = 'saving';
    this.cdr.detectChanges();

    this.staffService.saveAssessmentGrade(this.assessmentId, student.id, student.score, student.feedback).subscribe({
      next: () => {
        this.savingStates[student.id] = 'saved';
        // Reset to idle after a delay
        setTimeout(() => {
            if (this.savingStates[student.id] === 'saved') {
                this.savingStates[student.id] = 'idle';
                this.cdr.detectChanges();
            }
        }, 2000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.savingStates[student.id] = 'error';
        console.error('Failed to save grade', err);
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/staff/groups', this.groupId, 'lessons', this.lessonId]);
  }
}
