import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../core/services/account.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  accounts: any[] = [];
  loading = false;
  creating = false;
  
  successMessage = '';
  errorMessage = '';

  // New account form data
  newAccountName = '';
  newAccountBalance = 0;
  newAccountType = '';

  accountTypes = ['CASH', 'BANK', 'CREDIT', 'WALLET'];

  totalBalance = 0;

  constructor(
    private accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.accountService.getAllAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.calculateTotalBalance();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.errorMessage = 'Failed to load accounts. Please try again.';
        this.loading = false;
      }
    });
  }

  calculateTotalBalance(): void {
    this.totalBalance = this.accounts.reduce((sum, account) => {
      return sum + (account.balance || 0);
    }, 0);
  }

  createAccount(): void {
    // Validation
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

    this.accountService.createAccount(newAccount).subscribe({
      next: (account) => {
        this.successMessage = `Account "${account.name}" created successfully!`;
        
        // Reset form
        this.newAccountName = '';
        this.newAccountBalance = 0;
        this.newAccountType = '';
        
        // Reload accounts
        this.loadAccounts();
        this.creating = false;

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error creating account:', error);
        this.errorMessage = error.error?.message || 'Failed to create account. Please try again.';
        this.creating = false;
      }
    });
  }

  deleteAccount(accountId: number): void {
    if (!confirm('Are you sure you want to delete this account? All transactions will also be removed.')) {
      return;
    }

    this.accountService.deleteAccount(accountId).subscribe({
      next: () => {
        this.successMessage = 'Account deleted successfully!';
        this.loadAccounts();

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error deleting account:', error);
        this.errorMessage = 'Failed to delete account. Please try again.';
      }
    });
  }

  viewAccountDetails(accountId: number): void {
    this.router.navigate(['/accounts', accountId]);
  }

  formatCurrency(value: number): string {
    if (value === undefined || value === null) {
      return '₹0.00';
    }
    
    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return value < 0 ? `-₹${formatted}` : `₹${formatted}`;
  }
}