   
export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'denied'
  | 'checked_out'
  | 'returned';

export interface Booking {
  bookingId: string;
  userId: string; // user._id
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

