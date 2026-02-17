import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-person-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.scss']
})
export class PersonDetailComponent implements OnInit {

  personId!: number;

  // ✅ ADD THIS — template expects it
  person: any = null;

  transactions: any[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.personId = Number(this.route.snapshot.paramMap.get('id'));

    // Mock person until API added
    this.person = {
      id: this.personId,
      name: 'Person ' + this.personId
    };

    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;

    // ⚠️ FIX — method may not exist
    this.transactionService.getAll().subscribe({
      next: (data: any) => {
        // filter by personId
        this.transactions = (data || []).filter(
          (t: any) => t.personId === this.personId
        );

        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  getBalance(): number {
    return this.transactions.reduce((sum, t) => {
      return sum + (t.amount || 0);
    }, 0);
  }
}
