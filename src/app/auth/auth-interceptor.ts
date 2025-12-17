import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthCustomService } from './auth-custom.service';

/**
 * Authentication HTTP Interceptor
 * Automatically adds the JWT token to API requests and handles authentication errors
 *
 */
export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthCustomService);
  const apiUri = `${environment.apiUri}`;

  // Get the JWT token from localStorage
  const jwt = localStorage.getItem('token');

  // Clone the request to add the Authorization header if it's an API request
  const authRequest = req.url.startsWith(apiUri) && jwt
    ? req.clone({ setHeaders: { Authorization: `Bearer ${jwt}` } })
    : req;

  // Send the request and handle errors
  return next(authRequest).pipe(
    catchError((err) => {
      console.log('Request failed ' + err.status);

      // If unauthorized (401) or forbidden (403), logout and redirect to login
      if (err.status === 401 || err.status === 403) {
        authService.logout();
        router.navigate(['/login']);
      }

    
      return throwError(() => err);
    })
  );
};

