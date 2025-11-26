import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { User, UserRole } from '../../users/user.interface';
import { UserService } from '../../users/user.service';

/**
 * User Form Component
 *
 * Form to create or edit a user. Works in two modes:
 * 1. Standalone page (navigates when done)
 * 2. Child component (emits events to parent)
 */
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './users-form.html',
  styleUrl: './users-form.scss'
})
export class UserForm implements OnChanges, OnInit {
  // ========== Inputs/Outputs ==========
  @Input() editingUser: User | null = null;  // User to edit (from parent)
  @Output() save = new EventEmitter<{ mode: 'create' | 'update'; user: User }>();  // Send saved user to parent
  @Output() cancel = new EventEmitter<void>();  // Tell parent user cancelled

  // ========== Services ==========
  private router = inject(Router);              // Navigate between pages
  private route = inject(ActivatedRoute);       // Get user ID from URL
  private userService = inject(UserService);    // Make API calls
  private snackBar = inject(MatSnackBar);       // Show notifications
  private fb = new FormBuilder();               // Build the form

  // ========== Component State ==========
  private isRouteComponent = false;  // Is this a standalone page or child component?
  private userId: string | null = null;  // User ID when editing

  // Form with validation rules
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    role: ['student' as UserRole, Validators.required],
    dob: ['']
  });

  /**
   * Check if we're creating or editing a user
   *
   * If URL has user ID, load that user into the form.
   * If no ID, show empty form for creating new user.
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        // Edit mode - load existing user
        this.userId = id;
        this.isRouteComponent = true;

        this.userService.getUserById(id).subscribe({
          next: (user) => {
            this.editingUser = user;
            this.populateForm(user);
          },
          error: (err) => {
            console.error('Failed to load user:', err);
            alert('Failed to load user');
          }
        });
      } else {
        // Create mode - empty form
        this.isRouteComponent = true;
      }
    });
  }

  /**
   * React to changes from parent (child mode only)
   *
   * When parent gives child a user to edit, fill the form.
   * When parent clears the user, reset the form.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingUser']) {
      const user = this.editingUser;
      if (user) {
        this.populateForm(user);
      } else {
        this.onReset();
      }
    }
  }

  /**
   * Fill form with user data
   */
  private populateForm(user: User): void {
    this.form.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role ?? 'student',
      dob: user.dob ? this.toDateInputValue(user.dob) : ''
    });
  }

  /**
   * Save the form
   *
   * Standalone mode: Saves to API and navigates back to list.
   * Child mode: Sends user data to parent component.
   */
  onSubmit(): void {
    if (this.form.invalid) return;

    const raw = this.form.value;

    // Build user object from form
    const user: User = {
      _id: this.editingUser ? this.editingUser._id : '',
      name: raw.name ?? '',
      email: raw.email ?? '',
      phone: raw.phone ?? '',
      role: (raw.role as UserRole) ?? 'student',
      dob: raw.dob ? new Date(raw.dob) : undefined
    };

    const mode: 'create' | 'update' = this.editingUser ? 'update' : 'create';

    if (this.isRouteComponent) {
      // Standalone mode - save to API
      if (mode === 'create') {
        this.createUser(user);
      } else {
        this.updateUser(user);
      }
    } else {
      // Child mode - send to parent
      this.save.emit({ mode, user });
    }
  }

  /**
   * Create new user in API
   */
  private createUser(user: User): void {
    const payload = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      dob: user.dob
    };

    this.userService.createUser(payload).subscribe({
      next: (created) => {
        console.log('User created successfully:', created);

        // Show success message
        this.snackBar.open('User created successfully!', 'OK', {
          duration: 3000
        });

        // waits a moment to let user see the message, then returns to list
        setTimeout(() => {
          this.router.navigate(['/users']);
        }, 300);
      },
      error: (err) => {
        console.error('Failed to create user:', err);
        const errorMessage = this.extractErrorMessage(err);

        // Show error message
        this.snackBar.open(`Failed to create user: ${errorMessage}`, 'Close', {
          duration: 5000
        });
      }
    });
  }

  /**
   * Update existing user in API
   */
  private updateUser(user: User): void {
    if (!this.userId) return;

    const payload = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      dob: user.dob
    };

    this.userService.updateUser(this.userId, payload).subscribe({
      next: (updated) => {
        console.log('User updated successfully:', updated);

        // Show success message
        this.snackBar.open('User updated successfully!', 'OK', {
          duration: 3000
        });

        // Wait a moment to let user see the message, then return to list
        setTimeout(() => {
          this.router.navigate(['/users']);
        }, 300);
      },
      error: (err) => {
        console.error('Failed to update user:', err);
        const errorMessage = this.extractErrorMessage(err);

        // Show error message
        this.snackBar.open(`Failed to update user: ${errorMessage}`, 'Close', {
          duration: 5000
        });
      }
    });
  }

  /**
   * Clear the form
   */
  onReset(): void {
    this.form.reset({
      name: '',
      email: '',
      phone: '',
      role: 'student',
      dob: ''
    });
  }

  /**
   * Handle cancel button
   *
   * Standalone mode: Go back to users list.
   * Child mode: Tell parent user cancelled.
   */
  onCancel(): void {
    if (this.isRouteComponent) {
      this.router.navigate(['/users']);
    } else {
      this.cancel.emit();
    }
  }

  /**
   * Convert date to YYYY-MM-DD format for HTML date input
   */
  private toDateInputValue(d: any): string {
    const date = d instanceof Date ? d : new Date(d);
    return date.toISOString().substring(0, 10);
  }

  /**
   * Extract readable error message from API response
   *
   * The backend can return errors in different formats.
   * This method checks all possible formats and returns
   * a user-friendly message.
   */
  private extractErrorMessage(err: any): string {
    console.log('Error object:', err);
    console.log('Error.error:', err.error);

    if (err.error) {
      // Validation errors with array of messages
      if (err.error.errors && Array.isArray(err.error.errors)) {
        const errorMessages = err.error.errors
          .map((e: any) => e.message)
          .filter((msg: string) => msg)
          .join('\n• ');

        if (errorMessages) {
          const mainMessage = err.error.message || 'Validation failed';
          return `${mainMessage}:\n• ${errorMessages}`;
        }
      }

      // Simple error with message field
      if (err.error.message) {
        return err.error.message;
      }

      // Error is just a string
      if (typeof err.error === 'string') {
        return err.error;
      }
    }

    // HTTP error with status code
    if (err.status && err.statusText) {
      return `${err.status} ${err.statusText}`;
    }

    // Standard Error object
    if (err.message) {
      return err.message;
    }

    // Unknown error
    return 'An unexpected error occurred. Please try again.';
  }
}

