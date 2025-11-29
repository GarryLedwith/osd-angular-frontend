import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, retry, catchError, throwError } from 'rxjs';
import { User } from '../users/user.interface';
import { environment } from '../../environments/environment.development';

/**
 * User Service
 *
 * Handles all user-related API calls:
 * - Get all users or single user by ID
 * - Create new users
 * - Update user details
 * - Delete users
 * - Error handling with retry logic
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);  // Make HTTP requests
  private baseUrl = `${environment.apiUri}/users`;  // API endpoint

  // ========== GET USERS ==========

  // Get all users from API
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl).pipe(
      retry(3),  // Try 3 times if network fails
      catchError(this.handleError)
    );
  }

  // Get one user by ID
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`).pipe(
      retry(3),  // Try 3 times if network fails
      catchError(this.handleError)
    );
  }

  // ========== CREATE/UPDATE/DELETE ==========

  // Create new user
  createUser(payload: User): Observable<User> {
    return this.http.post<User>(this.baseUrl, payload).pipe(
      // No retry - validation errors won't fix themselves
      catchError(this.handleError)
    );
  }

  // Update user (partial update - only send changed fields)
  updateUser(id: string, payload: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}`, payload).pipe(
      // No retry - validation errors won't fix themselves
      catchError(this.handleError)
    );
  }

  // Delete user permanently
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      retry(3),  // Try 3 times if network fails
      catchError(this.handleError)
    );
  }

// ================== ERROR HANDLING ==========================

  /**
   * Handles HTTP errors and logs them for debugging
   * Passes through the original error so components can extract detailed messages
   */
  private handleError(error: HttpErrorResponse) {
    let msg = 'An unknown error occurred';

    if (error.status === 0 && error.error instanceof ErrorEvent) {
      msg = `Network error: ${error.error.message}`;
    }
    else if (error.status === 404) {
      msg = 'Resource not found (404)';
    }
    else if (error.status === 400) {
      msg = 'Bad request (400) - check your data';
    }
    else if (error.status === 403) {
      msg = 'Forbidden (403) - insufficient permission';
    }
    else if (error.status === 500) {
      msg = 'Server error (500)';
    }

    console.error('API Error:', msg, error);
    return throwError(() => error);
  }
}
