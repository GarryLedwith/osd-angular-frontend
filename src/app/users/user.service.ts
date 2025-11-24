import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, retry, catchError, throwError } from 'rxjs';
import { User } from '../users/user.interface';
import { environment } from '../../environments/environment.development';


@Injectable({ providedIn: 'root' })
export class UserService {
  /** Injected HttpClient for making HTTP requests */
  private http = inject(HttpClient);

  /** Base URL for all user-related API endpoints */
  private baseUrl = `${environment.apiUri}/users`;

  // ================== USER CRUD OPERATIONS ==========================

 
  // Get all users (returns array of User objects)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl).pipe(
      retry(3),  // Retry up to 3 times on failure
      catchError(this.handleError)
    );
  }


  // Get a user by ID (takes an ID string as an argument and returns a single User object)
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`).pipe(
      retry(3),  // Retry up to 3 times on failure
      catchError(this.handleError)
    );
  }

  // Create a new user (takes a User object as an argument and returns the created User object)
  createUser(payload: User): Observable<User> {
    return this.http.post<User>(this.baseUrl, payload).pipe(
      retry(3),  // Retry up to 3 times on failure
      catchError(this.handleError)
    );
  }

  // Update user details (partial update, takes user ID and partial User object, returns updated User)
  updateUser(id: string, payload: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}`, payload).pipe(
      retry(3),  // Retry up to 3 times on failure
      catchError(this.handleError)
    );
  }


  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      retry(3),  // Retry up to 3 times on failure
      catchError(this.handleError)
    );
  }

  // ================== ERROR HANDLING ==========================

 // Error handling method for all HTTP requests
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    // Default error message for unknown errors
    let message = 'An unknown error occurred';

    // Handle 404: Resource not found (user doesn't exist)
    if (error.status === 404) {
      message = 'User not found (404)';
    }
    // Handle 500: Internal server error
    else if (error.status === 500) {
      message = 'Server error (500). Please try again later.';
    }
    // Handle network/client-side errors (status 0 indicates network failure)
    else if (error.error instanceof ErrorEvent) {
      message = `Network error: ${error.error.message}`;
    }

    // Log error details to console for debugging
    console.error('API Error:', message, error);

    // Return observable that immediately errors with user-friendly message
    return throwError(() => new Error(message));
  };
}
