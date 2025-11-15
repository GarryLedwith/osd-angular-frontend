import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EquipmentService } from '../../equipment/equipment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Equipment } from '../../equipment/equipment.interface';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-equipment-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './equipment-form.html',
  styleUrls: ['./equipment-form.scss']
})
export class EquipmentForm {
  private fb = inject(FormBuilder);
  private equipmentService = inject(EquipmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = false;
  equipmentId: string | null = null;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    category: ['', Validators.required],
    serial: ['', [Validators.required, Validators.minLength(1)]],
    condition: ['Good', Validators.required],
    location: ['', Validators.required]
  });

  get name() {
    return this.form.get('name');
  }
  get serial() {
    return this.form.get('serial');
  }
  get category() {
    return this.form.get('category');
  }
  get location() {
    return this.form.get('location');
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.equipmentId = id;
        this.loadEquipment(id);
      }
    });
  }

  loadEquipment(id: string) {
    this.equipmentService.getEquipmentById(id).subscribe({
      next: (equip: Equipment) => {
        this.form.patchValue({
          name: equip.name,
          category: equip.category,
          serial: equip.serial,
          condition: equip.condition,
          location: equip.location
        });
      },
      error: err => console.error('Failed to load equipment', err)
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

  }
}