import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Account } from '../../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private api: ApiService) {}

  // ── Core methods (used by transaction-list) ──────────────────────────────
  getAll(): Observable<Account[]> {
    return this.api.get<Account[]>('/v1/accounts');
  }

  create(account: { name: string; type: string; balance?: number }): Observable<Account> {
    return this.api.post<Account>('/v1/accounts', account);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/v1/accounts/${id}`);
  }

  // ── Aliases used by dashboard & transaction-form ─────────────────────────
  getAllAccounts(): Observable<Account[]> {
    return this.getAll();
  }

  createAccount(account: { name: string; type: string; balance?: number }): Observable<Account> {
    return this.create(account);
  }

  deleteAccount(id: number): Observable<void> {
    return this.delete(id);
  }
}