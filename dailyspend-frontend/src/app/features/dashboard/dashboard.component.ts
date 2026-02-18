import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { Account } from '../../models/account.model';

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
  loading   = false;
  creating  = false;

  successMessage = '';
  errorMessage   = '';

  newAccountName    = '';
  newAccountBalance = 0;
  newAccountType    = '';

  // Backend AccountType enum: CASH, BANK, CREDIT only
  accountTypes = ['CASH', 'BANK', 'CREDIT'];

  totalBalance = 0;

  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit(): void { this.loadAccounts(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByAccount(_: number, account: Account): number { return account.id!; }

  loadAccounts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.accountService.getAllAccounts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accounts) => {
          this.accounts = accounts;
          this.totalBalance = accounts.reduce((sum, a) => sum + (a.balance ?? 0), 0);
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load accounts. Please try again.';
          this.loading = false;
        }
      });
  }

  createAccount(): void {
    if (!this.newAccountName.trim()) { this.errorMessage = 'Please enter an account name'; return; }
    if (!this.newAccountType) { this.errorMessage = 'Please select an account type'; return; }

    this.creating = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.accountService.createAccount({
      name: this.newAccountName.trim(),
      balance: this.newAccountBalance || 0,
      type: this.newAccountType
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (account: any) => {
        this.successMessage = `Account "${account.name}" created successfully!`;
        this.newAccountName = '';
        this.newAccountBalance = 0;
        this.newAccountType = '';
        this.loadAccounts();
        this.creating = false;
        setTimeout(() => { if (!this.destroy$.closed) this.successMessage = ''; }, 3000);
      },
      error: (error: any) => {
        this.errorMessage = error?.error?.message || 'Failed to create account.';
        this.creating = false;
      }
    });
  }

  confirmDeleteAcctId: number | null = null;

  requestDeleteAccount(id: number): void { this.confirmDeleteAcctId = id; }
  cancelDeleteAccount(): void { this.confirmDeleteAcctId = null; }

  deleteAccount(accountId: number): void {
    this.confirmDeleteAcctId = null;

    this.accountService.deleteAccount(accountId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Account deleted successfully!';
          this.loadAccounts();
          setTimeout(() => { if (!this.destroy$.closed) this.successMessage = ''; }, 3000);
        },
        error: () => { this.errorMessage = 'Failed to delete account. Please try again.'; }
      });
  }

  viewAccountDetails(accountId: number): void {
    this.router.navigate(['/accounts', accountId]);
  }

  formatCurrency(value: number | undefined | null): string {
    if (value == null) return '₹0.00';
    const abs = Math.abs(value);
    const fmt = abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value < 0 ? `-₹${fmt}` : `₹${fmt}`;
  }
}