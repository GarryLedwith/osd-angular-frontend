import { Routes } from '@angular/router';

// Importing components for the routes
import { Home } from './home/home';
import { EquipmentList } from './equipment/equipment-list/equipment-list';
import { EquipmentForm } from './equipment/equipment-form/equipment-form';
import { UsersList } from './users/users-list/users-list';
import { BookingsList } from './bookings/bookings-list/bookings-list';

// Defining the application routes
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', redirectTo: '', pathMatch: 'full' },

  { path: 'equipment', component: EquipmentList },
  { path: 'equipment/new', component: EquipmentForm },
  { path: 'equipment/:id/edit', component: EquipmentForm },
  { path: 'equipment/:id/bookings', component: BookingsList },

  { path: 'users', component: UsersList },

  { path: '**', redirectTo: '' } // fallback
];

