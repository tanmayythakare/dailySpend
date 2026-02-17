import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
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
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {

  transactions: Transaction[] = [];
  accounts: Account[] = [];
  categories: Category[] = [];
  people: Person[] = [];
  loading = true;

  // ── Expose Math so the template can call Math.min() ──────────────────────
  Math = Math;

  // ── Pagination state ──────────────────────────────────────────────────────
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;          // 0-based internally

  get currentPage(): number { return this.pageIndex + 1; }   // 1-based for display
  get totalPages(): number  { return Math.ceil(this.totalItems / this.pageSize) || 1; }

  // ── Filter state (used by ngModel in template) ────────────────────────────
  filters: {
    type: string;
    accountId: string;
    fromDate: string;
    toDate: string;
  } = {
    type: '',
    accountId: '',
    fromDate: '',
    toDate: ''
  };

  showFilters = false;

  // ── Inline edit state ─────────────────────────────────────────────────────
  editingId: number | null = null;
  editData: any = {};

  // ── Reactive form for sort (used by mat-select) ───────────────────────────
  filterForm: FormGroup;

  sortOptions = [
    { value: 'DATE_DESC',    label: 'Newest First' },
    { value: 'DATE_ASC',     label: 'Oldest First' },
    { value: 'AMOUNT_DESC',  label: 'Amount: High to Low' },
    { value: 'AMOUNT_ASC',   label: 'Amount: Low to High' }
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
      accountId:  [null],
      type:       [null],
      startDate:  [null],
      endDate:    [null],
      sortOption: ['DATE_DESC']
    });
  }

  ngOnInit(): void {
    this.loadDropdownData();
    this.loadTransactions();

    this.filterForm.valueChanges.subscribe(() => {
      this.pageIndex = 0;
      this.loadTransactions();
    });
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  loadDropdownData(): void {
    this.accountService.getAll().subscribe({
      next: (accounts: Account[]) => (this.accounts = accounts),
      error: (err: any) => console.error('Error loading accounts:', err)
    });
    this.categoryService.getAll().subscribe({
      next: (categories: Category[]) => (this.categories = categories),
      error: (err: any) => console.error('Error loading categories:', err)
    });
    this.personService.getAll().subscribe({
      next: (people: Person[]) => (this.people = people),
      error: (err: any) => console.error('Error loading people:', err)
    });
  }

  loadTransactions(): void {
    this.loading = true;

    const f = this.filterForm.value;
    let sortBy = 'transactionDate';
    let direction = 'desc';

    switch (f.sortOption) {
      case 'DATE_ASC':    sortBy = 'transactionDate'; direction = 'asc';  break;
      case 'AMOUNT_DESC': sortBy = 'amount';           direction = 'desc'; break;
      case 'AMOUNT_ASC':  sortBy = 'amount';           direction = 'asc';  break;
      default:            sortBy = 'transactionDate'; direction = 'desc';
    }

    const params: any = {
      page: this.pageIndex,
      size: this.pageSize,
      sortBy,
      direction
    };

    // Simple filter panel (ngModel-based, separate from filterForm)
    if (this.filters.type)      params.type      = this.filters.type;
    if (this.filters.accountId) params.accountId = this.filters.accountId;
    if (this.filters.fromDate)  params.startDate = this.filters.fromDate;
    if (this.filters.toDate)    params.endDate   = this.filters.toDate;

    // Reactive form filters (override if set)
    if (f.accountId)  params.accountId = f.accountId;
    if (f.type)       params.type      = f.type;
    if (f.startDate)  params.startDate = this.formatDate(f.startDate);
    if (f.endDate)    params.endDate   = this.formatDate(f.endDate);

    this.transactionService.getPaged(params).subscribe({
      next: (response: any) => {
        this.transactions = response.content || [];
        this.totalItems   = response.totalElements || 0;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading transactions:', err);
        this.loading = false;
      }
    });
  }

  // ── Filter helpers ────────────────────────────────────────────────────────

  /** Called by (change) on the simple filter panel dropdowns/inputs */
  applyFilters(): void {
    this.pageIndex = 0;
    this.loadTransactions();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.filters = { type: '', accountId: '', fromDate: '', toDate: '' };
    this.filterForm.reset({ sortOption: 'DATE_DESC' });
  }

  // ── Pagination helpers (used in template) ─────────────────────────────────

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageIndex = page - 1;
    this.loadTransactions();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end   = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
    this.loadTransactions();
  }

  // ── Display helpers (called from template) ────────────────────────────────

  /** Backend returns account as nested { id, name } object */
  getAccountName(transaction: any): string {
    return transaction?.account?.name ?? '—';
  }

  /** Backend returns category as nested { id, name } object */
  getCategoryName(transaction: any): string {
    return transaction?.category?.name ?? '—';
  }

  formatType(type: string): string {
    switch (type) {
      case 'EXPENSE':     return 'Expense';
      case 'MONEY_GIVEN': return 'Money Given';
      case 'MONEY_TAKEN': return 'Money Taken';
      default:            return type;
    }
  }

  isNegativeTransaction(type: string): boolean {
    return type === 'EXPENSE' || type === 'MONEY_GIVEN';
  }

  isPositiveTransaction(type: string): boolean {
    return type === 'MONEY_TAKEN';
  }

  formatAmount(transaction: any): string {
    const prefix = this.isNegativeTransaction(transaction.type) ? '-' : '+';
    const absVal = Math.abs(transaction.amount ?? 0);
    const formatted = absVal.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `${prefix}₹${formatted}`;
  }

  getAmountClass(transaction: Transaction): string {
    return transaction.type === 'MONEY_TAKEN' ? 'positive' : 'negative';
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  editTransaction(id: number): void {
    this.router.navigate(['/transactions', id, 'edit']);
  }

  deleteTransaction(id: number): void {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    this.transactionService.delete(id).subscribe({
      next: () => this.loadTransactions(),
      error: (err: any) => {
        console.error('Delete failed:', err);
        this.snackBar.open('Failed to delete transaction', 'Close', {
          duration: 3000, horizontalPosition: 'right', verticalPosition: 'top'
        });
      }
    });
  }

  exportToCSV(): void {
    const rows = [
      ['Date', 'Type', 'Description', 'Account', 'Category', 'Amount'],
      ...this.transactions.map((tx: any) => [
        tx.transactionDate ?? '',
        tx.type ?? '',
        tx.description ?? '',
        tx.account?.name ?? '',
        tx.category?.name ?? '',
        tx.amount ?? 0
      ])
    ];

    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Inline edit ───────────────────────────────────────────────────────────

  startEdit(tx: any): void {
    if (this.editingId !== null && this.editingId !== tx.id) {
      this.snackBar.open('Finish editing current row first', 'Close', { duration: 3000 });
      return;
    }
    this.editingId = tx.id;
    this.editData  = { ...tx };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editData  = {};
  }

  saveEdit(): void {
    if (!this.editingId) return;

    const payload = {
      amount:          this.editData.amount,
      description:     this.editData.description,
      transactionDate: this.editData.transactionDate,
      accountId:       this.editData.account?.id,
      categoryId:      this.editData.category?.id,
      personId:        this.editData.person?.id,
      type:            this.editData.type
    };

    this.transactionService.updateTransaction(this.editingId, payload).subscribe({
      next: () => {
        this.editingId = null;
        this.loadTransactions();
      },
      error: (err: any) => {
        console.error('Save edit failed:', err);
        this.snackBar.open('Failed to save changes', 'Close', { duration: 3000 });
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.cancelEdit();
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d     = new Date(date);
    const year  = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day   = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}