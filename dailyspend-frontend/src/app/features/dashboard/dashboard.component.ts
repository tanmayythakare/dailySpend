import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account.service';
import { Account, AccountType } from '../../models/account.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  private accountService = inject(AccountService);

  accountTypes = Object.values(AccountType);
  private router = inject(Router);
  
  accounts: Account[] = [];
  loading = false;
  creating = false;

  newAccountName = '';
  newAccountBalance: number | null = null;
  newAccountType: AccountType | '' = '';

  totalBalance = 0;

  successMessage = '';
  errorMessage = '';

  
ngOnInit(): void {
  this.router.events.subscribe(() => {
    this.loadAccounts();
  });
}

  loadAccounts() {
    this.loading = true;
    this.accountService.getAll().subscribe({
      next: (data) => {
        this.accounts = data;
        this.calculateTotal();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load accounts.';
        this.loading = false;
      }
    });
  }

  createAccount() {
    if (!this.newAccountName || !this.newAccountType) return;

    this.creating = true;
    this.clearMessages();

    const payload = {
      name: this.newAccountName,
      type: this.newAccountType,
      balance: this.newAccountBalance ?? 0
    };

    this.accountService.create(payload).subscribe({
      next: () => {
        this.successMessage = 'Account created successfully.';
        this.resetForm();
        this.loadAccounts();
        this.creating = false;
      },
      error: () => {
        this.errorMessage = 'Failed to create account.';
        this.creating = false;
      }
    });
  }

  deleteAccount(id: number) {
    if (!confirm('Are you sure you want to delete this account?')) return;

    this.clearMessages();

    this.accountService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Account deleted successfully.';
        this.loadAccounts();
      },
      error: () => {
        this.errorMessage = 'Failed to delete account.';
      }
    });
  }

  calculateTotal() {
    this.totalBalance = this.accounts.reduce(
      (sum, acc) => sum + (acc.balance ?? 0),
      0
    );
  }

  resetForm() {
    this.newAccountName = '';
    this.newAccountBalance = null;
    this.newAccountType = '';
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }

  formatCurrency(value: number | undefined): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value ?? 0);
  }
}
