import { Injectable } from '@angular/core';

// Reference the global gtag function injected by the GA4 snippet in index.html
declare const gtag: (...args: unknown[]) => void;

@Injectable({ providedIn: 'root' })
export class GoogleAnalyticsService {

  /** Send a page_view hit — called on every NavigationEnd in AppComponent */
  trackPageView(url: string): void {
    if (typeof gtag === 'undefined') return;
    gtag('event', 'page_view', { page_path: url });
  }

  /** Fire a booking_submitted custom event */
  trackBookingSubmitted(equipmentId: string, equipmentName: string): void {
    if (typeof gtag === 'undefined') return;
    gtag('event', 'booking_submitted', {
      equipment_id: equipmentId,
      equipment_name: equipmentName,
    });
  }

  /** Fire a generic custom event */
  trackEvent(eventName: string, params: Record<string, unknown> = {}): void {
    if (typeof gtag === 'undefined') return;
    gtag('event', eventName, params);
  }
}
