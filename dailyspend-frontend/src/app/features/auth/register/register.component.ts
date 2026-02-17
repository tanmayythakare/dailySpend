import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnDestroy {

  private destroy$ = new Subject<void>();

  registerData = {
    username: '',
    email: '',
    password: ''
  };

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (!this.registerData.username || !this.registerData.email || !this.registerData.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    if (this.registerData.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Account created successfully! Redirecting to login...';

          setTimeout(() => {
            if (!this.destroy$.closed) {
              this.router.navigate(['/login']);
            }
          }, 2000);
        },
        error: (error) => {
          if (error.status === 409) {
            this.errorMessage = 'Username or email already exists';
          } else if (error.status === 400) {
            this.errorMessage = error.error?.message || 'Invalid registration data';
          } else if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please check your connection.';
          } else {
            this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          }
          this.loading = false;
        }
      });
  }
}
