import { Routes } from '@angular/router';
import { StaffRoutes } from './features/staff-dashboard/staff.routes';
import { HomePage } from './features/home/home';

export const routes: Routes = [
  { path: '', component: HomePage },
  ...StaffRoutes,
];
