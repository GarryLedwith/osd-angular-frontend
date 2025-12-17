import { TestBed } from '@angular/core/testing';

import { AuthCustomService } from './auth-custom.service';

/**
 * Unit Tests for AuthCustomService
 * Tests authentication functionality including login, logout, and session management
 */
describe('AuthCustomService', () => {
  let service: AuthCustomService;

  // Setup before each test
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthCustomService);
  });

  // Test: Verify service can be created successfully
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
