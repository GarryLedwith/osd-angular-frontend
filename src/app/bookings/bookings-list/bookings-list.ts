import { Component, inject } from '@angular/core';
import { EquipmentService } from '../../equipment/equipment.service';
import { Booking } from '../../bookings/booking.interface';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe} from '@angular/common';
import { Observable } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-bookings-list',
  standalone: true,
  imports: [AsyncPipe, MatTableModule, MatButtonModule],
  templateUrl: './bookings-list.html',
  styleUrls: ['./bookings-list.scss']
})
export class BookingsList {
  private equipmentService = inject(EquipmentService);
  private route = inject(ActivatedRoute);

  bookings$!: Observable<Booking[]>;
  equipmentId!: string;

  displayedColumns = ['userId', 'startDate', 'endDate', 'status', 'actions'];

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) return;
      this.equipmentId = id;
      this.loadBookings();
    });
  }

  loadBookings() {
    this.bookings$ = this.equipmentService.getBookings(this.equipmentId);
  }

  doAction(bookingId: string, action: 'approve' | 'deny' | 'check-out' | 'check-in') {
    this.equipmentService.transitionBooking(this.equipmentId, bookingId, action)
      .subscribe({
        next: () => this.loadBookings(),
        error: err => console.error('Booking transition failed', err)
      });
  }
}

