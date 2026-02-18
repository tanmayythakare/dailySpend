import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Account } from '../../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {

  constructor(private api: ApiService) {}

  getAll(): Observable<Account[]> {
    return this.api.get<Account[]>('/v1/accounts');
  }

  // Used by account-detail — GET /api/v1/accounts/:id
  getById(id: number): Observable<Account> {
    return this.api.get<Account>(`/v1/accounts/${id}`);
  }

  create(account: { name: string; type: string; balance?: number }): Observable<Account> {
    return this.api.post<Account>('/v1/accounts', account);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/v1/accounts/${id}`);
  }

  // Aliases for compatibility with dashboard & transaction-form
  getAllAccounts(): Observable<Account[]> { return this.getAll(); }
  createAccount(a: { name: string; type: string; balance?: number }): Observable<Account> { return this.create(a); }
  deleteAccount(id: number): Observable<void> { return this.delete(id); }
}