import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../core/services/transaction.service';

interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  transactionCount: number;
}

interface CategoryData {
  category: string;
  amount: number;
  count: number;
}

interface TrendData {
  date: string;
  amount: number;
}

interface TopCategory {
  name: string;
  amount: number;
  count: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  loading = false;
  errorMessage = '';

  summary: ReportSummary = {
    totalIncome: 0,
    totalExpenses: 0,
    netFlow: 0,
    transactionCount: 0
  };

  categoryData: CategoryData[] = [];
  trendData: TrendData[] = [];
  topCategories: TopCategory[] = [];

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadReportsData();
  }

  loadReportsData(): void {
    this.loading = true;
    this.errorMessage = '';

    // getPaged with a large size effectively fetches all transactions
    this.transactionService.getPaged({ page: 0, size: 1000 }).subscribe({
      next: (response: any) => {
        const transactions = response.content || [];

        this.calculateSummary(transactions);
        this.calculateCategoryData(transactions);
        this.calculateTrendData(transactions);
        this.calculateTopCategories(transactions);

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading reports:', error);
        this.errorMessage = 'Failed to load reports. Please try again.';
        this.loading = false;
      }
    });
  }

  private calculateSummary(transactions: any[]): void {
    this.summary = {
      totalIncome: 0,
      totalExpenses: 0,
      netFlow: 0,
      transactionCount: transactions.length
    };

    transactions.forEach(tx => {
      if (tx.type === 'MONEY_TAKEN') {
        this.summary.totalIncome += tx.amount;
      } else if (tx.type === 'EXPENSE' || tx.type === 'MONEY_GIVEN') {
        this.summary.totalExpenses += tx.amount;
      }
    });

    this.summary.netFlow = this.summary.totalIncome - this.summary.totalExpenses;
  }

  private calculateCategoryData(transactions: any[]): void {
    const categoryMap = new Map<string, { amount: number; count: number }>();

    transactions
      .filter(t => t.type === 'EXPENSE' && t.category)
      .forEach(tx => {
        // Backend returns category as a nested object { id, name }
        const categoryName = tx.category?.name ?? tx.category ?? 'Uncategorized';
        const existing = categoryMap.get(categoryName) || { amount: 0, count: 0 };
        categoryMap.set(categoryName, {
          amount: existing.amount + tx.amount,
          count: existing.count + 1
        });
      });

    this.categoryData = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, amount: data.amount, count: data.count }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }

  private calculateTrendData(transactions: any[]): void {
    const last7Days = this.getLast7Days();
    const trendMap = new Map<string, number>();

    last7Days.forEach(date => trendMap.set(date, 0));

    transactions
      .filter(t => t.type === 'EXPENSE' || t.type === 'MONEY_GIVEN')
      .forEach(tx => {
        // transactionDate comes as 'YYYY-MM-DD' from backend
        const date = typeof tx.transactionDate === 'string'
          ? tx.transactionDate.split('T')[0]
          : tx.transactionDate;

        if (trendMap.has(date)) {
          trendMap.set(date, trendMap.get(date)! + tx.amount);
        }
      });

    this.trendData = Array.from(trendMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateTopCategories(transactions: any[]): void {
    const categoryMap = new Map<string, { amount: number; count: number }>();

    transactions
      .filter(t => t.type === 'EXPENSE' && t.category)
      .forEach(tx => {
        const categoryName = tx.category?.name ?? tx.category ?? 'Uncategorized';
        const existing = categoryMap.get(categoryName) || { amount: 0, count: 0 };
        categoryMap.set(categoryName, {
          amount: existing.amount + tx.amount,
          count: existing.count + 1
        });
      });

    this.topCategories = Array.from(categoryMap.entries())
      .map(([name, data]) => ({ name, amount: data.amount, count: data.count }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }

  private getLast7Days(): string[] {
    const days: string[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  }

  getBarWidth(amount: number): number {
    if (this.categoryData.length === 0) return 0;
    const maxAmount = Math.max(...this.categoryData.map(c => c.amount));
    return maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
  }

  getTrendBarWidth(amount: number): number {
    if (this.trendData.length === 0) return 0;
    const maxAmount = Math.max(...this.trendData.map(t => t.amount));
    return maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
  }

  formatCurrency(value: number): string {
    if (value === undefined || value === null) return '₹0.00';
    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return value < 0 ? `-₹${formatted}` : `₹${formatted}`;
  }
}