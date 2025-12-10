import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthUser, LoginResponse } from './auth-custom.interface';
import { environment } from '../../environments/environment';

/**
 * Authentication Service
 * Handles user login, logout, and session management
 */
@Injectable({
  providedIn: 'root'
})
export class AuthCustomService {
  // Observable that holds the current logged-in user (or null if not logged in)
  readonly currentUser$: BehaviorSubject<AuthUser | null>;

  // Observable that indicates whether a user is authenticated
  readonly isAuthenticated$: BehaviorSubject<boolean>;

  private http = inject(HttpClient);

  // Timer to automatically logout user when token expires
  private authenticateTimeout: any;

  constructor() {
    // Check if there's a saved user in localStorage
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser && storedUser !== '{}' ? JSON.parse(storedUser) : null;

    // Set the current user from localStorage
    this.currentUser$ = new BehaviorSubject<AuthUser | null>(parsedUser);

    // Check if there's a saved token in localStorage
    const token = localStorage.getItem('token') || '';

    if (token) {
      // Decode the JWT token to get the expiration time
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expires = payload.exp * 1000; // Convert to milliseconds

      // Check if the token is still valid
      if (expires > Date.now()) {
        this.isAuthenticated$ = new BehaviorSubject<boolean>(true);
        this.startAuthenticateTimer(expires);
      } else {
        // Token has expired
        this.isAuthenticated$ = new BehaviorSubject<boolean>(false);
      }
    } else {
      // No token found
      this.isAuthenticated$ = new BehaviorSubject<boolean>(false);
    }
  }

  /**
   * Login user with email and password
   * Saves the token and user info to localStorage
   */
  login(email: string, password: string): Observable<LoginResponse> {
    const url = `${environment.apiUri}/auth`;
    return this.http.post<LoginResponse>(url, { email, password }).pipe(
      tap((response) => {
        // Save token and user info to localStorage
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Update observables
        this.currentUser$.next(response.user);
        this.isAuthenticated$.next(true);

        // Decode token to get expiration time and start auto-logout timer
        const payload = JSON.parse(atob(response.accessToken.split('.')[1]));
        const expires = payload.exp * 1000;
        this.startAuthenticateTimer(expires);
      })
    );
  }

  /**
   * Logout user
   * Removes token and user info from localStorage and clears the timer
   */
  public logout(): void {
    // Remove from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Update observables
    this.currentUser$.next(null);
    this.isAuthenticated$.next(false);

    // Clear the auto-logout timer
    if (this.authenticateTimeout) {
      clearTimeout(this.authenticateTimeout);
    }
  }

  /**
   * Start a timer to automatically logout user before token expires
   * Logs out 1 minute before the actual expiration time
   */
  private startAuthenticateTimer(expires: number): void {
    // Calculate timeout (logout 1 minute before expiration)
    const timeout = expires - Date.now() - 60 * 1000;

    // If already expired, logout immediately
    if (timeout <= 0) {
      this.logout();
      return;
    }

    // Set timer to automatically logout when token is about to expire
    this.authenticateTimeout = setTimeout(() => {
      if (this.isAuthenticated$.value) {
        this.logout();
      }
    }, timeout);
  }
}

