import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit, OnDestroy {
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);

  readonly features = [
    {
      icon: '🎯',
      title: 'Free Forever Plan',
      copy: 'Up to 75 active students at no cost. Perfect for starting your academy or running a small center.'
    },
    {
      icon: '🔒',
      title: '100% Isolated Academy',
      copy: 'Your data stays completely private. Each academy is fully isolated with zero data sharing.'
    },
    {
      icon: '✉️',
      title: 'Auto Credential Delivery',
      copy: 'Login credentials are automatically emailed to students and parents. Zero manual work.'
    },
    {
      icon: '📊',
      title: 'Attendance Tracking',
      copy: 'Mark attendance in seconds. Track patterns, generate reports, and keep parents informed.'
    },
    {
      icon: '📝',
      title: 'Grades & Exams',
      copy: 'Record grades, manage exams, and track student performance all in one place.'
    },
    {
      icon: '🤖',
      title: 'AI Student Insights',
      copy: 'Students can ask about their grades and attendance. Get smart, instant feedback powered by AI.'
    },
  ];

  readonly setupSteps = [
    {
      step: '1',
      title: 'Sign Up Free',
      copy: 'Create your academy account in under 2 minutes. No credit card required.',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      step: '2',
      title: 'Add Your People',
      copy: 'Import or manually add students, parents, and teachers to your academy.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      step: '3',
      title: 'Credentials Sent',
      copy: 'Login details are automatically emailed. Everyone can access the system instantly.',
      color: 'from-amber-500 to-orange-500'
    },
  ];

  readonly testimonials = [
    {
      quote: 'I started my own academy last year and SAMS made everything so simple. The automatic emails saved me hours every week.',
      author: 'Ahmed Hassan',
      role: 'Math Teacher & Academy Owner',
      location: 'Cairo'
    },
    {
      quote: 'Managing 60 students used to be chaos. Now attendance, grades, and parent reports are all automated. I focus on teaching, not paperwork.',
      author: 'Mona Khalil',
      role: 'English Center Director',
      location: 'Alexandria'
    },
    {
      quote: 'The AI insights feature is brilliant. My students love asking about their progress and getting instant answers. Parents are impressed too.',
      author: 'Youssef Mahmoud',
      role: 'Science Academy Founder',
      location: 'Giza'
    },
  ];

  get isDark(): boolean {
    return this.themeService.darkMode();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }
}
