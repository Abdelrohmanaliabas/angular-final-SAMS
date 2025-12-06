import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';
import { DashboardLayout } from '../../layouts/dashboard-layout/dashboard-layout';
import { Overview } from './overview/overview';
import { StaffGroups } from './courses/courses';
import { StaffGroupDetail } from './courses/group-detail/group-detail';
import { Teachers as StaffTeamPage } from './center-admin-only/teachers/teachers';
import { Students as StaffStudentsPage } from './center-admin-only/students/students';
import { Setting as StaffSettingPage } from './setting/setting';

export const StaffRoutes: Routes = [
  {
    path: 'dashboard/staff',
    component: DashboardLayout,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['teacher', 'assistant', 'center_admin'] },
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: Overview },
      { path: 'groups', component: StaffGroups },
      { path: 'groups/:id', component: StaffGroupDetail },
      { path: 'staff', component: StaffTeamPage },
      { path: 'students', component: StaffStudentsPage },
      { path: 'setting', component: StaffSettingPage }
    ]
  }
];
