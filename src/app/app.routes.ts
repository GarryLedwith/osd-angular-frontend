import { Routes } from '@angular/router';

// Importing components for the routes
import { Home } from './home/home';
import { EquipmentList } from './equipment/equipment-list/equipment-list';
import { EquipmentForm } from './equipment/equipment-form/equipment-form';
import { UsersList } from './users/users-list/users-list';
import { UserForm } from './users/users-form/users-form';
import { UserDetail } from './users/user-detail/user-detail';
import { EquipmentDetailStudent } from './equipment/equipment-detail-student/equipment-detail-student';
import { EquipmentBookinsList } from './equipment/equipment-bookings-list/equipment-bookings-list';

// Application routes
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', redirectTo: '', pathMatch: 'full' },

  // User routes
  { path: 'users', component: UsersList }, // List all users
  { path: 'users/new', component: UserForm }, // Create new user
  { path: 'users/:id', component: UserDetail }, // User detail view by ID
  { path: 'users/:id/edit', component: UserForm }, // Edit user by ID
  

  // Equipment routes
  { path: 'equipment', component: EquipmentList }, // List all equipment
  { path: 'equipment/new', component: EquipmentForm }, // Create new equipment item
  { path: 'equipment/:id/edit', component: EquipmentForm }, // Edit equipment by ID
  { path: 'equipment/:id/bookings', component: EquipmentDetailStudent }, // Equipment detail view for students
  { path: 'equipment/bookings', component: EquipmentBookinsList }, // List all equipment bookings

  // Fallback route
  { path: '**', redirectTo: '' }
];

