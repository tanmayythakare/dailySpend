import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ───── Public Routes ─────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component')
        .then(m => m.RegisterComponent)
  },

  // ───── Protected Routes ─────
  {
    path: '',
    canActivateChild: [authGuard],
    children: [

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },

      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transaction-list/transaction-list.component')
            .then(m => m.TransactionListComponent)
      },

      {
        path: 'people/:id',
        loadComponent: () =>
          import('./features/people/person-detail/person-detail.component')
            .then(m => m.PersonDetailComponent)
      },

      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component')
            .then(m => m.ReportsComponent)
      }

    ]
  },
  // ───── Fallback ─────
  { path: '**', redirectTo: '' }
];
