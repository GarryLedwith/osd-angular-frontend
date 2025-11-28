
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

/**
 * Equipment Booking Form Component
 *
 * Simple form for users to request equipment bookings.
 * User picks start and end dates, form validates the dates are correct,
 * then sends the request to the parent component.
 */
@Component({
  selector: 'app-equipment-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './equipment-booking-form.html',
  styleUrl: './equipment-booking-form.scss'
})
export class EquipmentBookingForm {
  // ========== Inputs/Outputs ==========
  @Input() equipmentId!: string;          // Equipment ID (from parent)
  @Input() equipmentName: string | null = null;  // Equipment name (for display)
  @Output() createBooking = new EventEmitter<{ startDate: Date; endDate: Date }>();  // Send booking to parent

  // ========== Services ==========
  private fb = new FormBuilder();  // Build the form

  // Form with start and end dates
  form = this.fb.group({
    startDate: [null, Validators.required],
    endDate: [null, Validators.required]
  });

  /**
   * Submit booking request
   *
   * Validates dates and sends booking to parent component.
   */
  onSubmit(): void {
    // Check required fields are filled
    if (this.form.invalid) return;

    const { startDate, endDate } = this.form.value;

    // Make sure end date isn't before start date
    if (startDate && endDate && endDate < startDate) {
      this.form.controls.endDate.setErrors({ range: true });
      return;
    }

    // Send booking to parent
    this.createBooking.emit({
      startDate: startDate!,
      endDate: endDate!
    });
  }
}
