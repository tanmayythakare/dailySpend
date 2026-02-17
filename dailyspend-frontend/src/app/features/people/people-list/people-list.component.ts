import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PersonService } from '../../core/services/person.service';

// Person model with all required fields
export interface Person {
  id?: number;
  name: string;
  userId?: number;
  balance?: number;
  transactionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-people-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './people-list.component.html',
  styleUrls: ['./people-list.component.scss']
})
export class PeopleListComponent implements OnInit {

  people: Person[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  
  // Add person form
  showAddForm = false;
  newPersonName = '';

  constructor(
    private personService: PersonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPeople();
  }

  loadPeople(): void {
    this.loading = true;
    this.errorMessage = '';

    this.personService.getAllPeople().subscribe({
      next: (data) => {
        this.people = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading people:', error);
        this.errorMessage = 'Failed to load people. Please try again.';
        this.loading = false;
      }
    });
  }

  addPerson(): void {
    if (!this.newPersonName.trim()) {
      this.errorMessage = 'Please enter a person name';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const newPerson: Person = {
      name: this.newPersonName.trim()
    };

    this.personService.createPerson(newPerson).subscribe({
      next: (person) => {
        this.successMessage = `${person.name} added successfully!`;
        this.newPersonName = '';
        this.showAddForm = false;
        this.loadPeople();
      },
      error: (error) => {
        console.error('Error adding person:', error);
        this.errorMessage = 'Failed to add person. Please try again.';
        this.loading = false;
      }
    });
  }

  deletePerson(personId: number): void {
    if (!confirm('Are you sure you want to delete this person? All associated transactions will also be removed.')) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.personService.deletePerson(personId).subscribe({
      next: () => {
        this.successMessage = 'Person deleted successfully!';
        this.loadPeople();
      },
      error: (error) => {
        console.error('Error deleting person:', error);
        this.errorMessage = 'Failed to delete person. Please try again.';
        this.loading = false;
      }
    });
  }

  viewDetails(personId: number): void {
    this.router.navigate(['/people', personId]);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  formatCurrency(value: number): string {
    if (value === undefined || value === null) {
      return '₹0.00';
    }
    
    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return value < 0 ? `-₹${formatted}` : `₹${formatted}`;
  }
}