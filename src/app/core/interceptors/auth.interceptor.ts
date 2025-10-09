import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

// Ensures credentials (cookies) are sent and handles 401 globally
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  inject(AuthService); // ensure service is instantiated (for env initializer side-effects)

  // Clone request to always include credentials; backends using cookies require this
  const withCreds = req.clone({ withCredentials: true });

  return next(withCreds).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // On unauthorized, clear session and redirect to login
        try {
          const auth = inject(AuthService);
          auth.clearUser();
        } catch {}
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
