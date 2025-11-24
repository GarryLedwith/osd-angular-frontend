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

  // ========== ERROR HANDLING ==========

  /**
   * Handle API errors
   *
   * Logs error details and passes the full error to the component
   * so it can show specific validation messages to the user
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    // Log error details for debugging
    console.error('API Error:', error);
    console.error('Error status:', error.status);
    console.error('Error body:', error.error);

    // Log network errors specifically
    if (error.error instanceof ErrorEvent) {
      console.error('Network error:', error.error.message);
    }

    // Return full error so components can extract detailed messages
    return throwError(() => error);
  };
}
