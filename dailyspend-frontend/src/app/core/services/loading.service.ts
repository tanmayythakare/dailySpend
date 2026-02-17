import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * LoadingService — tracks pending HTTP requests.
 * Uses a counter so concurrent requests don't cancel each other out.
 *
 * app.component.ts subscribes to loading$ to show/hide the global spinner.
 * LoadingInterceptor calls show() / hide() around every HTTP request.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {

  private pendingRequests = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);

  /** Subscribe to this in templates: *ngIf="loading$ | async" */
  readonly loading$ = this.loadingSubject.asObservable();

  show(): void {
    this.pendingRequests++;
    if (this.pendingRequests === 1) {
      this.loadingSubject.next(true);
    }
  }

  hide(): void {
    if (this.pendingRequests > 0) {
      this.pendingRequests--;
    }
    if (this.pendingRequests === 0) {
      this.loadingSubject.next(false);
    }
  }
}