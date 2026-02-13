import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PersonService } from '../../../core/services/person.service';
import { Person } from '../../../models/person.model';

@Component({
  selector: 'app-people-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './people-list.component.html'
})
export class PeopleListComponent implements OnInit {

  private personService = inject(PersonService);
  private router = inject(Router);

  people: Person[] = [];

  loading = true;

  // add person
  adding = false;
  newPersonName = '';

  ngOnInit(): void {
    this.loadPeople();
  }

  loadPeople() {
    this.loading = true;

    this.personService.getAll().subscribe({
      next: data => {
        this.people = data;
        this.loading = false;
      },
      error: err => {
        console.error('Error loading people', err);
        this.loading = false;
      }
    });
  }

  startAdd() {
    this.adding = true;
  }

  cancelAdd() {
    this.adding = false;
    this.newPersonName = '';
  }

  savePerson() {

    if (!this.newPersonName.trim()) return;

    this.personService.create({ name: this.newPersonName })
      .subscribe(created => {
        this.people.push(created);
        this.cancelAdd();
      });
  }

  openPerson(person: Person) {
    // Week 8 Step 2 → ledger page
    this.router.navigate(['/people', person.id]);
  }

  getBalanceClass(balance: number): string {
    if (balance > 0) return 'positive';
    if (balance < 0) return 'negative';
    return '';
  }
}
