import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { TransactionFormComponent } from './features/transactions/transaction-form/transaction-form.component';
import { TransactionsComponent } from './features/transactions/transactions/transactions.component';

export const routes: Routes = [

  // Public routes
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

  // Protected routes
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell.component')
        .then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'accounts/:id',
        loadComponent: () =>
          import('./features/accounts/account-detail/account-detail.component')
            .then(m => m.AccountDetailComponent)
      },
      {
        path: 'transactions',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/transactions/transaction-list/transaction-list.component')
            .then(m => m.TransactionListComponent)
      }
      ,
      {
        path: 'transactions/new',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/transactions/transaction-form/transaction-form.component')
            .then(m => m.TransactionFormComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
  path: 'transactions',
  component: TransactionsComponent,
  canActivate: [authGuard]
},{
  path: 'people',
  loadComponent: () =>
    import('./features/people/people-list/people-list.component')
      .then(m => m.PeopleListComponent)
},{
  path: 'people/:id',
  loadComponent: () =>
    import('./features/people/person-detail/person-detail.component')
      .then(m => m.PersonDetailComponent)
},{
  path: 'reports',
  loadComponent: () =>
    import('./features/reports/reports.component')
      .then(m => m.ReportsComponent)
}
,
{
  path: 'transactions/new',
  component: TransactionFormComponent,
  canActivate: [authGuard]
}


    ]
  },


  {
    path: '**',
    redirectTo: 'login'
  }
];
