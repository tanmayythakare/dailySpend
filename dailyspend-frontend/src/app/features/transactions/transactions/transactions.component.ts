import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionListComponent } from '../transaction-list/transaction-list.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, TransactionListComponent],
  templateUrl: './transactions.component.html'
})
export class TransactionsComponent {}
