import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { EquipmentService } from '../../equipment/equipment.service';
import { UserService } from '../../users/user.service';
import { Equipment } from '../../equipment/equipment.interface';
import { User } from '../../users/user.interface';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    RouterLink,
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  private equipmentService = inject(EquipmentService);
  private userService = inject(UserService);

  // -- State signals 
  equipmentList = signal<Equipment[]>([]);
  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // --Computed stats 
  totalEquipment = computed(() => this.equipmentList().length);
  totalUsers     = computed(() => this.users().length);

  totalBookings = computed(() =>
    this.equipmentList().reduce((sum, e) => sum + (e.bookings?.length ?? 0), 0)
  );

  pendingBookings = computed(() =>
    this.equipmentList().reduce(
      (sum, e) => sum + (e.bookings?.filter(b => b.status === 'pending').length ?? 0), 0
    )
  );

  availableCount    = computed(() => this.equipmentList().filter(e => e.status === 'available').length);
  unavailableCount  = computed(() => this.equipmentList().filter(e => e.status === 'unavailable').length);
  maintenanceCount  = computed(() => this.equipmentList().filter(e => e.status === 'maintenance').length);

  categoryBreakdown = computed(() => {
    const counts: Record<string, number> = {};
    this.equipmentList().forEach(e => {
      counts[e.category] = (counts[e.category] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  });

  categoryColumns = ['category', 'count'];

  // -- Lifecycle hooks
  ngOnInit(): void {
    forkJoin({
      equipment: this.equipmentService.getEquipmentList(),
      users: this.userService.getUsers(),
    }).subscribe({
      next: ({ equipment, users }) => {
        this.equipmentList.set(equipment);
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load dashboard data. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
