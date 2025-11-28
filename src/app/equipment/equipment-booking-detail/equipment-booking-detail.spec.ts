import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentBookingDetail  } from './equipment-booking-detail';

describe('EquipmentBookingDetail', () => {
  let component: EquipmentBookingDetail;
  let fixture: ComponentFixture<EquipmentBookingDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentBookingDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipmentBookingDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
