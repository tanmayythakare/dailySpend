import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Category } from '../../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private api: ApiService) {}

  getAll(): Observable<Category[]> {
    return this.api.get<Category[]>('/v1/categories');
  }

  create(payload: { name: string; type: string }) {
    return this.api.post<Category>('/v1/categories', payload);
  }
}
