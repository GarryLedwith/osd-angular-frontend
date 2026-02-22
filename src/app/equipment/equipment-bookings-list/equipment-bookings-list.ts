import { Component, OnInit, inject, signal, computed } from '@angular/core';
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

  // ========== Signal-based State ==========
  // Signal holding all active bookings fetched from the API
  allBookings = signal<BookingWithEquipment[]>([]);

  // Scalar signal for the currently selected status filter ('' means show all)
  selectedStatus = signal<BookingStatus | ''>('');

  // Scalar signal for the loading spinner
  loading = signal(false);

  // Computed signal: automatically re-derives the filtered list whenever
  // allBookings or selectedStatus changes — no manual applyFilter() needed
  filteredBookings = computed(() => {
    const status = this.selectedStatus();
    return status === ''
      ? this.allBookings()
      : this.allBookings().filter(b => b.status === status);
  });

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
    this.loading.set(true);

    this.equipmentService.getEquipmentList().subscribe({
      next: (equipmentList: Equipment[]) => {
        // Build the combined bookings array
        const combined: BookingWithEquipment[] = [];

        equipmentList.forEach(equipment => {
          if (equipment.bookings && equipment.bookings.length > 0) {
            // Add equipment info to each booking
            equipment.bookings.forEach(booking => {
              combined.push({
                ...booking,
                equipmentId: equipment._id,
                equipmentName: equipment.name,
                equipmentCategory: equipment.category
              });
            });
          }
        });

        // Keep only active bookings (exclude denied and returned)
        const active = combined.filter(
          booking => booking.status !== 'denied' && booking.status !== 'returned'
        );

        // Sort by creation date (newest first)
        active.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        // Update the signal filteredBookings computed will react automatically
        this.allBookings.set(active);
        this.loading.set(false);

        console.log('All active bookings loaded:', this.allBookings());
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Error loading bookings:', err);
        this.snackBar.open(`Failed to load bookings: ${err.message}`, 'Close', {
          duration: 4000
        });
      }
    });
  }

  /**
   * Update the status filter signal filteredBookings computed reacts automatically
   */
  onStatusFilterChange(status: BookingStatus | ''): void {
    this.selectedStatus.set(status);
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
