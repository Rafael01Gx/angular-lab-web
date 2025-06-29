import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();
  if (currentUser) {
    router.navigate(['/']);
    return of(false);
  }

  return authService.checkAuthStatus().pipe(
    map((user) => {
      if (user) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};
