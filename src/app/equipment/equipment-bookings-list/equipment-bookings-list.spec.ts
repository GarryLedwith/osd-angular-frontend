import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentBookinsList } from './equipment-bookings-list';

describe('EquipmentBookinsList', () => {
  let component: EquipmentBookinsList;
  let fixture: ComponentFixture<EquipmentBookinsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentBookinsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipmentBookinsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
