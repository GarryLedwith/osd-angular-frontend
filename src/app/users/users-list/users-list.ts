import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UserService } from '../../users/user.service';
import { User } from '../../users/user.interface';

/**
 * Users List Component
 *
 * Shows all users in a table with filtering and CRUD operations.
 *
 * Features:
 * - Filter by role (student/staff/admin)
 * - Search by name or email
 * - View, edit, or delete users
 * - Real-time filtering (updates as you type)
 */
@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.scss']
})
export class UsersList implements OnInit {
  // ========== Component State ==========
  users: User[] = [];  // List of users to display
  loading = false;     // Show spinner while loading

  // Table columns to display
  cols: string[] = ['name', 'email', 'role', 'dateJoined', 'actions'];

  // Filter form (role dropdown + search box)
  filterForm: FormGroup;

  // ========== Services ==========
  private fb = new FormBuilder();
  private userService = inject(UserService);  // Make API calls
  private router = inject(Router);            // Navigate to other pages
  private snackBar = inject(MatSnackBar);     // Show notifications

  /**
   * Set up filter form and automatic filtering
   *
   * When user types or selects a role, the list automatically updates
   */
  constructor() {
    // Create filter form with two fields
    this.filterForm = this.fb.group({
      role: [''],  // Role dropdown (empty = show all)
      q: ['']      // Search box (empty = no filter)
    });

    // Reload users whenever filter changes (real-time filtering)
    this.filterForm.valueChanges.subscribe(values => {
      this.loadUsers();
    });
  }

  /**
   * Load users when page first opens
   */
  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Load users from API and apply filters
   *
   * Gets all users from backend, then filters them based on
   * current form values (role and search query)
   */
  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        // Apply filters to the data
        this.users = this.applyClientSideFilters(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Filter users by role and search query
   *
   * @param users - All users from API
   * @returns Filtered list of users
   */
  applyClientSideFilters(users: User[]): User[] {
    const { role, q } = this.filterForm.value;
    let filtered = users;

    // Filter by role if one is selected
    if (role) {
      filtered = filtered.filter(user => user.role === role);
    }

    // Filter by search query if user typed something
    if (q && q.trim()) {
      const query = q.toLowerCase().trim();
      // Search in name and email fields
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  /**
   * Handle filter form submission
   * (Not really needed since filters update automatically)
   */
  onFilterSubmit(): void {
    this.loadUsers();
  }

  /**
   * Reset filters and reload all users
   */
  onRefresh(): void {
    this.filterForm.reset();
    this.loadUsers();
  }

  /**
   * Go to user detail page
   */
  onView(item: User): void {
    this.router.navigate(['/users', item._id]);
  }

  /**
   * Go to user edit page
   */
  onEdit(item: User): void {
    this.router.navigate(['/users', item._id, 'edit']);
  }

  /**
   * Delete user with confirmation
   *
   * Shows "Are you sure?" dialog, then deletes if user confirms.
   * Shows success/error message and reloads list.
   */
  onDelete(item: User): void {
    // Ask user to confirm
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.userService.deleteUser(item._id!).subscribe({
        next: () => {
          // Show success message
          this.snackBar.open('User deleted successfully', 'OK', {
            duration: 3000
          });
          // Refresh the list
          this.loadUsers();
        },
        error: (err) => {
          // Show error message
          console.error('Failed to delete user:', err);
          this.snackBar.open('Failed to delete user. Please try again.', 'Close', {
            duration: 4000
          });
        }
      });
    }
  }
}
