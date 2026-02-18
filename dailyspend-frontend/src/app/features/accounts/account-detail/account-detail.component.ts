import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AccountService } from '../../../core/services/account.service';
import { Account } from '../../../models/account.model';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss']
})
export class AccountDetailComponent implements OnInit, OnDestroy {

  private route          = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private destroy$       = new Subject<void>();

  account?: Account;
  loading = true;
  error   = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.accountService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  (account) => { this.account = account; this.loading = false; },
        error: ()        => { this.error   = 'Failed to load account details.'; this.loading = false; }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatCurrency(value: number | undefined): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value ?? 0);
  }
  getBalance(): number {
  return this.account?.balance ?? 0;
}
}