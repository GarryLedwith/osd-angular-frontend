import { Component, inject } from '@angular/core';
import { EquipmentService } from '../../equipment/equipment.service';
import { Equipment } from '../../equipment/equipment.interface';
import { Observable } from 'rxjs';
import { AsyncPipe} from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './equipment-list.html',
  styleUrls: ['./equipment-list.scss']
})
export class EquipmentList {
  private equipmentService = inject(EquipmentService);

  equipment$!: Observable<Equipment[]>;
  displayedColumns = ['name', 'category', 'serial', 'status', 'actions'];

  selectedCategory = '';
  selectedStatus = '';

  ngOnInit() {
    this.loadEquipment();
  }

  loadEquipment() {
    this.equipment$ = this.equipmentService.getEquipmentList(
      this.selectedCategory || undefined,
      this.selectedStatus || undefined
    );
  }

  deleteEquipment(id: string | undefined) {
    if (!id) return;
    if (!confirm('Delete this equipment?')) return;

    this.equipmentService.deleteEquipment(id).subscribe({
      next: () => this.loadEquipment(),
      error: err => console.error('Delete failed', err)
    });
  }
}

