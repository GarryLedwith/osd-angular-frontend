import { Component, EventEmitter, Input, model, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
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

import { Equipment, EquipmentStatus } from '../equipment.interface';
import { EquipmentService } from '../equipment.service';

/**
 * Equipment Form Component
 *
 * Form to create or edit equipment. Works in two modes:
 * 1. Standalone page (navigates when done)
 * 2. Child component (emits events to parent)
 */
@Component({
  selector: 'app-equipment-form',
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
  templateUrl: './equipment-form.html',
  styleUrl: './equipment-form.scss'
})
export class EquipmentForm implements OnChanges, OnInit {
  // ========== Inputs/Outputs ==========
  @Input() editingEquipment: Equipment | null = null;  // Equipment to edit (from parent)
  @Output() save = new EventEmitter<{ mode: 'create' | 'update'; equipment: Equipment }>();  // Send saved equipment to parent
  @Output() cancel = new EventEmitter<void>();  // Tell parent user cancelled

  // ========== Services ==========
  private router = inject(Router);                  // Navigate between pages
  private route = inject(ActivatedRoute);           // Get equipment ID from URL
  private equipmentService = inject(EquipmentService);  // Make API calls
  private snackBar = inject(MatSnackBar);           // Show notifications
  private fb = new FormBuilder();                   // Build the form

  // ========== Component State ==========
  private isRouteComponent = false;  // Is this a standalone page or child component?
  private equipmentId: string | null = null;  // Equipment ID when editing

  // Form with validation rules
  form = this.fb.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    description: [''],
    status: ['available' as EquipmentStatus, Validators.required],
    location: [''],
    model: ['']
  });

  /**
   * Check if we're creating or editing equipment
   *
   * If URL has equipment ID, load that equipment into the form.
   * If no ID, show empty form for creating new equipment.
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        // Edit mode - load existing equipment
        this.equipmentId = id;
        this.isRouteComponent = true;
        this.equipmentService.getEquipmentById(id).subscribe({
          next: (equipment) => {
            this.editingEquipment = equipment;
            this.populateForm(equipment);
          },
          error: (err) => {
            console.error('Failed to load equipment:', err);
            this.snackBar.open('Failed to load equipment', 'Close', {
              duration: 4000
            });
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
   * When parent gives us equipment to edit, fill the form.
   * When parent clears the equipment, reset the form.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingEquipment']) {
      const eq = this.editingEquipment;
      if (eq) {
        this.populateForm(eq);
      } else {
        this.onReset();
      }
    }
  }

  /**
   * Fill form with equipment data
   */
  private populateForm(equipment: Equipment): void {
    this.form.patchValue({
      name: equipment.name,
      category: equipment.category,
      description: equipment.description ?? '',
      status: equipment.status,
      location: equipment.location ?? '',
      model: equipment.model ?? ''
    });
  }

  /**
   * Save the form
   *
   * Standalone mode: Saves to API and navigates back to list.
   * Child mode: Sends equipment data to parent component.
   */
  onSubmit(): void {
    if (this.form.invalid) return;

    const raw = this.form.value;

    // Build equipment object from form
    const equipment: Equipment = {
      _id: this.editingEquipment ? this.editingEquipment._id : '',
      name: raw.name ?? '',
      category: raw.category ?? '',
      description: raw.description ?? '',
      status: (raw.status as EquipmentStatus) ?? 'available',
      location: raw.location ?? '',
      model: raw.model ?? ''
    };

    const mode: 'create' | 'update' = this.editingEquipment ? 'update' : 'create';

    if (this.isRouteComponent) {
      // Standalone mode - save to API
      if (mode === 'create') {
        this.createEquipment(equipment);
      } else {
        this.updateEquipment(equipment);
      }
    } else {
      // Child mode - send to parent
      this.save.emit({ mode, equipment });
    }
  }

  /**
   * Create new equipment in API
   */
  private createEquipment(equipment: Equipment): void {
    const payload = {
      name: equipment.name,
      category: equipment.category,
      description: equipment.description,
      status: equipment.status,
      location: equipment.location,
      model: equipment.model
    };

    this.equipmentService.createEquipment(payload).subscribe({
      next: (created) => {
        console.log('Equipment created successfully:', created);

        // Show success message
        this.snackBar.open('Equipment created successfully!', 'OK', {
          duration: 3000
        });
        this.router.navigate(['/equipment']);
      },
      error: (err) => {
        console.error('Failed to create equipment:', err);

        // Show error message
        this.snackBar.open(`Failed to create equipment: ${err.message}`, 'Close', {
          duration: 4000
        });
      }
    });
  }

  /**
   * Update existing equipment in API
   */
  private updateEquipment(equipment: Equipment): void {
    if (!this.equipmentId) return;

    const payload = {
      name: equipment.name,
      category: equipment.category,
      description: equipment.description,
      status: equipment.status,
      location: equipment.location,
      model: equipment.model
    };

    this.equipmentService.patchEquipment(this.equipmentId, payload).subscribe({
      next: (updated) => {
        console.log('Equipment updated successfully:', updated);

        // Show success message
        this.snackBar.open('Equipment updated successfully!', 'OK', {
          duration: 3000
        });
        this.router.navigate(['/equipment']);
      },
      error: (err) => {
        console.error('Failed to update equipment:', err);

        // Show error message
        this.snackBar.open(`Failed to update equipment: ${err.message}`, 'Close', {
          duration: 4000
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
      category: '',
      description: '',
      status: 'available',
      location: '',
      model: ''
    });
  }
}
