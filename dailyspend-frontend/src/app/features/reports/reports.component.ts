import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from "ng-apexcharts";
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexDataLabels,
  ApexLegend,
  ApexTooltip,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexPlotOptions
} from "ng-apexcharts";

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

  private rawTransactions: any[] = [];

  constructor(private transactionService: TransactionService) {}

  // ================= TREND CHART =================

  public trendSeries: ApexAxisChartSeries = [];

  public trendChart: ApexChart = {
    type: "line",
    height: 320,
    toolbar: { show: false }
  };

  public trendXAxis: ApexXAxis = {
    categories: []
  };

  public trendStroke: ApexStroke = {
    curve: "smooth",
    width: 3
  };

  public trendDataLabels: ApexDataLabels = {
    enabled: false
  };

  public trendLegend: ApexLegend = {
    position: "top"
  };

  public trendTooltip: ApexTooltip = {
    enabled: true
  };

  // ================= DONUT CHART =================

  public donutSeries: ApexNonAxisChartSeries = [];

  public donutChart: ApexChart = {
    type: "donut",
    height: 300
  };

  public donutLabels: string[] = [];

  public donutPlotOptions: ApexPlotOptions = {
    pie: {
      donut: { size: "70%" }
    }
  };

  public donutResponsive: ApexResponsive[] = [
    {
      breakpoint: 480,
      options: { chart: { width: 300 } }
    }
  ];

  private readonly DONUT_COLORS = [
    '#A594F9', '#6E55E8', '#38BCA0', '#E8A24B',
    '#E05252', '#60A5FA', '#F472B6'
  ];

  // =================================================

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.transactionService.getPaged({ page: 0, size: 1000 }).subscribe({
      next: (response: any) => {
        this.rawTransactions = response.content || [];
        this.calculateSummary();
        this.prepareCharts();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private calculateSummary(): void {
    let income = 0;
    let expenses = 0;

    this.rawTransactions.forEach(tx => {
      if (tx.type === 'MONEY_TAKEN') income += tx.amount;
      else if (tx.type === 'EXPENSE' || tx.type === 'MONEY_GIVEN')
        expenses += tx.amount;
    });

    this.summary = {
      totalIncome: income,
      totalExpenses: expenses,
      netFlow: income - expenses,
      transactionCount: this.rawTransactions.length
    };
  }

  // ================= PREPARE CHART DATA =================

  private prepareCharts(): void {
    this.prepareTrendChart();
    this.prepareDonutChart();
  }

  private prepareTrendChart(): void {
    const months = this.buildRollingMonths();

    const incomeData = new Array(6).fill(0);
    const expenseData = new Array(6).fill(0);

    this.rawTransactions.forEach(tx => {
      const month = new Date(tx.transactionDate).getMonth();
      const idx = months.monthIndices.indexOf(month);
      if (idx === -1) return;

      if (tx.type === 'MONEY_TAKEN') incomeData[idx] += tx.amount;
      else if (tx.type === 'EXPENSE' || tx.type === 'MONEY_GIVEN')
        expenseData[idx] += tx.amount;
    });

    this.trendXAxis = { categories: months.labels };

    this.trendSeries = [
      { name: "Income", data: incomeData },
      { name: "Expense", data: expenseData }
    ];
  }

  private prepareDonutChart(): void {
    const catMap = new Map<string, number>();

    this.rawTransactions
      .filter(t => t.type === 'EXPENSE' && t.category)
      .forEach(tx => {
        const name = tx.category?.name ?? 'Other';
        catMap.set(name, (catMap.get(name) || 0) + tx.amount);
      });

    const sorted = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1]);

    this.donutLabels = sorted.map(e => e[0]);
    this.donutSeries = sorted.map(e => e[1]);
  }

  // ================= UTIL =================

  private buildRollingMonths(): { labels: string[]; monthIndices: number[] } {
    const NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const now = new Date();
    const labels: string[] = [];
    const monthIndices: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(NAMES[d.getMonth()]);
      monthIndices.push(d.getMonth());
    }

    return { labels, monthIndices };
  }

  formatCurrency(value: number): string {
    if (value == null) return '₹0';
    return `₹${value.toLocaleString('en-IN')}`;
  }
}
