import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { CategoryService } from '../../../core/services/category.service';
import { PersonService } from '../../../core/services/person.service';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { Transaction } from '../../../models/transaction.model';
import { Account } from '../../../models/account.model';
import { Category } from '../../../models/category.model';
import { FormsModule } from '@angular/forms';
import { Person } from '../../../models/person.model';
import { HostListener } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
  displayedColumns = ['date', 'type', 'description', 'account', 'amount', 'actions'];

  // Pagination
  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;

  editingId: number | null = null;
  editData: any = {};


  // Filter Form
  filterForm: FormGroup;
  showFilters = false;

  transactionTypes = [
    { value: 'EXPENSE', label: 'Expense' },
    { value: 'MONEY_GIVEN', label: 'Money Given' },
    { value: 'MONEY_TAKEN', label: 'Money Taken' }
  ];
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
    private snackBar:MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      accountId: [null],
      type: [null],
      startDate: [null],
      endDate: [null],
      sortOption: [this.sortOptions]
    });
  }
  ngAfterViewInit() {
  console.log('Sort Options:', this.sortOptions);
  console.log('Accounts:', this.accounts);
  console.log('Transaction Types:', this.transactionTypes);
}


  ngOnInit(): void {
    this.loadDropdownData();
    this.loadTransactions();

    // React to filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.pageIndex = 0; // Reset to first page
      this.loadTransactions();
    });
  }

  loadDropdownData(): void {
    this.accountService.getAll().subscribe({
      next: (accounts) => this.accounts = accounts,
      error: (error) => console.error('Error loading accounts:', error)
    });

    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories = categories,
      error: (error) => console.error('Error loading categories:', error)
    });

    this.personService.getAll().subscribe({
      next: (people) => this.people = people,
      error: (error) => console.error('Error loading people:', error)
    });
  }

  loadTransactions(): void {
  this.loading = true;

  const filters = this.filterForm.value;

  let sortBy = 'transactionDate';
  let direction = 'desc';

  switch (filters.sortOption) {
    case 'DATE_ASC':
      sortBy = 'transactionDate';
      direction = 'asc';
      break;
    case 'AMOUNT_DESC':
      sortBy = 'amount';
      direction = 'desc';
      break;
    case 'AMOUNT_ASC':
      sortBy = 'amount';
      direction = 'asc';
      break;
    default:
      sortBy = 'transactionDate';
      direction = 'desc';
  }
  

  const params: any = {
    page: this.pageIndex,
    size: this.pageSize,
    sortBy,
    direction
  };

  if (filters.accountId) params.accountId = filters.accountId;
  if (filters.type) params.type = filters.type;
  if (filters.startDate) params.startDate = this.formatDate(filters.startDate);
  if (filters.endDate) params.endDate = this.formatDate(filters.endDate);

  this.transactionService.getPaged(params).subscribe({
    next: (response: any) => {
      this.transactions = response.content || [];
      this.totalItems = response.totalElements || 0;
      this.loading = false;
    },
    error: (error) => {
      console.error('Error loading transactions:', error);
      this.loading = false;
    }
  });
}


  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTransactions();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  openAddTransactionDialog(): void {
    const dialogRef = this.dialog.open(TransactionFormComponent, {
      width: '600px',
      data: {
        accounts: this.accounts,
        categories: this.categories,
        people: this.people
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTransactions();
      }
    });
  }

  deleteTransaction(id: number): void {
    if (confirm('Are you sure you want to delete this transaction?')
) {
      this.transactionService.delete(id).subscribe({
        next: () => {
          this.loadTransactions();
        },
        error: (error) => {
          console.error('Error deleting transaction:', error);
          this.snackBar.open('Failed to delete transaction', 'Close', {
  duration: 3000,
  horizontalPosition: 'right',
  verticalPosition: 'top'
});

        }
      });
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'EXPENSE':
        return 'warn';
      case 'MONEY_GIVEN':
        return 'accent';
      case 'MONEY_TAKEN':
        return 'primary';
      default:
        return '';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'EXPENSE':
        return 'Expense';
      case 'MONEY_GIVEN':
        return 'Money Given';
      case 'MONEY_TAKEN':
        return 'Money Taken';
      default:
        return type;
    }
  }
  startEdit(tx: any) {

  // prevent editing another row
  if (this.editingId !== null && this.editingId !== tx.id) {
    this.snackBar.open('Finish editing current row first', 'Close', {
  duration: 3000,
  horizontalPosition: 'right',
  verticalPosition: 'top'
});

    return;
  }

  this.editingId = tx.id;
  this.editData = { ...tx };
}


cancelEdit() {
  this.editingId = null;
  this.editData = {};
}

saveEdit() {

  if (!this.editingId) return;

  if (!this.editData.amount || !this.editData.account?.id) {
    this.snackBar.open('Amount and account are required', 'Close', {
  duration: 3000,
  horizontalPosition: 'right',
  verticalPosition: 'top'
});

    return;
  }

  const payload = {
    amount: this.editData.amount,
    description: this.editData.description,
    transactionDate: this.editData.transactionDate,
    accountId: this.editData.account?.id,
    categoryId: this.editData.category?.id,
    personId: this.editData.person?.id,
    type: this.editData.type
  };

  this.transactionService
    .updateTransaction(this.editingId, payload)
    .subscribe(() => {
      this.editingId = null;
      this.loadTransactions();
    });
}
@HostListener('document:keydown.escape')
onEsc() {
  this.cancelEdit();
}




  getAmountClass(transaction: Transaction): string {
    return transaction.type === 'MONEY_TAKEN' ? 'positive' : 'negative';
  }
}