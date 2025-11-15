import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry, catchError, throwError } from 'rxjs';
import { User } from '../users/user.interface';
import { environment } from '../../environments/environment.development';
import { HttpErrorResponse } from '@angular/common/http';


@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUri}/users`;

  // Method to get users from the API
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  updateUser(id: string, payload: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}`, payload).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  // Error handling method
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let message = 'An unknown error occurred';

    if (error.status === 404) {
      message = 'User not found (404)';
    } else if (error.status === 500) {
      message = 'Server error (500). Please try again later.';
    } else if (error.error instanceof ErrorEvent) {
      message = `Network error: ${error.error.message}`;
    }
    console.error('API Error:', message, error);
    return throwError(() => new Error(message));
  };
}







