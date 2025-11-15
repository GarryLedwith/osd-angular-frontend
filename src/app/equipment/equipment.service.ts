import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Equipment } from '../equipment/equipment.interface';
import { Booking, BookingStatus } from '../bookings/booking.interface';
import { environment } from '../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class EquipmentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUri}/equipment`;

  getEquipmentList(
    category?: string,
    status?: string,
    q?: string
  ): Observable<Equipment[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (status) params = params.set('status', status);
    if (q) params = params.set('q', q);

    return this.http.get<Equipment[]>(this.baseUrl, { params }).pipe(
      catchError(err => {
        console.error('Error loading equipment', err);
        return throwError(() => err);
      })
    );
  }

  getEquipmentById(id: string): Observable<Equipment> {
    return this.http.get<Equipment>(`${this.baseUrl}/${id}`);
  }

  createEquipment(payload: Partial<Equipment>): Observable<Equipment> {
    return this.http.post<Equipment>(this.baseUrl, payload);
  }

  updateEquipment(id: string, payload: Partial<Equipment>): Observable<Equipment> {
    return this.http.patch<Equipment>(`${this.baseUrl}/${id}`, payload);
  }

  deleteEquipment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // --- bookings ---
  createBooking(equipmentId: string, payload: Partial<Booking>): Observable<Equipment> {
    return this.http.post<Equipment>(
      `${this.baseUrl}/${equipmentId}/bookings`,
      payload
    );
  }

  getBookings(
    equipmentId: string,
    status?: BookingStatus
  ): Observable<Booking[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Booking[]>(
      `${this.baseUrl}/${equipmentId}/bookings`,
      { params }
    );
  }

  transitionBooking(
    equipmentId: string,
    bookingId: string,
    action:
      | 'approve'
      | 'deny'
      | 'check-out'
      | 'check-in'
  ): Observable<Equipment> {
    return this.http.patch<Equipment>(
      `${this.baseUrl}/${equipmentId}/bookings/${bookingId}/${action}`,
      {}
    );
  }
}

