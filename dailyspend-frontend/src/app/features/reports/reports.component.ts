import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../models/transaction.model';

import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './reports.component.html'
})
export class ReportsComponent implements OnInit {

  private transactionService = inject(TransactionService);

  transactions: Transaction[] = [];

  // Summary
  totalExpense = 0;
  totalGiven = 0;
  totalTaken = 0;

  // Pie chart
  pieLabels: string[] = [];
  pieData: number[] = [];

  // Line chart
  lineLabels: string[] = [];
  lineData: number[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {

    const params = { page: 0, size: 1000 };

    this.transactionService.getPaged(params).subscribe((res: any) => {

      this.transactions = res.content || [];

      this.calculateSummary();
      this.prepareCategoryChart();
      this.prepareTimeChart();
    });
  }

  calculateSummary() {

    this.transactions.forEach(tx => {

      if (tx.type === 'EXPENSE') this.totalExpense += tx.amount;
      if (tx.type === 'MONEY_GIVEN') this.totalGiven += tx.amount;
      if (tx.type === 'MONEY_TAKEN') this.totalTaken += tx.amount;
    });
  }

  prepareCategoryChart() {

    const map: any = {};

    this.transactions
      .filter(tx => tx.type === 'EXPENSE')
      .forEach(tx => {

        const name = tx.category?.name || 'Other';

        map[name] = (map[name] || 0) + tx.amount;
      });

    this.pieLabels = Object.keys(map);
    this.pieData = Object.values(map);
  }

  prepareTimeChart() {

    const map: any = {};

    this.transactions
      .filter(tx => tx.type === 'EXPENSE')
      .forEach(tx => {

        const month = tx.transactionDate.substring(0, 7);

        map[month] = (map[month] || 0) + tx.amount;
      });

    this.lineLabels = Object.keys(map);
    this.lineData = Object.values(map);
  }
}
