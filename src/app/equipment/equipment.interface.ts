export type EquipmentStatus =
  | 'available'
  | 'unavailable'
  | 'maintenance';

export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'denied'
  | 'checked_out'
  | 'returned';


  // Equipment interface
  export interface Equipment {
  _id: string;
  name: string;
  category: string;           
  description?: string;
  status: EquipmentStatus;
  location?: string;
  model?: string;
  createdAt?: Date;
  updatedAt?: Date;

  bookings?: Booking[];         
}
// Booking interface (nested within Equipment)
export interface Booking {
  _id?: string;
  userId: string;             
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  createdAt?: Date;
  updatedAt?: Date;
}






