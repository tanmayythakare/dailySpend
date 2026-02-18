import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Something went wrong';
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
      snackBar.open(errorMessage, 'Close', {
        duration:           3000,
        horizontalPosition: 'right',
        verticalPosition:   'top'
      });
      return throwError(() => error);
    })
  );
};