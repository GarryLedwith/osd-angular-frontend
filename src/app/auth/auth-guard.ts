import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthCustomService } from './auth-custom.service';
import { map } from 'rxjs';

/**
 * Authentication Route Guard
 * Protects routes from unauthorized access
 * Redirects to login page if user is not authenticated
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthCustomService);
  const router = inject(Router);

  // Check if user is authenticated
  return auth.isAuthenticated$.pipe(
    map((isAuth) => {
      // If not authenticated, redirect to login page and block access
      if (!isAuth) {
        router.navigate(['/login']);
        return false;
      }
      // If authenticated, allow access to the route
      return true;
    })
  );
};

// admin guard 
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthCustomService);
  const router = inject(Router);

  // Check if user is authenticated and has admin role
  return auth.currentUser$.pipe(
    map((user) => {
      // If not authenticated or not admin, redirect to login page and block access
      if (!user || user.role !== 'admin') {
        router.navigate(['/login']);
        return false;
      }
      // If authenticated and is admin, allow access to the route
      return true;
    })
  );
}

