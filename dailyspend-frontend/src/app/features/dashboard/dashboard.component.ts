import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AccountService } from '../../core/services/account.service';
import { Account } from '../../models/account.model';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  accounts: Account[] = [];
  loading = false;
  creating = false;

  successMessage = '';
  errorMessage = '';

  newAccountName = '';
  newAccountBalance = 0;
  newAccountType = '';

  income = 0;
  expense = 0;
  net = 0;

  accountTypes = ['CASH', 'BANK', 'CREDIT', 'WALLET'];

  totalBalance = 0;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadSummary();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByAccount(_: number, account: Account): number {
    return account.id!;
  }

  loadAccounts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.accountService.getAllAccounts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accounts: Account[]) => {
          this.accounts = accounts;
          this.calculateTotalBalance();
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load accounts. Please try again.';
          this.loading = false;
        }
      });
  }

  loadSummary(): void {
    this.analytics.getIncome()
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => this.income = v);

    this.analytics.getExpense()
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => this.expense = v);

    this.analytics.getNet()
      .pipe(takeUntil(this.destroy$))
      .subscribe(v => this.net = v);
  }

  calculateTotalBalance(): void {
    this.totalBalance = this.accounts.reduce(
      (sum, account) => sum + (account.balance ?? 0),
      0
    );
  }

  createAccount(): void {
    if (!this.newAccountName.trim()) {
      this.errorMessage = 'Please enter an account name';
      return;
    }

    if (!this.newAccountType) {
      this.errorMessage = 'Please select an account type';
      return;
    }

    this.creating = true;
    this.errorMessage = '';
    this.successMessage = '';

    const newAccount = {
      name: this.newAccountName.trim(),
      balance: this.newAccountBalance || 0,
      type: this.newAccountType
    };

    this.accountService.createAccount(newAccount)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (account: any) => {
          this.successMessage = `Account "${account.name}" created successfully!`;
          this.newAccountName = '';
          this.newAccountBalance = 0;
          this.newAccountType = '';
          this.loadAccounts();
          this.creating = false;

          setTimeout(() => {
            if (!this.destroy$.closed) {
              this.successMessage = '';
            }
          }, 3000);
        },
        error: (error: any) => {
          this.errorMessage = error?.error?.message || 'Failed to create account.';
          this.creating = false;
        }
      });
  }

  deleteAccount(accountId: number): void {
    if (!confirm('Are you sure you want to delete this account? All transactions will also be removed.')) {
      return;
    }

    this.accountService.deleteAccount(accountId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Account deleted successfully!';
          this.loadAccounts();

          setTimeout(() => {
            if (!this.destroy$.closed) {
              this.successMessage = '';
            }
          }, 3000);
        },
        error: () => {
          this.errorMessage = 'Failed to delete account. Please try again.';
        }
      });
  }

  viewAccountDetails(accountId: number): void {
    this.router.navigate(['/accounts', accountId]);
  }

  formatCurrency(value: number | undefined | null): string {
    if (value === undefined || value === null) return '₹0.00';

    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return value < 0 ? `-₹${formatted}` : `₹${formatted}`;
  }
}
