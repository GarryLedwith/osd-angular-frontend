import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthCustomService } from './auth-custom.service';
import { map } from 'rxjs';

/**
 * Authentication Route Guard
 * Protects routes from unauthorized access
 * Redirects to login page if user is not authenticated
 */

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthCustomService);
  const router = inject(Router);

  if (auth.isAuthenticated$.value) {
    return true;
  } else {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url } // Pass the attempted URL for redirect after login
    });
  }
};

// admin guard to protect admin-only routes
export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthCustomService);
  const router = inject(Router);

  // debugging logs to debug role issues (which was not being passed with the token correctly)
  console.log('Admin Guard Check: Current User Role - ' + auth.currentUser$.value?.role);
  console.log('Admin Guard Check: Is Authenticated - ' + auth.isAuthenticated$.value);
  console.log('currentUser$', auth.currentUser$.value);
  console.log('role', auth.currentUser$.value?.role);

  if (auth.currentUser$.value?.role === 'admin') {
    return true;
  } else {
    router.navigate(['/']);
    return false;
  }
};
