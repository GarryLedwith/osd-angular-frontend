export type UserRole = 'student' | 'staff' | 'admin';

export interface User {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  dob?: Date;
  role?: UserRole;
  dateJoined?: Date;
  lastUpdated?: Date;
}

