import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Account } from '../../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private api: ApiService) {}

  getAll(): Observable<Account[]> {
    return this.api.get<Account[]>('/v1/accounts');
  }

  create(account: { name: string; type: string; balance?: number }) {
    return this.api.post('/v1/accounts', account);
  }
}
