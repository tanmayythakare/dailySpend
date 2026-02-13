import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { TransactionService } from '../../../core/services/transaction.service';
import { PersonService } from '../../../core/services/person.service';

import { Transaction } from '../../../models/transaction.model';
import { Person } from '../../../models/person.model';

@Component({
  selector: 'app-person-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './person-detail.component.html'
})
export class PersonDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private transactionService = inject(TransactionService);
  private personService = inject(PersonService);

  personId!: number;
  person: Person | null = null;

  transactions: Transaction[] = [];
  loading = true;

  ngOnInit(): void {

    this.personId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadPerson();
    this.loadTransactions();
  }

  loadPerson() {
    this.personService.getAll().subscribe(data => {
      this.person = data.find(p => p.id === this.personId) || null;
    });
  }

  loadTransactions() {

    this.loading = true;

    const params = {
      page: 0,
      size: 100,
      personId: this.personId
    };

    this.transactionService.getPaged(params).subscribe({
      next: (response: any) => {
        this.transactions = response.content || [];
        this.loading = false;
      },
      error: err => {
        console.error('Error loading transactions', err);
        this.loading = false;
      }
    });
  }

  getBalance(): number {

    if (!this.transactions.length) return 0;

    let balance = 0;

    this.transactions.forEach(tx => {
      if (tx.type === 'MONEY_GIVEN') balance += tx.amount;
      if (tx.type === 'MONEY_TAKEN') balance -= tx.amount;
    });

    return balance;
  }
}
