import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthenticationService } from '../../../iam/services/authentication.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <!-- Welcome Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <mat-card class="hero-card">
          <mat-card-content>
            <div class="hero-text">
              <h1 class="hero-title">{{ 'dashboard.welcome' | translate }}</h1>
              <p class="hero-subtitle">{{ 'dashboard.overview' | translate }}</p>
            </div>
            <div class="hero-icon">
              <mat-icon class="hero-icon-graphic">dashboard</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </section>

    <!-- Quick Actions Section -->
    <section class="quick-actions-section">
      <h2 class="section-title">{{ 'dashboard.quickActions' | translate }}</h2>
      <div class="actions-grid">
        <mat-card class="action-card" (click)="navigateToSection('catalog')">
          <mat-card-header>
            <mat-icon mat-card-avatar class="action-icon catalog-icon">storefront</mat-icon>
            <mat-card-title>{{ 'dashboard.productCatalog.title' | translate }}</mat-card-title>
            <mat-card-subtitle>{{ 'dashboard.productCatalog.subtitle' | translate }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button mat-raised-button color="primary">
              <mat-icon>arrow_forward</mat-icon>
              {{ 'dashboard.productCatalog.action' | translate }}
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="action-card" (click)="navigateToSection('design-lab')">
          <mat-card-header>
            <mat-icon mat-card-avatar class="action-icon design-icon">palette</mat-icon>
            <mat-card-title>{{ 'dashboard.designLab.title' | translate }}</mat-card-title>
            <mat-card-subtitle>{{ 'dashboard.designLab.subtitle' | translate }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button mat-raised-button color="accent">
              <mat-icon>create</mat-icon>
              {{ 'dashboard.designLab.action' | translate }}
            </button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="action-card" (click)="navigateToSection('cart')">
          <mat-card-header>
            <mat-icon mat-card-avatar class="action-icon cart-icon">shopping_cart</mat-icon>
            <mat-card-title>{{ 'navigation.cart' | translate }}</mat-card-title>
            <mat-card-subtitle>{{ 'cart.emptyCartDescription' | translate }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button mat-raised-button color="warn">
              <mat-icon>shopping_cart</mat-icon>
              {{ 'catalog.viewCart' | translate }}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </section>

    <!-- Debug Section (only for testing) -->
    <section class="debug-section">
      <button mat-raised-button color="warn" (click)="checkAuthState()">
        🔍 Check Authentication State
      </button>
    </section>
  `,
  styles: [`
    .hero-section {
      margin-bottom: 32px;
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero-card {
      border-radius: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }

    .hero-card mat-card-content {
      padding: 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .hero-text {
      flex: 1;
    }

    .hero-title {
      font-size: 48px;
      font-weight: 700;
      margin: 0 0 16px 0;
      line-height: 1.2;
    }

    .hero-subtitle {
      font-size: 20px;
      line-height: 1.5;
      margin: 0;
      opacity: 0.9;
    }

    .hero-icon {
      flex-shrink: 0;
      margin-left: 32px;
    }

    .hero-icon-graphic {
      font-size: 120px;
      width: 120px;
      height: 120px;
      opacity: 0.3;
    }

    .quick-actions-section {
      max-width: 1200px;
      margin: 0 auto;
    }

    .section-title {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 32px;
      color: #333;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .action-card {
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    .action-card mat-card-header {
      padding: 24px;
      flex-grow: 1;
    }

    .action-icon {
      font-size: 24px;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }

    .catalog-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .design-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .cart-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .action-card mat-card-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
    }

    .action-card mat-card-subtitle {
      font-size: 16px;
      line-height: 1.5;
      color: #666;
    }

    .action-card mat-card-actions {
      padding: 16px 24px 24px 24px;
    }

    .action-card button {
      width: 100%;
      font-size: 16px;
      font-weight: 600;
      padding: 12px 24px;
      border-radius: 8px;
    }

    .action-card button mat-icon {
      margin-right: 8px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-card mat-card-content {
        flex-direction: column;
        text-align: center;
        padding: 32px 24px;
      }

      .hero-icon {
        margin: 24px 0 0 0;
      }

      .hero-title {
        font-size: 36px;
      }

      .hero-subtitle {
        font-size: 18px;
      }

      .section-title {
        font-size: 28px;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }

    .debug-section {
      margin-top: 32px;
      text-align: center;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .debug-section button {
      font-size: 12px;
      padding: 8px 16px;
    }
  `]
})
export class DashboardComponent {
  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) {}

  navigateToSection(section: string) {
    this.router.navigate(['/home', section]);
  }

  // Debug method to check authentication state
  checkAuthState() {
    const isAuthenticated = this.authService.isAuthenticated();
    const hasValidToken = this.authService.hasValidToken();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    console.log('🔍 Dashboard Auth Debug:', {
      isAuthenticated,
      hasValidToken,
      localStorage: {
        hasToken: !!token,
        hasUserId: !!userId,
        hasUsername: !!username,
        token: token ? token.substring(0, 20) + '...' : null
      }
    });

    alert(`Authentication State:
    - Is Authenticated: ${isAuthenticated}
    - Has Valid Token: ${hasValidToken}
    - LocalStorage Token: ${!!token}
    - LocalStorage User ID: ${!!userId}
    - LocalStorage Username: ${!!username}`);
  }
}
