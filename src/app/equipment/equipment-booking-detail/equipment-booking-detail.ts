import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { timeout } from 'rxjs/operators';
import { EquipmentService } from '../equipment.service';
import { Equipment, Booking } from '../equipment.interface';
import { EquipmentBookingForm } from '../equipment-booking-form/equipment-booking-form';

/**
 * Equipment Booking Detail Component (Student View)
 *
 * This page lets students:
 * - View details about a specific piece of equipment
 * - Request bookings if the equipment is available
 * - See their booking history for this equipment
 *
 * Note: Bookings require staff approval (pending status) (that functionality is for future development)
 * because of limited time and scope of the project.
 */
@Component({
  selector: 'app-equipment-booking-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    EquipmentBookingForm
  ],
  templateUrl: './equipment-booking-detail.html',
  styleUrl: './equipment-booking-detail.scss'
})
export class EquipmentBookingDetail implements OnInit {
  // ========== Services ==========
  private route = inject(ActivatedRoute);               // Get equipment ID from URL
  private equipmentService = inject(EquipmentService);  // Make API calls
  private snackBar = inject(MatSnackBar);               // Show notifications
  private cdr = inject(ChangeDetectorRef);              // Force UI updates

  // ========== Component State ==========
  equipment: Equipment | null = null;  // Equipment details from API
  loading = false;                     // Show spinner while loading equipment
  bookings: Booking[] = [];            // List of bookings for this equipment
  bookingsLoading = false;             // Show spinner while loading bookings

  // Table columns to display
  displayedBookingColumns: string[] = ['dates', 'status', 'createdAt'];

  /**
   * Load equipment when page opens
   *
   * Gets equipment ID from URL, fetches equipment data from API,
   * then loads the bookings for that equipment
   */
  ngOnInit(): void {
    // Get equipment ID from URL (like /equipment/123)
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading = true;

  
    // Fetch equipment from API
    this.equipmentService.getEquipmentById(id)
      .pipe(timeout(10000)) // Wait max 10 seconds
      .subscribe({
        next: (eq) => {

          // Store equipment and stop loading spinner
          this.equipment = eq;
          this.loading = false;

          // Force Angular to update the UI
          this.cdr.detectChanges();
          console.log('Change detection triggered');

          // Now load the bookings
          this.loadBookings();
        },
        error: (err) => {
          // Stop loading and show error
          this.loading = false;
          console.error('=== API ERROR ===');
          console.error('Full error object:', err);
          console.error('Error message:', err.message);
          console.error('Error name:', err.name);

          // Create user-friendly error message
          let errorMessage = 'Failed to load equipment';
          if (err.name === 'TimeoutError') {
            errorMessage = 'Request timed out - server not responding';
          } else if (err.message) {
            errorMessage = err.message;
          }

          // Show error notification
          this.snackBar.open(errorMessage, 'Close', {
            duration: 4000
          });
        }
      });
  }

  
  // Handle new booking requests from the booking form
  onCreateBooking(event: { startDate: Date; endDate: Date }): void {
    if (!this.equipment?._id) return;

    // TODO: Get real user ID from authentication service
    // Hardcoded for now but can replace with: this.authService.getCurrentUserId()
    // Part 3 of assignment covers authentication
    const userId = '68f266bf45d2c479aedb96ce';

    // Send booking request to API
    this.equipmentService
      .createBooking(this.equipment._id, {
        userId: userId,
        startDate: event.startDate,
        endDate: event.endDate
      })
      .subscribe({
        next: () => {
          // Show success message
          this.snackBar.open('Booking request submitted (pending approval).', 'OK', {
            duration: 3000
          });
          // Refresh bookings list to show new request
          this.loadBookings();
        },
        error: (err) => {
          // Show error message
          this.snackBar.open(`Failed to create booking: ${err.message}`, 'Close', {
            duration: 4000
          });
        }
      });
  }

  /**
   * Load bookings for the current equipment
   *
   * Fetches all booking records from API and displays them in the table
   */
  loadBookings(): void {
    if (!this.equipment?._id) return;

    this.bookingsLoading = true;
    console.log('Loading bookings for equipment ID:', this.equipment._id);
    console.log('Current equipment data:', this.equipment);

    // Fetch bookings from API
    this.equipmentService.getBookingsForEquipment(this.equipment._id).subscribe({
      next: (data: Booking[]) => {
        // Update bookings list
        this.bookings = data;
        console.log('Bookings loaded:', data);
        console.log('Number of bookings:', data.length);
        console.log('Bookings data:', JSON.stringify(data, null, 2));
        this.bookingsLoading = false;
      },
      error: (err: { message: any; }) => {
        // Stop loading and show error
        this.bookingsLoading = false;
        this.snackBar.open(`Failed to load bookings: ${err.message}`, 'Close', {
          duration: 4000
        });
      }
    });
  }
}
