import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '../../../iam/services/authentication.service';

interface NavigationLink {
  name: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatDividerModule,
    RouterModule
  ],
  template: `
    <div class="home-layout">
      <!-- Sidebar -->
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #drawer class="sidenav" fixedInViewport="true" mode="side" opened="true">
          <div class="sidebar-header">
            <mat-icon class="brand-icon">science</mat-icon>
            <h2 class="brand-name">QURI</h2>
          </div>

          <mat-divider></mat-divider>

          <mat-nav-list class="nav-list">
            <mat-list-item
              *ngFor="let link of navigationLinks"
              [routerLink]="link.route"
              class="nav-item"
              (click)="onNavigate(link)">
              <mat-icon matListItemIcon>{{ link.icon }}</mat-icon>
              <span matListItemTitle>{{ link.name }}</span>
            </mat-list-item>
          </mat-nav-list>

          <mat-divider></mat-divider>

          <!-- Sign Out Button -->
          <div class="sidebar-footer">
            <button mat-stroked-button color="warn" (click)="signOut()" class="sign-out-btn">
              <mat-icon>logout</mat-icon>
              Sign Out
            </button>
          </div>
        </mat-sidenav>

        <!-- Main Content -->
        <mat-sidenav-content class="main-content">
          <mat-toolbar class="toolbar">
            <span>Dashboard</span>
            <span class="toolbar-spacer"></span>
            <button mat-icon-button>
              <mat-icon>notifications</mat-icon>
            </button>
            <button mat-icon-button>
              <mat-icon>account_circle</mat-icon>
            </button>
          </mat-toolbar>

          <div class="content-container">
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
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  navigationLinks: NavigationLink[] = [
    {
      name: 'Catalog',
      route: '/catalog',
      icon: 'storefront'
    },
    {
      name: 'Design Lab',
      route: '/design-lab',
      icon: 'palette'
    }
  ];

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  onNavigate(link: NavigationLink) {
    this.router.navigate([link.route]);
  }

  navigateToSection(section: string) {
    this.router.navigate([`/${section}`]);
  }

  signOut() {
    this.authService.signOut();
    this.router.navigate(['/sign-in']);
  }
}
