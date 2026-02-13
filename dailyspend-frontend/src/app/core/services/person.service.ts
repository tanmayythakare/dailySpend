import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Person } from '../../models/person.model';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  constructor(private api: ApiService) {}

  getAll(): Observable<Person[]> {
    return this.api.get<Person[]>('/v1/people');
  }
  create(payload: { name: string }) {
  return this.api.post<Person>('/v1/people', payload);
}
}
