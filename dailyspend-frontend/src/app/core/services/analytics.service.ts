import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

private base = '/api/v1/analytics';

constructor(private http: HttpClient) {}

getIncome(): Observable<number> {
return this.http.get<number>(`${this.base}/income`);
}

getExpense(): Observable<number> {
return this.http.get<number>(`${this.base}/expense`);
}

getNet(): Observable<number> {
return this.http.get<number>(`${this.base}/net`);
}
}
