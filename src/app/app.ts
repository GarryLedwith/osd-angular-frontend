import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';

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
export class AppComponent {}

