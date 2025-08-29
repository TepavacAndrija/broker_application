import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './auth/auth.guard';
import { UserComponent } from './user/user.component';
import { InstrumentComponent } from './instrument/instrument.component';
import { AccountComponent } from './account/account.component';
import { AccountStatusComponent } from './account-status/account-status.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'users',
    component: UserComponent,
    canActivate: [authGuard],
  },
  {
    path: 'instruments',
    component: InstrumentComponent,
    canActivate: [authGuard],
  },
  {
    path: 'accounts',
    component: AccountComponent,
    canActivate: [authGuard],
  },
  {
    path: 'account-status',
    component: AccountStatusComponent,
    canActivate: [authGuard],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
