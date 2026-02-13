import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { CategoryService } from '../../../core/services/category.service';
import { PersonService } from '../../../core/services/person.service';

import { Account } from '../../../models/account.model';
import { Category } from '../../../models/category.model';
import { Person } from '../../../models/person.model';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-form.component.html'
})
export class TransactionFormComponent implements OnInit {

  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);
  private categoryService = inject(CategoryService);
  private personService = inject(PersonService);
  private router = inject(Router);

  accounts: Account[] = [];
  categories: Category[] = [];
  people: Person[] = [];

  type: 'EXPENSE' | 'MONEY_GIVEN' | 'MONEY_TAKEN' = 'EXPENSE';

  selectedAccountId: number | null = null;
  selectedCategoryId: number | null = null;
  selectedPersonId: number | null = null;

  amount: number | null = null;
  description = '';
  date = new Date().toISOString().split('T')[0];

  creatingPerson = false;
  newPersonName = '';

  loading = false;

  ngOnInit(): void {
    this.accountService.getAll().subscribe(data => this.accounts = data);
    this.categoryService.getAll().subscribe(data => this.categories = data);
    this.personService.getAll().subscribe(data => this.people = data);
  }

  submit() {

    if (!this.selectedAccountId || !this.amount) return;

    const basePayload: any = {
      accountId: this.selectedAccountId,
      amount: this.amount,
      description: this.description,
      transactionDate: this.date
    };

    this.loading = true;

    if (this.type === 'EXPENSE') {

      if (!this.selectedCategoryId) return;

      this.transactionService.createExpense({
        ...basePayload,
        categoryId: this.selectedCategoryId
      }).subscribe(() => this.success());

    } else if (this.type === 'MONEY_GIVEN') {

      if (!this.selectedPersonId) return;

      this.transactionService.createMoneyGiven({
        ...basePayload,
        personId: this.selectedPersonId
      }).subscribe(() => this.success());

    } else {

      if (!this.selectedPersonId) return;

      this.transactionService.createMoneyTaken({
        ...basePayload,
        personId: this.selectedPersonId
      }).subscribe(() => this.success());
    }
  }

  createNewPerson() {

    if (!this.newPersonName.trim()) return;

    this.personService.create({ name: this.newPersonName }).subscribe(created => {
      this.people.push(created);
      this.selectedPersonId = created.id;
      this.creatingPerson = false;
      this.newPersonName = '';
    });
  }

  success() {
    this.loading = false;
    this.router.navigate(['/transactions']);
  }
}
