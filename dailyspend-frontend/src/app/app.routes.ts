import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // Public
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

  // Protected layout
  {
    path: '',
    canActivateChild: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell.component')
        .then(m => m.ShellComponent),

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
        path: 'transactions/new',
        loadComponent: () =>
          import('./features/transactions/transaction-form/transaction-form.component')
            .then(m => m.TransactionFormComponent)
      },

      {
        path: 'transactions/:id/edit',
        loadComponent: () =>
          import('./features/transactions/transaction-form/transaction-form.component')
            .then(m => m.TransactionFormComponent)
      },

      {
        path: 'people',
        loadComponent: () =>
          import('./features/people/people-list/people-list.component')
            .then(m => m.PeopleListComponent)
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
      },

      {
        path: 'accounts',
        loadComponent: () =>
          import('./features/accounts/account-detail/account-detail.component')
            .then(m => m.AccountDetailComponent)
      }

    ]
  },

  { path: '**', redirectTo: '' }
];
