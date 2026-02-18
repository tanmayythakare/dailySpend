import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PersonService } from '../../../core/services/person.service';
import { PersonBalanceDto } from '../../../models/person.model';

@Component({
  selector: 'app-people-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './people-list.component.html',
  styleUrls: ['./people-list.component.scss']
})
export class PeopleListComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // Use PersonBalanceDto (from /with-balances) so we have real balance data
  people:        PersonBalanceDto[] = [];
  loading        = false;
  errorMessage   = '';
  successMessage = '';
  showAddForm    = false;
  newPersonName  = '';

  constructor(private personService: PersonService, private router: Router) {}

  ngOnInit(): void { this.loadPeople(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPeople(): void {
    this.loading = true;
    this.errorMessage = '';

    this.personService.getAllWithBalances()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => { this.people = data; this.loading = false; },
        error: () => { this.errorMessage = 'Failed to load people. Please try again.'; this.loading = false; }
      });
  }

  addPerson(): void {
    if (!this.newPersonName.trim()) { this.errorMessage = 'Please enter a person name'; return; }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.personService.createPerson({ name: this.newPersonName.trim() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (person: any) => {
          this.successMessage = `${person.name} added successfully!`;
          this.newPersonName = '';
          this.showAddForm = false;
          this.loadPeople();
        },
        error: () => { this.errorMessage = 'Failed to add person. Please try again.'; this.loading = false; }
      });
  }

  deletePerson(personId: number): void {
    if (!confirm('Are you sure you want to delete this person?')) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.personService.deletePerson(personId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => { this.successMessage = 'Person deleted successfully!'; this.loadPeople(); },
        error: (error: any) => {
          this.errorMessage = error.error?.message || 'Failed to delete person. Please try again.';
          this.loading = false;
        }
      });
  }

  viewDetails(personId: number): void {
    this.router.navigate(['/people', personId]);
  }

  getBalance(person: PersonBalanceDto): number {
    return person.balance ?? 0;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().substring(0, 2);
  }

  formatCurrency(value: number | undefined | null): string {
    if (value == null) return '₹0.00';
    const abs = Math.abs(value);
    const fmt = abs.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value < 0 ? `-₹${fmt}` : `₹${fmt}`;
  }
}