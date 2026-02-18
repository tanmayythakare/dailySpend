import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  constructor(private api: ApiService) {}

  // GET /api/v1/analytics/income
  getIncome(): Observable<number> {
    return this.api.get<number>('/v1/analytics/income');
  }

  // GET /api/v1/analytics/expense
  getExpense(): Observable<number> {
    return this.api.get<number>('/v1/analytics/expense');
  }

  // GET /api/v1/analytics/net
  getNet(): Observable<number> {
    return this.api.get<number>('/v1/analytics/net');
  }
}