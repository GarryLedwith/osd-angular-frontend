export type EquipmentCondition = 'New' | 'Good' | 'Fair' | 'Poor';
export type EquipmentStatus = 'available' | 'reserved' | 'out';

export interface Equipment {
  _id?: string | null;
  name: string | null;
  category: string | null;
  serial: string | null;
  condition: EquipmentCondition | null;
  status: EquipmentStatus | null;
  location: string | null;
  //bookings: Booking[];
  createdAt?: Date | null;
  updatedAt?: Date | null;
}



