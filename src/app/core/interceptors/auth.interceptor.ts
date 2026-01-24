import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  inject(AuthService);

  const withCreds = req.clone({ withCredentials: true });

  return next(withCreds).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        try {
          const auth = inject(AuthService);
          auth.clearUser();
        } catch {
          console.log("Erro no logoff!")
        }
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
