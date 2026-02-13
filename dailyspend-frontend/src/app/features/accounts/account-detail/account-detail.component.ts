import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { Account } from '../../../models/account.model';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, RouterModule,FormsModule],
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss']
})
export class AccountDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private accountService = inject(AccountService);

  account?: Account;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.accountService.getAll().subscribe({
      next: (accounts) => {
        this.account = accounts.find(a => a.id === id);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load account details.';
        this.loading = false;
      }
    });
  }

  formatCurrency(value: number | undefined): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value ?? 0);
  }
}
