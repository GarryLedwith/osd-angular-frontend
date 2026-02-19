import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { Equipment, Booking, BookingStatus } from './equipment.interface';

/**
 * Equipment Service
 *
 * Handles all equipment and booking API calls.
 */
@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUri}/equipment`;

  // ========== Equipment Operations ==========

  /**
   * Create new equipment
   */
  createEquipment(equipment: Omit<Equipment, '_id' | 'createdAt' | 'updatedAt' | 'bookings'>):
    Observable<Equipment> {
    return this.http.post<Equipment>(this.baseUrl, equipment)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all equipment with optional filters
   */
  getEquipmentList(options?: {
    category?: string;
    status?: string;
  }): Observable<Equipment[]> {
    let params = new HttpParams();
    if (options?.category) params = params.set('category', options.category);
    if (options?.status) params = params.set('status', options.status);
  
    return this.http.get<Equipment[]>(this.baseUrl, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get single equipment by ID
   */
  getEquipmentById(id: string): Observable<Equipment> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<Equipment>(url)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update equipment fields
   */
  patchEquipment(id: string, partial: Partial<Equipment>): Observable<Equipment> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.patch<Equipment>(url, partial)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete equipment
   */
  deleteEquipment(id: string): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete(url, { responseType: 'text' })
      .pipe(
        map(() => void 0),
        catchError(this.handleError)
      );
  }

  // ========== Booking Operations ==========

  /**
   * UPDATED FOR OSD: 
   * Create booking request for equipment routed through AWS Lambda / API Gateway
   */
  createBooking(equipmentId: string, payload: {
    userId: string;
    startDate: Date;
    endDate: Date;
  }): Observable<Booking> {
    const url = `${environment.bookingLambdaUri}/equipment/${equipmentId}/bookings`;
    const body = {
      userId: payload.userId,
      startDate: payload.startDate,
      endDate: payload.endDate
    };
    return this.http.post<Booking>(url, body)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all bookings for equipment (optional status filter)
   */
  getBookingsForEquipment(
    equipmentId: string,
    status?: BookingStatus
  ): Observable<Booking[]> {
    const url = `${this.baseUrl}/${equipmentId}/bookings`;
    let params = new HttpParams();
    if (status) params = params.set('status', status);

    return this.http.get<Booking[]>(url, { params })
      .pipe(catchError(this.handleError));
  }

  // ========== Error Handling ==========

  /**
   * Handle HTTP errors and return readable messages
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
    return throwError(() => new Error(msg));
  }
}
