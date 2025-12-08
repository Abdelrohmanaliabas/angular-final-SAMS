import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { FeedbackService } from '../../../core/services/feedback.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-email.html'
})
export class VerifyEmail implements OnInit {
  verifyingEmail = signal<boolean>(false);
  success = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  alreadyLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService,
    private feedback: FeedbackService
  ) {
    this.alreadyLoggedIn = this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (!code) {
      this.errorMessage.set('Verification code is missing.');
      this.feedback.showToast({
        tone: 'error',
        title: 'Invalid link',
        message: 'Verification code is missing.'
      });
      return;
    }
    this.verifyCode(code);
  }

  private verifyCode(code: string) {
    this.verifyingEmail.set(true);
    this.loadingService.show();
    this.authService.verifyEmail(code).subscribe({
      next: () => {
        this.loadingService.hide();
        this.verifyingEmail.set(false);
        this.feedback.showToast({
          tone: 'success',
          title: 'Account activated',
          message: 'You can now sign in.'
        });
        this.success.set(true);
        this.errorMessage.set(null);
      },
      error: (err) => {
        this.loadingService.hide();
        this.verifyingEmail.set(false);
        const message = this.extractMessage(err, 'Verification failed');
        this.feedback.showToast({
          tone: 'error',
          title: 'Verification failed',
          message
        });
        this.errorMessage.set(message);
      }
    });
  }

  private extractMessage(err: any, fallback: string): string {
    const message = err?.error?.message ?? err?.message;
    if (!message) {
      return fallback;
    }
    return typeof message === 'string' ? message : JSON.stringify(message);
  }

  onPrimaryAction() {
    if (this.alreadyLoggedIn) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onGoToLogin() {
    this.router.navigate(['/login']);
  }
}
