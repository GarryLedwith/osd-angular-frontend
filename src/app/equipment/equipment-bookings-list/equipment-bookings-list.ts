import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';

import { Equipment, Booking, BookingStatus } from '../equipment.interface';
import { EquipmentService } from '../equipment.service';

/**
 * Booking interface with equipment information attached
 * this interface extends Booking to include equipmentId, name, and category
 * and will be used to display the full booking list with equipment details
 */
interface BookingWithEquipment extends Booking {
  equipmentId: string;
  equipmentName: string;
  equipmentCategory: string;
}

/**
 * Equipment Bookings List Component
 *
 * Shows all active bookings from all equipment in one table.
 * Users can filter by status and view equipment details.
 */
@Component({
  selector: 'app-equipment-bookins-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    MatSnackBarModule,
    RouterModule
  ],
  templateUrl: './equipment-bookings-list.html',
  styleUrl: './equipment-bookings-list.scss',
})
export class EquipmentBookinsList implements OnInit {
  // ========== Services ==========
  private equipmentService = inject(EquipmentService);  // Make API calls
  private snackBar = inject(MatSnackBar);               // Show notifications
  private router = inject(Router);                      // Navigate to other pages
  private cdr = inject(ChangeDetectorRef);              // Force UI updates

  // ========== Component State ==========
  allBookings: BookingWithEquipment[] = [];      // All bookings from all equipment
  filteredBookings: BookingWithEquipment[] = []; // Bookings after applying filter
  loading = false;                               // Show spinner while loading
  selectedStatus: BookingStatus | '' = '';       // Current status filter ('' = all)

  // Status options for filter dropdown
  statusOptions: BookingStatus[] = [
    'pending',
    'approved',
    'denied',
    'checked_out',
    'returned'
  ];

  // Table columns
  displayedColumns: string[] = [
    'equipmentName',
    'category',
    'userId',
    'dates',
    'status',
    'createdAt',
    'actions'
  ];

  /**
   * Load all bookings when page opens
   */
  ngOnInit(): void {
    this.loadAllBookings();
  }

  /**
   * Get all bookings from all equipment
   *
   * Fetches all equipment, extracts bookings from each item,
   * filters out inactive bookings (denied/returned),
   * and sorts by newest first.
   */
  loadAllBookings(): void {
    this.loading = true;

    this.equipmentService.getEquipmentList().subscribe({
      next: (equipmentList: Equipment[]) => {
        // Extract bookings from all equipment
        this.allBookings = [];

        equipmentList.forEach(equipment => {
          if (equipment.bookings && equipment.bookings.length > 0) {
            // Add equipment info to each booking
            equipment.bookings.forEach(booking => {
              this.allBookings.push({
                ...booking,
                equipmentId: equipment._id,
                equipmentName: equipment.name,
                equipmentCategory: equipment.category
              });
            });
          }
        });

        // Keep only active bookings (exclude denied and returned)
        this.allBookings = this.allBookings.filter(
          booking => booking.status !== 'denied' && booking.status !== 'returned'
        );

        // Sort by creation date (newest first)
        this.allBookings.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        // Apply filter
        this.applyFilter();

        this.loading = false;
        this.cdr.detectChanges();

        console.log('All active bookings loaded:', this.allBookings);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading bookings:', err);
        this.snackBar.open(`Failed to load bookings: ${err.message}`, 'Close', {
          duration: 4000
        });
      }
    });
  }

  /**
   * Filter bookings by status
   *
   * If no status selected, show all bookings.
   * Otherwise, show only bookings with selected status.
   */
  applyFilter(): void {
    if (this.selectedStatus === '') {
      this.filteredBookings = [...this.allBookings];
    } else {
      this.filteredBookings = this.allBookings.filter(
        booking => booking.status === this.selectedStatus
      );
    }
  }

  /**
   * Update filter when user selects a status
   */
  onStatusFilterChange(status: BookingStatus | ''): void {
    this.selectedStatus = status;
    this.applyFilter();
  }

  /**
   * Go to equipment detail page
   */
  viewEquipment(equipmentId: string): void {
    this.router.navigate(['/equipment', equipmentId]);
  }

  /**
   * Get CSS class for status badge styling
   */
  getStatusClass(status: BookingStatus): string {
    return `status-${status}`;
  }
}
