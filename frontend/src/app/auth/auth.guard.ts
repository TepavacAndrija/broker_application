import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isReverse = route.data['reverse'] || false;

  return authService.checkAuthStatus().pipe(
    map((isAuthenticated) => {
      if (isReverse) {
        if (isAuthenticated) {
          router.navigate(['/dashboard']);
          return false;
        }
        return true;
      } else {
        if (isAuthenticated) {
          return true;
        } else {
          router.navigate(['/login']);
          return false;
        }
      }
    })
  );
};
