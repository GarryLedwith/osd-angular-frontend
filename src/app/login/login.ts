import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthCustomService } from '../auth/auth-custom.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

/**
 * Login Component
 * Handles user authentication through email and password
 * Redirects to home page on successful login
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {

  loginForm: FormGroup;

  // Inject required services
  private fb = inject(FormBuilder);
  private authService = inject(AuthCustomService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor() {
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Email required and must be valid format
      password: ['', [Validators.required, Validators.minLength(6)]], // Password required, minimum 6 characters
    });
  }

  /**
   * Handle form submission
   * Calls authentication service to login user
   */
  onSubmit(): void {

    if (this.loginForm.invalid) return;

    // Get form values and attempt login
    const values = this.loginForm.value;
    this.authService.login(values.email, values.password).subscribe({
      next: () => {
        // On success, redirect to home page
        this.router.navigateByUrl('/');
      },
      error: () => {
        // On error, show error message to user
        this.openErrorSnackBar('Incorrect email or password');
      }
    });
  }

  /**
   * Getter for email form control
   * Used in template for validation messages
   */
  get email() {
    return this.loginForm.get('email');
  }

  /**
   * Getter for password form control
   * Used in template for validation messages
   */
  get password() {
    return this.loginForm.get('password');
  }

  /**
   * Display error message using Material snackbar
   * Shows for 15 seconds with dismiss button
   */
  openErrorSnackBar(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 15000,
      panelClass: ['error-snackbar'],
    });
  }
}

