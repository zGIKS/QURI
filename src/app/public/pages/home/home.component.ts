import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../iam/services/authentication.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule
  ],
  template: `
    <div class="home-container">
      <!-- Welcome Section -->
      <section class="welcome-section">
        <div class="welcome-card">
          <mat-icon class="welcome-icon">science</mat-icon>
          <h1>Welcome to QURI TeeLab</h1>
          <p>Your advanced analytics platform is ready to help you make data-driven decisions.</p>
        </div>
      </section>

      <!-- Dashboard Grid -->
      <section class="dashboard-section">
        <mat-grid-list cols="3" rowHeight="200px" gutterSize="24px" class="dashboard-grid">

          <mat-grid-tile>
            <mat-card class="dashboard-card">
              <mat-card-header>
                <mat-icon mat-card-avatar>analytics</mat-icon>
                <mat-card-title>Analytics</mat-card-title>
                <mat-card-subtitle>View your data insights</mat-card-subtitle>
              </mat-card-header>
              <mat-card-actions>
                <button mat-raised-button color="primary">
                  <mat-icon>trending_up</mat-icon>
                  View Analytics
                </button>
              </mat-card-actions>
            </mat-card>
          </mat-grid-tile>

          <mat-grid-tile>
            <mat-card class="dashboard-card">
              <mat-card-header>
                <mat-icon mat-card-avatar>dashboard</mat-icon>
                <mat-card-title>Dashboard</mat-card-title>
                <mat-card-subtitle>Monitor your projects</mat-card-subtitle>
              </mat-card-header>
              <mat-card-actions>
                <button mat-raised-button color="primary">
                  <mat-icon>dashboard</mat-icon>
                  Open Dashboard
                </button>
              </mat-card-actions>
            </mat-card>
          </mat-grid-tile>

          <mat-grid-tile>
            <mat-card class="dashboard-card">
              <mat-card-header>
                <mat-icon mat-card-avatar>settings</mat-icon>
                <mat-card-title>Settings</mat-card-title>
                <mat-card-subtitle>Configure your preferences</mat-card-subtitle>
              </mat-card-header>
              <mat-card-actions>
                <button mat-raised-button color="primary">
                  <mat-icon>settings</mat-icon>
                  Settings
                </button>
              </mat-card-actions>
            </mat-card>
          </mat-grid-tile>

        </mat-grid-list>
      </section>

      <!-- Quick Stats -->
      <section class="quick-stats">
        <h2>Quick Statistics</h2>
        <mat-grid-list cols="4" rowHeight="120px" gutterSize="16px">

          <mat-grid-tile>
            <mat-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">1,234</div>
                <div class="stat-label">Total Users</div>
              </div>
            </mat-card>
          </mat-grid-tile>

          <mat-grid-tile>
            <mat-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">567</div>
                <div class="stat-label">Active Projects</div>
              </div>
            </mat-card>
          </mat-grid-tile>

          <mat-grid-tile>
            <mat-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">89%</div>
                <div class="stat-label">Success Rate</div>
              </div>
            </mat-card>
          </mat-grid-tile>

          <mat-grid-tile>
            <mat-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">24/7</div>
                <div class="stat-label">Uptime</div>
              </div>
            </mat-card>
          </mat-grid-tile>

        </mat-grid-list>
      </section>

      <!-- Action Bar -->
      <section class="action-bar">
        <button mat-raised-button color="warn" (click)="signOut()">
          <mat-icon>logout</mat-icon>
          Sign Out
        </button>
      </section>
    </div>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  signOut() {
    this.authService.signOut();
    this.router.navigate(['/sign-in']);
  }
}
