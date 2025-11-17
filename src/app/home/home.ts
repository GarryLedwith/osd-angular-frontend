import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Home Component
 *
 * Landing page for the ATU Lab Equipment Loaner application.
 * Provides an overview of the system and quick navigation to main features.
 *
 * Features:
 * - Hero section with application title and description
 * - Feature cards highlighting key capabilities
 * - Statistics display (placeholder for future implementation)
 * - Modern, responsive Material Design layout
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,       
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  /**
   * Feature cards data
   * Defines the key features displayed on the homepage
   */
  features = [
    {
      icon: 'devices',
      title: 'Browse Equipment',
      description: 'Explore our catalog of lab equipment including laptops, cameras, Arduino boards, and more.',
      link: '/equipment',
      color: 'primary'
    },
    {
      icon: 'people',
      title: 'Manage Users',
      description: 'Administer user accounts, assign roles, and manage permissions for students and staff.',
      link: '/users',
      color: 'primary'
    },
    {
      icon: 'inventory',
      title: 'Create Equipment Items',
      description: 'Create new equipment entries in the system.',
      link: '/equipment/new',
      color: 'accent'
    }
  ];

  /**
   * Quick stats data (placeholder  code)
   * Hardcoded for now
   */
  stats = [
    { label: 'Total Equipment', value: '150+', icon: 'inventory_2' },
    { label: 'Active Bookings', value: '42', icon: 'pending_actions' },
    { label: 'Registered Users', value: '300+', icon: 'group' },
    { label: 'Available Items', value: '98', icon: 'check_circle' }
  ];
}
