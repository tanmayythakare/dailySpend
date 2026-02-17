import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { CategoryService } from '../../../core/services/category.service';
import { PersonService } from '../../../core/services/person.service';

interface TransactionFormData {
  type: string;
  accountId: number | null;
  categoryId: number | null;
  amount: number;
  personId: number | null;
  transactionDate: string;
  description: string;
}

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss']
})
export class TransactionFormComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  isEditMode = false;
  transactionId: number | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';

  transactionData: TransactionFormData = {
    type: 'EXPENSE',
    accountId: null,
    categoryId: null,
    amount: 0,
    personId: null,
    transactionDate: this.getTodayDate(),
    description: ''
  };

  accounts: any[] = [];
  categories: any[] = [];
  people: any[] = [];

  constructor(
    private transactionService: TransactionService,
    private accountService: AccountService,
    private categoryService: CategoryService,
    private personService: PersonService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.transactionId = +id;
      this.loadTransaction(this.transactionId);
    }

    this.accountService.getAllAccounts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(accounts => this.accounts = accounts);

    this.categoryService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => this.categories = categories);

    this.personService.getAllPeople()
      .pipe(takeUntil(this.destroy$))
      .subscribe(people => this.people = people);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  loadTransaction(id: number): void {
    this.loading = true;

    this.transactionService.getTransactionById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tx: any) => {
          this.transactionData = {
            type: tx.type,
            accountId: tx.account?.id ?? null,
            categoryId: tx.category?.id ?? null,
            amount: tx.amount,
            personId: tx.person?.id ?? null,
            transactionDate: tx.transactionDate,
            description: tx.description || ''
          };
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load transaction';
          this.loading = false;
        }
      });
  }

  selectType(type: string): void {
    this.transactionData.type = type;
    if (type === 'EXPENSE') {
      this.transactionData.personId = null;
    } else {
      this.transactionData.categoryId = null;
    }
  }

  isFormValid(): boolean {
    const hasAccount = !!this.transactionData.accountId;
    const hasAmount = this.transactionData.amount > 0;
    const hasDate = !!this.transactionData.transactionDate;
    const hasRequiredPerson =
      this.transactionData.type === 'EXPENSE' || !!this.transactionData.personId;

    return hasAccount && hasAmount && hasDate && hasRequiredPerson;
  }

  trackById(_: number, item: any): number {
    return item.id;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      type: this.transactionData.type,
      accountId: this.transactionData.accountId,
      amount: this.transactionData.amount,
      categoryId: this.transactionData.categoryId ?? null,
      personId: this.transactionData.personId ?? null,
      transactionDate: this.transactionData.transactionDate,
      description: this.transactionData.description || null
    };

    const request$ = this.isEditMode && this.transactionId
      ? this.transactionService.updateTransaction(this.transactionId, payload)
      : this.transactionService.createTransaction(payload);

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = this.isEditMode
            ? 'Transaction updated successfully!'
            : 'Transaction created successfully!';

          setTimeout(() => {
            if (!this.destroy$.closed) {
              this.router.navigate(['/transactions']);
            }
          }, 1200);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Operation failed';
          this.loading = false;
        }
      });
  }

  formatCurrency(value: number): string {
    if (value === undefined || value === null) return '₹0.00';
    return `₹${Math.abs(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}
