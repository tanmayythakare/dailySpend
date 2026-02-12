import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account.service';
import { Account, AccountType } from '../../models/account.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  private accountService = inject(AccountService);

  accountTypes = Object.values(AccountType);

  accounts: Account[] = [];
  loading = true;

  newAccountName = '';
  newAccountBalance: number | null = null;
  newAccountType: AccountType | '' = '';

  totalBalance = 0;

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts() {
    this.loading = true;
    this.accountService.getAll().subscribe({
      next: (data) => {
        this.accounts = data;
        this.calculateTotal();
        this.loading = false;
      },
      error: (err) => {
        console.error('Load accounts error:', err);
        this.loading = false;
      }
    });
  }

  createAccount() {
    if (!this.newAccountName || !this.newAccountType) return;

    const payload = {
      name: this.newAccountName,
      type: this.newAccountType,
      balance: this.newAccountBalance ?? 0
    };

    console.log('Creating account payload:', payload);

    this.accountService.create(payload).subscribe({
      next: () => {
        this.newAccountName = '';
        this.newAccountBalance = null;
        this.newAccountType = '';
        this.loadAccounts();
      },
      error: (err) => {
        console.error('Create account error:', err);
      }
    });
  }

  calculateTotal() {
    this.totalBalance = this.accounts.reduce(
      (sum, acc) => sum + (acc.balance ?? 0),
      0
    );
  }
}
