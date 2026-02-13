import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Transaction, 
  ExpenseRequest, 
  MoneyGivenRequest, 
  MoneyTakenRequest 
} from '../../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiBaseUrl}/v1/transactions`;

  constructor(private http: HttpClient) {}

  /**
   * Get all transactions (simple list, no pagination)
   */
  getAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  /**
   * Get transactions with pagination and filters
   * THIS IS THE CORRECT METHOD FOR THE TRANSACTION LIST COMPONENT
   */
  getPaged(params: any): Observable<any> {
    let httpParams = new HttpParams();
    
    // Add all parameters
    Object.keys(params).forEach(key => {
      if (params[key] != null && params[key] !== '') {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    // ✅ CRITICAL: Call /filter endpoint, not root endpoint
    return this.http.get<any>(`${this.apiUrl}/filter`, { params: httpParams });
  }

  /**
   * Create expense transaction
   */
  createExpense(request: ExpenseRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/expense`, request);
  }

  /**
   * Create money given transaction
   */
  createMoneyGiven(request: MoneyGivenRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/money-given`, request);
  }

  /**
   * Create money taken transaction
   */
  createMoneyTaken(request: MoneyTakenRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/money-taken`, request);
  }

  /**
   * Delete transaction
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  updateTransaction(id: number, payload: any) {
  return this.http.put(`${this.apiUrl}/${id}`, payload);
}

}