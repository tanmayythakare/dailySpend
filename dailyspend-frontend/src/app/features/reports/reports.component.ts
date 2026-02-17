import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexLegend,
  ApexTooltip,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexPlotOptions
} from 'ng-apexcharts';

import { TransactionService } from '../../core/services/transaction.service';

interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  transactionCount: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  loading = false;

  summary: ReportSummary = {
    totalIncome: 0,
    totalExpenses: 0,
    netFlow: 0,
    transactionCount: 0
  };

  rawTransactions: any[] = [];

  // ───────── Line Chart ─────────
  trendSeries: ApexAxisChartSeries = [];
  trendChart: ApexChart = {
    type: 'line',
    height: 260,
    toolbar: { show: false },
    animations: { enabled: true }
  };

  trendXAxis: ApexXAxis = {
    categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
  };

  trendStroke: ApexStroke = {
    curve: 'smooth',
    width: 3
  };

  trendDataLabels: ApexDataLabels = { enabled: false };
  trendLegend: ApexLegend = { show: false };

  trendTooltip: ApexTooltip = {
    y: {
      formatter: (val) => this.formatCurrency(val)
    }
  };

  // ───────── Donut Chart ─────────
  donutSeries: ApexNonAxisChartSeries = [];
  donutLabels: string[] = [];

  donutChart: ApexChart = {
    type: 'donut',
    height: 260
  };

  donutPlotOptions: ApexPlotOptions = {
    pie: {
      donut: { size: '70%' }
    }
  };

  donutResponsive: ApexResponsive[] = [
    {
      breakpoint: 480,
      options: {
        chart: { height: 220 }
      }
    }
  ];

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.transactionService.getPaged({ page: 0, size: 1000 }).subscribe({
      next: (response: any) => {
        this.rawTransactions = response.content || [];
        this.calculateSummary();
        this.buildTrendChart();
        this.buildDonutChart();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private calculateSummary(): void {
    let income = 0;
    let expenses = 0;

    this.rawTransactions.forEach(tx => {
      if (tx.type === 'MONEY_TAKEN') income += tx.amount;
      else if (tx.type === 'EXPENSE' || tx.type === 'MONEY_GIVEN') expenses += tx.amount;
    });

    this.summary = {
      totalIncome: income,
      totalExpenses: expenses,
      netFlow: income - expenses,
      transactionCount: this.rawTransactions.length
    };
  }

  private buildTrendChart(): void {
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];

    const incomeData = [0, 0, 0, 0, 0, 0];
    const expenseData = [0, 0, 0, 0, 0, 0];

    const monthMap: Record<number, number> = {
      8: 0, 9: 1, 10: 2, 11: 3, 0: 4, 1: 5
    };

    this.rawTransactions.forEach(tx => {
      const date = new Date(tx.transactionDate);
      const monthIndex = monthMap[date.getMonth()];
      if (monthIndex === undefined) return;

      if (tx.type === 'MONEY_TAKEN')
        incomeData[monthIndex] += tx.amount;

      if (tx.type === 'EXPENSE' || tx.type === 'MONEY_GIVEN')
        expenseData[monthIndex] += tx.amount;
    });

    this.trendSeries = [
      { name: 'Income', data: incomeData },
      { name: 'Expense', data: expenseData }
    ];
  }

  private buildDonutChart(): void {
    const categoryMap = new Map<string, number>();

    this.rawTransactions
      .filter(t => t.type === 'EXPENSE' && t.category)
      .forEach(tx => {
        const name = tx.category?.name ?? 'Other';
        categoryMap.set(name, (categoryMap.get(name) || 0) + tx.amount);
      });

    if (categoryMap.size > 0) {
      this.donutLabels = Array.from(categoryMap.keys());
      this.donutSeries = Array.from(categoryMap.values());
    } else {
      this.donutLabels = ['Food', 'Transport', 'Shopping'];
      this.donutSeries = [8000, 5000, 3000];
    }
  }

  formatCurrency(value: number): string {
    if (!value) return '₹0';
    return `₹${value.toLocaleString('en-IN')}`;
  }
}
