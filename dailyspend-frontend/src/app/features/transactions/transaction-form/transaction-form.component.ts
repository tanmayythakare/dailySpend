import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { CategoryService } from '../../../core/services/category.service';
import { PersonService } from '../../../core/services/person.service';

interface TransactionFormData {
  type: string;
  accountId: number | null;
  categoryId: number | null;  // store ID, not name
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
export class TransactionFormComponent implements OnInit {

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

    // ── Fixed: use correct method names ──────────────────────────────────
    this.accountService.getAllAccounts().subscribe({
      next: (accounts) => (this.accounts = accounts),
      error: (err) => console.error('Error loading accounts:', err)
    });

    this.categoryService.getAllCategories().subscribe({
      next: (categories) => (this.categories = categories),
      error: (err) => console.error('Error loading categories:', err)
    });

    this.personService.getAllPeople().subscribe({
      next: (people) => (this.people = people),
      error: (err) => console.error('Error loading people:', err)
    });
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  loadTransaction(id: number): void {
    this.loading = true;
    // ── Fixed: getTransactionById now exists ─────────────────────────────
    this.transactionService.getTransactionById(id).subscribe({
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
      error: (err) => {
        console.error('Error loading transaction:', err);
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

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // ── Build payload using IDs, not names ───────────────────────────────
    const payload = {
      type: this.transactionData.type,
      accountId: this.transactionData.accountId,
      amount: this.transactionData.amount,
      categoryId: this.transactionData.categoryId ?? null,
      personId: this.transactionData.personId ?? null,
      transactionDate: this.transactionData.transactionDate,
      description: this.transactionData.description || null
    };

    if (this.isEditMode && this.transactionId) {
      this.transactionService.updateTransaction(this.transactionId, payload).subscribe({
        next: () => {
          this.successMessage = 'Transaction updated successfully!';
          setTimeout(() => this.router.navigate(['/transactions']), 1500);
        },
        error: (err) => {
          console.error('Error updating transaction:', err);
          this.errorMessage = err.error?.message || 'Failed to update transaction';
          this.loading = false;
        }
      });
    } else {
      // ── Fixed: createTransaction now exists and routes by type ───────
      this.transactionService.createTransaction(payload).subscribe({
        next: () => {
          this.successMessage = 'Transaction created successfully!';
          setTimeout(() => this.router.navigate(['/transactions']), 1500);
        },
        error: (err) => {
          console.error('Error creating transaction:', err);
          this.errorMessage = err.error?.message || 'Failed to create transaction';
          this.loading = false;
        }
      });
    }
  }

  formatCurrency(value: number): string {
    if (value === undefined || value === null) return '₹0.00';
    const formatted = Math.abs(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `₹${formatted}`;
  }
}