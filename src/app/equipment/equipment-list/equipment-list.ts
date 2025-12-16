import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Router, RouterModule } from '@angular/router';


import { Equipment } from '../equipment.interface';
import { EquipmentService } from '../equipment.service';

/**
 * Equipment List Component
 *
 * Shows all equipment in a table with filtering by category,
 * status, and search. Users can view, edit, delete equipment
 * or view its bookings.
 */
@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './equipment-list.html',
  styleUrl: './equipment-list.scss'
})
export class EquipmentList implements OnInit {
  // ========== Component State ==========
  equipment: Equipment[] = [];  // List of equipment from API
  loading = false;              // Show spinner while loading
  cols: string[] = ['name', 'category', 'status', 'location', 'actions'];  // Table columns
  filterForm: FormGroup;        // Form for category, status, search filters

  // ========== Services ==========
  private fb = new FormBuilder();               // Build the filter form
  private equipmentService = inject(EquipmentService);  // Make API calls
  private router = inject(Router);              // Navigate to other pages
  private snackBar = inject(MatSnackBar);       // Show notifications

  /**
   * Set up filter form with automatic reload
   */
  constructor() {
    this.filterForm = this.fb.group({
      category: [''],
      status: ['']
    });

    // Reload list whenever user changes a filter
    this.filterForm.valueChanges.subscribe(values => {
      this.loadEquipment(values);
    });
  }

  /**
   * Load equipment when page opens
   */
  ngOnInit(): void {
    this.loadEquipment();
  }

  /**
   * Get equipment from API with filters
   */
  loadEquipment(filters?: { category?: string; status?: string}): void {
    this.loading = true;

    this.equipmentService.getEquipmentList(filters).subscribe({
      next: (data) => {
        this.equipment = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load equipment:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Clear all filters and reload list
   */
  
  onRefresh(): void {
    this.filterForm.reset();
    this.loadEquipment();
  }

  /**
   * Go to equipment edit page
   */
  onEdit(item: Equipment): void {
    this.router.navigate(['/equipment', item._id, 'edit']);
  }

  /**
   * Delete equipment with confirmation
   *
   * Shows "Are you sure?" dialog, then deletes if user confirms.
   * Shows success/error message and reloads list.
   */
  onDelete(item: Equipment): void {
    // Ask user to confirm
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.equipmentService.deleteEquipment(item._id).subscribe({
        next: () => {
          // Show success message
          this.snackBar.open('Equipment deleted successfully', 'OK', {
            duration: 3000
          });
          this.loadEquipment(this.filterForm.value);
        },
        error: (err) => {
          // Show error message
          console.error('Failed to delete equipment:', err);
          this.snackBar.open('Failed to delete equipment. Please try again.', 'Close', {
            duration: 4000
          });
        }
      });
    }
  }

  /**
   * Go to equipment bookings page
   */
  onSelect(item: Equipment): void {
    this.router.navigate(['/equipment', item._id, 'bookings']);
  }
}
