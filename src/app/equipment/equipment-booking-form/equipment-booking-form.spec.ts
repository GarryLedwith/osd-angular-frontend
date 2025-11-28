import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentBookingForm } from './equipment-booking-form';

describe('EquipmentBookingForm', () => {
  let component: EquipmentBookingForm;
  let fixture: ComponentFixture<EquipmentBookingForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentBookingForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipmentBookingForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
