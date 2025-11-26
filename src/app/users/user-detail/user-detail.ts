
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { UserService } from '../user.service';
import { User } from '../user.interface';

/**
 * User Detail Component
 *
 * Shows all information about a single user:
 * - Name, email, phone, role, date of birth
 * - Account creation date
 * - Edit and delete buttons
 */

@Component({
  selector: 'app-user-detail',
  standalone: true, 
  imports: [
    DatePipe,
    TitleCasePipe,
    MatSnackBarModule,     
    MatCardModule,         
    MatButtonModule,       
    MatIconModule          
  ],
  templateUrl: './user-detail.html',
  styleUrls: ['./user-detail.scss']
})
export class UserDetail implements OnInit {
  // ========== Services ==========
  private route = inject(ActivatedRoute);       // Get user ID from URL
  private router = inject(Router);              // Navigate to other pages
  private userService = inject(UserService);    // Make API calls
  private snackBar = inject(MatSnackBar);       // Show notifications
  private cdr = inject(ChangeDetectorRef);      // Force UI updates

  // ========== Component State ==========
  user: User | null = null;  // User details from API
  loading = false;           // Show spinner while loading
  

  /**
   * Load user when page opens
   *
   * Gets user ID from URL, fetches user data from API,
   * displays it on the page.
   */
  ngOnInit(): void {
    // Get user ID from URL (like /users/123)
    const id = this.route.snapshot.paramMap.get('id');

    // If no ID, go back to list
    if (!id) {
      this.snackBar.open('No user ID provided', 'Close', { duration: 3000 });
      this.router.navigate(['/users']);
      return;
    }

    this.loading = true;

    // Fetch user from API
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        // Store user and stop loading spinner
        this.user = user;
        this.loading = false;

        // Force Angular to update the UI
        this.cdr.detectChanges();
        console.log('Change detection triggered');

        // Debug logging
        console.log('User loaded:', user);
        console.log('User role:', user.role);
        console.log('User name:', user.name);
      },
      error: (err) => {
        // Stop loading and show error
        this.loading = false;
        console.error('API Error:', err);

        // Show error notification
        this.snackBar.open(`Error loading user: ${err.message}`, 'Close', {
          duration: 4000
        });

        // Go back to users list
        this.router.navigate(['/users']);
      }
    });
  }

  /**
   * Go to user edit page
   */
  onEdit(): void {
    if (!this.user?._id) return;
    this.router.navigate(['/users', this.user._id, 'edit']);
  }

  /**
   * Delete user with confirmation
   *
   * Shows "Are you sure?" dialog, then deletes if user confirms.
   * Shows success/error message and goes back to list.
   */
  onDelete(): void {
    if (!this.user?._id) return;

    // Ask user to confirm
    if (confirm(`Are you sure you want to delete "${this.user.name}"?`)) {
      this.userService.deleteUser(this.user._id).subscribe({
        next: () => {
          // Show success message
          this.snackBar.open('User deleted successfully', 'OK', {
            duration: 3000
          });

          // Wait a moment so user sees the message, then go back
          setTimeout(() => {
            this.router.navigate(['/users']);
          }, 300);
        },
        error: (err) => {
          // Show error message
          console.error('Failed to delete user:', err);
          this.snackBar.open(`Failed to delete user: ${err.message}`, 'Close', {
            duration: 4000
          });
        }
      });
    }
  }

  /**
   * Go back to users list
   */
  onBack(): void {
    this.router.navigate(['/users']);
  }
}
