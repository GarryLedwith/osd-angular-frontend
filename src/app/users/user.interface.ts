export type UserRole = 'student' | 'staff' | 'admin';

export interface User {
  _id?: string;
  name: string;
  email: string;
  phonenumber: string;
  dob?: Date;
  role?: UserRole;
  dateJoined?: Date;
  lastUpdated?: Date;
}

