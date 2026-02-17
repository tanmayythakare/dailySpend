import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { CategoryService } from '../../../core/services/category.service';
import { PersonService } from '../../../core/services/person.service';

import { Transaction } from '../../../models/transaction.model';
import { Account } from '../../../models/account.model';
import { Category } from '../../../models/category.model';
import { Person } from '../../../models/person.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    MatDialogModule
  ],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  transactions: Transaction[] = [];
  accounts: Account[] = [];
  categories: Category[] = [];
  people: Person[] = [];

  loading = true;

  Math = Math;

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  pageNumbers: number[] = [];

  get currentPage(): number { return this.pageIndex + 1; }
  get totalPages(): number  { return Math.ceil(this.totalItems / this.pageSize) || 1; }

  filters = {
    type: '',
    accountId: '',
    fromDate: '',
    toDate: ''
  };

  showFilters = false;

  editingId: number | null = null;
  editData: any = {};

  filterForm: FormGroup;

  sortOptions = [
    { value: 'DATE_DESC', label: 'Newest First' },
    { value: 'DATE_ASC', label: 'Oldest First' },
    { value: 'AMOUNT_DESC', label: 'Amount: High to Low' },
    { value: 'AMOUNT_ASC', label: 'Amount: Low to High' }
  ];

  constructor(
    private transactionService: TransactionService,
    private accountService: AccountService,
    private categoryService: CategoryService,
    private personService: PersonService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      accountId: [null],
      type: [null],
      startDate: [null],
      endDate: [null],
      sortOption: ['DATE_DESC']
    });
  }

  ngOnInit(): void {
    this.loadDropdownData();
    this.loadTransactions();

    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadTransactions();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDropdownData(): void {
    this.accountService.getAll().pipe(takeUntil(this.destroy$))
      .subscribe(accounts => this.accounts = accounts);

    this.categoryService.getAll().pipe(takeUntil(this.destroy$))
      .subscribe(categories => this.categories = categories);

    this.personService.getAll().pipe(takeUntil(this.destroy$))
      .subscribe(people => this.people = people);
  }

  loadTransactions(): void {
    this.loading = true;

    const f = this.filterForm.value;
    let sortBy = 'transactionDate';
    let direction = 'desc';

    switch (f.sortOption) {
      case 'DATE_ASC':    direction = 'asc'; break;
      case 'AMOUNT_DESC': sortBy = 'amount'; direction = 'desc'; break;
      case 'AMOUNT_ASC':  sortBy = 'amount'; direction = 'asc'; break;
    }

    const params: any = {
      page: this.pageIndex,
      size: this.pageSize,
      sortBy,
      direction
    };

    if (this.filters.type)      params.type = this.filters.type;
    if (this.filters.accountId) params.accountId = this.filters.accountId;
    if (this.filters.fromDate)  params.startDate = this.filters.fromDate;
    if (this.filters.toDate)    params.endDate = this.filters.toDate;

    if (f.accountId)  params.accountId = f.accountId;
    if (f.type)       params.type = f.type;
    if (f.startDate)  params.startDate = this.formatDate(f.startDate);
    if (f.endDate)    params.endDate = this.formatDate(f.endDate);

    this.transactionService.getPaged(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.transactions = response.content || [];
          this.totalItems = response.totalElements || 0;
          this.updatePageNumbers();
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  updatePageNumbers(): void {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end   = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    this.pageNumbers = pages;
  }

  trackByTransaction(_: number, tx: Transaction): number {
    return tx.id;
  }

  trackByPage(_: number, page: number): number {
    return page;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageIndex = page - 1;
    this.loadTransactions();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.filters = { type: '', accountId: '', fromDate: '', toDate: '' };
    this.filterForm.reset({ sortOption: 'DATE_DESC' });
  }

  editTransaction(id: number): void {
    this.router.navigate(['/transactions', id, 'edit']);
  }

  deleteTransaction(id: number): void {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    this.transactionService.delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadTransactions());
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.editingId = null;
    this.editData = {};
  }

  private formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  applyFilters(): void {
  this.pageIndex = 0;
  this.loadTransactions();
}

exportToCSV(): void {
  const rows = [
    ['Date', 'Type', 'Description', 'Account', 'Category', 'Amount'],
    ...this.transactions.map(tx => [
      tx.transactionDate ?? '',
      tx.type ?? '',
      tx.description ?? '',
      tx.account?.name ?? '',
      tx.category?.name ?? '',
      tx.amount ?? 0
    ])
  ];

  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

formatType(type: string): string {
  switch (type) {
    case 'EXPENSE': return 'Expense';
    case 'MONEY_GIVEN': return 'Money Given';
    case 'MONEY_TAKEN': return 'Money Taken';
    default: return type;
  }
}

getAccountName(tx: any): string {
  return tx?.account?.name ?? '—';
}

getCategoryName(tx: any): string {
  return tx?.category?.name ?? '—';
}

isNegativeTransaction(type: string): boolean {
  return type === 'EXPENSE' || type === 'MONEY_GIVEN';
}

isPositiveTransaction(type: string): boolean {
  return type === 'MONEY_TAKEN';
}

formatAmount(tx: any): string {
  const abs = Math.abs(tx.amount ?? 0);
  const formatted = abs.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return this.isNegativeTransaction(tx.type)
    ? `-₹${formatted}`
    : `₹${formatted}`;
}

}
