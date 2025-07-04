import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule
  ],
  template: `
    <!-- Welcome Section -->
    <section class="welcome-section">
      <mat-card class="welcome-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="welcome-avatar">dashboard</mat-icon>
          <mat-card-title>Welcome to QURI TeeLab</mat-card-title>
          <mat-card-subtitle>Your advanced analytics platform is ready to help you make data-driven decisions.</mat-card-subtitle>
        </mat-card-header>
      </mat-card>
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
              <mat-icon mat-card-avatar>shopping_cart</mat-icon>
              <mat-card-title>Product Catalog</mat-card-title>
              <mat-card-subtitle>Manage your products</mat-card-subtitle>
            </mat-card-header>
            <mat-card-actions>
              <button mat-raised-button color="primary" (click)="navigateToSection('catalog')">
                <mat-icon>storefront</mat-icon>
                View Catalog
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>design_services</mat-icon>
              <mat-card-title>Design Lab</mat-card-title>
              <mat-card-subtitle>Create and edit designs</mat-card-subtitle>
            </mat-card-header>
            <mat-card-actions>
              <button mat-raised-button color="primary" (click)="navigateToSection('design-lab')">
                <mat-icon>palette</mat-icon>
                Open Lab
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
            <mat-card-content class="stat-content">
              <div class="stat-number">1,234</div>
              <div class="stat-label">Total Users</div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="stat-card">
            <mat-card-content class="stat-content">
              <div class="stat-number">567</div>
              <div class="stat-label">Active Projects</div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="stat-card">
            <mat-card-content class="stat-content">
              <div class="stat-number">89%</div>
              <div class="stat-label">Success Rate</div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="stat-card">
            <mat-card-content class="stat-content">
              <div class="stat-number">24/7</div>
              <div class="stat-label">Uptime</div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

      </mat-grid-list>
    </section>
  `,
  styles: [`
    .welcome-section {
      margin-bottom: 32px;
    }

    .welcome-card {
      border-radius: 12px;
      padding: 0;
    }

    .welcome-card mat-card-header {
      padding: 24px;
    }

    .welcome-avatar {
      font-size: 24px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .welcome-card mat-card-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .welcome-card mat-card-subtitle {
      font-size: 16px;
      line-height: 1.5;
    }

    .dashboard-section {
      margin-bottom: 32px;
    }

    .dashboard-grid {
      margin-bottom: 0;
    }

    .dashboard-card {
      border-radius: 12px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.2s ease;
    }

    .dashboard-card:hover {
      transform: translateY(-2px);
    }

    .dashboard-card mat-card-header {
      padding: 20px;
      flex-grow: 1;
    }

    .dashboard-card mat-card-header mat-icon {
      font-size: 20px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }

    .dashboard-card mat-card-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .dashboard-card mat-card-subtitle {
      font-size: 14px;
      line-height: 1.4;
    }

    .dashboard-card mat-card-actions {
      padding: 20px;
      padding-top: 0;
    }

    .dashboard-card mat-card-actions button {
      width: 100%;
      height: 40px;
      border-radius: 8px;
      font-weight: 500;
    }

    .dashboard-card mat-card-actions button mat-icon {
      margin-right: 8px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .quick-stats {
      margin-bottom: 32px;
    }

    .quick-stats h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .stat-card {
      border-radius: 12px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-1px);
    }

    .stat-content {
      text-align: center;
      padding: 16px;
    }

    .stat-number {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
      font-weight: 500;
    }

    @media (max-width: 900px) {
      .dashboard-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .quick-stats mat-grid-list {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .quick-stats mat-grid-list {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent {
  constructor(private router: Router) {}

  navigateToSection(section: string) {
    this.router.navigate(['/home', section]);
  }
}
