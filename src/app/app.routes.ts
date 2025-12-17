import { Routes } from '@angular/router';

// Importing components for the routes
import { Home } from './home/home';
import { EquipmentList } from './equipment/equipment-list/equipment-list';
import { EquipmentForm } from './equipment/equipment-form/equipment-form';
import { UsersList } from './users/users-list/users-list';
import { UserForm } from './users/users-form/users-form';
import { UserDetail } from './users/user-detail/user-detail';
import { EquipmentBookingDetail } from './equipment/equipment-booking-detail/equipment-booking-detail';
import { EquipmentBookinsList } from './equipment/equipment-bookings-list/equipment-bookings-list';
import { LoginComponent } from './login/login';
import { authGuard } from './auth/auth-guard';
import { adminGuard } from './auth/auth-guard';


// Application routes
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', redirectTo: '', pathMatch: 'full' },

  // Login route
  { path: 'login', component: LoginComponent },

  

  // User routes
  { path: 'users', component: UsersList, canActivate: [authGuard, adminGuard] }, // List all users (admin only)
  { path: 'users/new', component: UserForm, canActivate: [authGuard, adminGuard] }, // Create new user (admin only)
  { path: 'users/:id', component: UserDetail, canActivate: [authGuard] }, // User detail view by ID
  { path: 'users/:id/edit', component: UserForm, canActivate: [authGuard, adminGuard] }, // Edit user by ID (admin only)

  // Equipment routes
  { path: 'equipment', component: EquipmentList}, // List all equipment
  { path: 'equipment/new', component: EquipmentForm, canActivate: [authGuard, adminGuard] }, // Create new equipment item (admin only)
  { path: 'equipment/:id/edit', component: EquipmentForm, canActivate: [authGuard, adminGuard] }, // Edit equipment by ID (admin only)
  { path: 'equipment/:id/bookings', component: EquipmentBookingDetail, canActivate: [authGuard] }, // Equipment detail view for students
  { path: 'equipment/bookings', component: EquipmentBookinsList, canActivate: [authGuard] }, // List all equipment bookings

  // Fallback route
  { path: '**', redirectTo: '' }
];

