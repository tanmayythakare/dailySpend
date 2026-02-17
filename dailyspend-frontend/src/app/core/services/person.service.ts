import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Person } from '../../models/person.model';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  constructor(private api: ApiService) {}

  // ── Core methods (used by transaction-list, person-detail) ───────────────
  getAll(): Observable<Person[]> {
    return this.api.get<Person[]>('/v1/people');
  }

  create(payload: { name: string }): Observable<Person> {
    return this.api.post<Person>('/v1/people', payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/v1/people/${id}`);
  }

  // ── Aliases used by people-list & transaction-form ───────────────────────
  getAllPeople(): Observable<Person[]> {
    return this.getAll();
  }

  createPerson(payload: { name: string }): Observable<Person> {
    return this.create(payload);
  }

  deletePerson(id: number): Observable<void> {
    return this.delete(id);
  }
}