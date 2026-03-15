import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { GoogleAnalyticsService } from './analytics/google-analytics.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar],
  template: `
    <app-navbar></app-navbar>
    <main class="main-container">
      <router-outlet></router-outlet>
    </main>
  `,
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private ga = inject(GoogleAnalyticsService);

  ngOnInit(): void {
    // Track a page_view on every completed navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this.ga.trackPageView((event as NavigationEnd).urlAfterRedirects);
      });
  }
}



