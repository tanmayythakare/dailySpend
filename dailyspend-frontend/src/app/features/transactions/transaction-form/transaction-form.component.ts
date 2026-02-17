import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TransactionService } from '../../core/services/transaction.service';
import { AccountService } from '../../core/services/account.service';
import { CategoryService } from '../../core/services/category.service';
import { PersonService } from '../../core/services/person.service';

interface TransactionFormData {
  type: string;
  accountId: number | null;
  amount: number;
  category: string;
  personId: number | null;
  transactionDate: string;
  description: string;
}

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    amount: 0,
    category: '',
    personId: null,
    transactionDate: this.getTodayDate(),
    description: ''
  };

  // Dropdown data
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
    // Check if editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.transactionId = +id;
      this.loadTransaction(this.transactionId);
    }

    // Load dropdown data
    this.loadAccounts();
    this.loadCategories();
    this.loadPeople();
  }

  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  loadTransaction(id: number): void {
    this.loading = true;
    this.transactionService.getTransactionById(id).subscribe({
      next: (transaction) => {
        this.transactionData = {
          type: transaction.type,
          accountId: transaction.accountId,
          amount: transaction.amount,
          category: transaction.category || '',
          personId: transaction.personId || null,
          transactionDate: transaction.transactionDate.split('T')[0],
          description: transaction.description || ''
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading transaction:', error);
        this.errorMessage = 'Failed to load transaction';
        this.loading = false;
      }
    });
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadPeople(): void {
    this.personService.getAllPeople().subscribe({
      next: (people) => {
        this.people = people;
      },
      error: (error) => {
        console.error('Error loading people:', error);
      }
    });
  }

  selectType(type: string): void {
    this.transactionData.type = type;
    
    // Reset type-specific fields
    if (type === 'EXPENSE') {
      this.transactionData.personId = null;
    } else {
      this.transactionData.category = '';
    }
  }

  isFormValid(): boolean {
    const hasType = !!this.transactionData.type;
    const hasAccount = !!this.transactionData.accountId;
    const hasAmount = this.transactionData.amount > 0;
    const hasDate = !!this.transactionData.transactionDate;

    // For EXPENSE, no person required
    // For MONEY_GIVEN and MONEY_TAKEN, person is required
    const hasRequiredPerson = 
      this.transactionData.type === 'EXPENSE' || 
      !!this.transactionData.personId;

    return hasType && hasAccount && hasAmount && hasDate && hasRequiredPerson;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const transactionPayload = {
      type: this.transactionData.type,
      accountId: this.transactionData.accountId,
      amount: this.transactionData.amount,
      category: this.transactionData.category || null,
      personId: this.transactionData.personId || null,
      transactionDate: this.transactionData.transactionDate,
      description: this.transactionData.description || null
    };

    if (this.isEditMode && this.transactionId) {
      // Update existing transaction
      this.transactionService.updateTransaction(this.transactionId, transactionPayload).subscribe({
        next: () => {
          this.successMessage = 'Transaction updated successfully!';
          setTimeout(() => {
            this.router.navigate(['/transactions']);
          }, 1500);
        },
        error: (error) => {
          console.error('Error updating transaction:', error);
          this.errorMessage = error.error?.message || 'Failed to update transaction';
          this.loading = false;
        }
      });
    } else {
      // Create new transaction
      this.transactionService.createTransaction(transactionPayload).subscribe({
        next: () => {
          this.successMessage = 'Transaction created successfully!';
          setTimeout(() => {
            this.router.navigate(['/transactions']);
          }, 1500);
        },
        error: (error) => {
          console.error('Error creating transaction:', error);
          this.errorMessage = error.error?.message || 'Failed to create transaction';
          this.loading = false;
        }
      });
    }
  }

  formatCurrency(value: number): string {
    if (value === undefined || value === null) {
      return '₹0.00';
    }
    
    const formatted = Math.abs(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `₹${formatted}`;
  }
}