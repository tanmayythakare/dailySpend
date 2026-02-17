import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Category } from '../../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private api: ApiService) {}

  // ── Core method (used by transaction-list) ───────────────────────────────
  getAll(): Observable<Category[]> {
    return this.api.get<Category[]>('/v1/categories');
  }

  create(payload: { name: string; type: string }): Observable<Category> {
    return this.api.post<Category>('/v1/categories', payload);
  }

  // ── Alias used by transaction-form ───────────────────────────────────────
  getAllCategories(): Observable<Category[]> {
    return this.getAll();
  }
}