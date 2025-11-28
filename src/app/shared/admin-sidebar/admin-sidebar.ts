import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { TranslateService } from '../../core/services/translate.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar {
  @Input() collapsed = false;
  constructor(public theme: ThemeService, public i18n: TranslateService) {}

}
