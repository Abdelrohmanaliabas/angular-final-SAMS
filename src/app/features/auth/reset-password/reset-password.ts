import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { FeedbackService } from '../../../core/services/feedback.service';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './reset-password.html'
})
export class ResetPassword implements OnInit {
    resetContext: { token: string | null; email: string | null } | null = null;
    resetPasswordForm: FormGroup;
    passwordVisibility = {
        password: false,
        confirm: false
    };
    contextLoading = signal(true);

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private loadingService: LoadingService,
        private feedback: FeedbackService,
        private route: ActivatedRoute
    ) {
        this.resetPasswordForm = this.fb.group({
            password: ['', [
                Validators.required,
                Validators.minLength(8),
                Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
            ]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit(): void {
        const params = this.route.snapshot.queryParamMap;
        const token = params.get('token');
        const email = params.get('email');
        const code = params.get('code');

        if (token && email) {
            this.resetContext = { token, email };
            this.contextLoading.set(false);
            return;
        }

        if (code) {
            this.authService.validateResetCode(code).subscribe({
                next: (response) => {
                    const data = response?.data ?? response;
                    if (data?.token && data?.email) {
                        this.resetContext = { token: data.token, email: data.email };
                    }
                    this.contextLoading.set(false);
                },
                error: (err) => {
                    this.contextLoading.set(false);
                    this.feedback.showToast({
                        tone: 'error',
                        title: 'Invalid link',
                        message: this.extractMessage(err, 'Reset link expired')
                    });
                }
            });
            return;
        }

        this.contextLoading.set(false);
    }

    onSwitch(mode: string) {
        this.router.navigate(['/' + mode]);
    }

    togglePasswordVisibility(field: 'password' | 'confirm') {
        this.passwordVisibility[field] = !this.passwordVisibility[field];
    }

    passwordMatchValidator(control: AbstractControl) {
        const password = control.get('password')?.value;
        const confirmPassword = control.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { 'mismatch': true };
    }

    onSubmit() {
        if (this.resetPasswordForm.invalid) {
            this.resetPasswordForm.markAllAsTouched();
            this.feedback.showToast({
                tone: 'error',
                title: 'Passwords do not match',
                message: 'Please review the requirements.'
            });
            return;
        }

        if (!this.resetContext?.token || !this.resetContext?.email) {
            this.feedback.showToast({
                tone: 'error',
                title: 'Missing reset token',
                message: 'Please reopen the reset link from your email.'
            });
            return;
        }

        this.loadingService.show();
        const { password, confirmPassword } = this.resetPasswordForm.value;

        this.authService.resetPassword({
            email: this.resetContext.email,
            token: this.resetContext.token,
            password,
            password_confirmation: confirmPassword
        }).subscribe({
            next: () => {
                this.loadingService.hide();
                this.feedback.showToast({
                    tone: 'success',
                    title: 'Password updated',
                    message: 'You can now sign in with the new password.'
                });
                this.resetPasswordForm.reset();
                this.onSwitch('login');
            },
            error: (err) => {
                this.loadingService.hide();
                this.feedback.showToast({
                    tone: 'error',
                    title: 'Reset failed',
                    message: this.extractMessage(err, 'Password reset failed')
                });
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
}
