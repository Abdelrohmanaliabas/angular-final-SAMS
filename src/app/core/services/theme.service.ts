import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme = new BehaviorSubject<Theme>('light');
  theme$ = this._theme.asObservable();

  constructor() {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved) this._theme.next(saved);
    this.applyToDocument(this._theme.value);
  }

  setTheme(theme: Theme) {
    this._theme.next(theme);
    localStorage.setItem('theme', theme);
    this.applyToDocument(theme);
  }

  toggle() {
    this.setTheme(this._theme.value === 'light' ? 'dark' : 'light');
  }

  private applyToDocument(theme: Theme) {
    const doc = document.documentElement;
    if (theme === 'dark') doc.classList.add('dark'); else doc.classList.remove('dark');
  }
}
