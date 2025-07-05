import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductCatalogService } from '../../services/product-catalog.service';
import { ProductResponse } from '../../services/product.response';
import { ProductUtils } from '../../model/product.utils';
import { AuthenticationService } from '../../../iam/services/authentication.service';
import { DesignLabService } from '../../../design-lab/services/design-lab.service';
import { Project } from '../../../design-lab/model/project.entity';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatToolbarModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
    TranslateModule
  ],
  template: `
    <div class="product-detail-container">
      <!-- Header Toolbar -->
      <mat-toolbar color="primary" class="detail-toolbar">
        <button mat-icon-button (click)="goBack()" matTooltip="{{ 'common.back' | translate }}">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="toolbar-title">{{ 'catalog.productDetails' | translate }}</span>
        <span class="toolbar-spacer"></span>
        <button mat-icon-button (click)="toggleLike()" matTooltip="{{ 'catalog.addToFavorites' | translate }}">
          <mat-icon>{{ isLiked ? 'favorite' : 'favorite_border' }}</mat-icon>
        </button>
      </mat-toolbar>

      <!-- Content Area -->
      <div class="detail-content">
        <!-- Loading State -->
        <div *ngIf="loading" class="state-container loading-state">
          <mat-spinner diameter="64"></mat-spinner>
          <h3>{{ 'catalog.loadingProduct' | translate }}</h3>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !loading" class="state-container error-state">
          <mat-icon class="state-icon error-icon">error_outline</mat-icon>
          <h3>{{ 'catalog.errorLoadingProduct' | translate }}</h3>
          <p class="error-message">{{ error }}</p>
          <button mat-raised-button color="primary" (click)="loadProduct()">
            <mat-icon>refresh</mat-icon>
            {{ 'common.retry' | translate }}
          </button>
        </div>

        <!-- Product Detail -->
        <div *ngIf="!loading && !error && product" class="product-detail">
          <div class="product-layout">
            <!-- Product Image Section -->
            <div class="product-image-section">
              <div class="main-image-container">
                <img
                  [src]="product.projectPreviewUrl || '/assets/placeholder-image.svg'"
                  [alt]="product.projectTitle"
                  (error)="onImageError($event)"
                  class="main-image">

                <!-- Status Badge -->
                <div class="status-badge">
                  <mat-chip [class]="getStatusClass(product.status)">
                    <mat-icon matChipAvatar>{{ getStatusIcon(product.status) }}</mat-icon>
                    {{ getStatusLabel(product.status) }}
                  </mat-chip>
                </div>
              </div>
            </div>

            <!-- Product Information Section -->
            <div class="product-info-section">
              <mat-card class="info-card">
                <mat-card-header>
                  <mat-card-title class="product-title">{{ product.projectTitle }}</mat-card-title>
                  <mat-card-subtitle class="product-price">
                    {{ formatPrice(product.priceAmount, product.priceCurrency) }}
                  </mat-card-subtitle>
                </mat-card-header>

                <mat-card-content>
                  <!-- Product Stats -->
                  <div class="product-stats">
                    <div class="stat-item">
                      <mat-icon class="stat-icon">favorite</mat-icon>
                      <span class="stat-value">{{ product.likeCount || 0 }}</span>
                      <span class="stat-label">{{ 'catalog.likes' | translate }}</span>
                    </div>
                    <div class="stat-item">
                      <mat-icon class="stat-icon">visibility</mat-icon>
                      <span class="stat-value">{{ viewCount }}</span>
                      <span class="stat-label">{{ 'catalog.views' | translate }}</span>
                    </div>
                    <div class="stat-item">
                      <mat-icon class="stat-icon">schedule</mat-icon>
                      <span class="stat-value">{{ formatDate(product.createdAt) }}</span>
                      <span class="stat-label">{{ 'catalog.created' | translate }}</span>
                    </div>
                  </div>

                  <mat-divider class="section-divider"></mat-divider>

                  <!-- Product Details -->
                  <div class="product-details">
                    <h3 class="section-title">{{ 'catalog.productInformation' | translate }}</h3>

                    <div class="detail-grid">
                      <div class="detail-row">
                        <mat-icon class="detail-icon">palette</mat-icon>
                        <span class="detail-label">{{ 'catalog.color' | translate }}:</span>
                        <span class="detail-value">{{ getProductColor() }}</span>
                      </div>

                      <div class="detail-row">
                        <mat-icon class="detail-icon">straighten</mat-icon>
                        <span class="detail-label">{{ 'catalog.size' | translate }}:</span>
                        <span class="detail-value">{{ getProductSize() }}</span>
                      </div>

                      <div class="detail-row" *ngIf="project">
                        <mat-icon class="detail-icon">category</mat-icon>
                        <span class="detail-label">{{ 'catalog.status' | translate }}:</span>
                        <span class="detail-value">{{ project.status }}</span>
                      </div>
                    </div>
                  </div>

                  <mat-divider class="section-divider"></mat-divider>

                  <!-- Purchase Section -->
                  <div class="purchase-section">
                    <h3 class="section-title">{{ 'catalog.purchaseOptions' | translate }}</h3>

                    <div class="purchase-info">
                      <div class="price-display">
                        <span class="price-label">{{ 'catalog.price' | translate }}:</span>
                        <span class="price-value">{{ formatPrice(product.priceAmount, product.priceCurrency) }}</span>
                      </div>

                      <div class="availability-info">
                        <mat-icon [class]="getAvailabilityIconClass()">{{ getAvailabilityIcon() }}</mat-icon>
                        <span class="availability-text">{{ getAvailabilityText() }}</span>
                      </div>
                    </div>
                  </div>
                </mat-card-content>

                <mat-card-actions class="product-actions">
                  <button
                    mat-button
                    color="primary"
                    (click)="goBack()"
                    matTooltip="{{ 'common.back' | translate }}">
                    <mat-icon>arrow_back</mat-icon>
                    {{ 'common.back' | translate }}
                  </button>

                  <button
                    mat-raised-button
                    color="accent"
                    [disabled]="!canAddToCart()"
                    (click)="addToCart()"
                    matTooltip="{{ canAddToCart() ? ('catalog.addToCart' | translate) : ('catalog.unavailable' | translate) }}">
                    <mat-icon>{{ canAddToCart() ? 'add_shopping_cart' : 'block' }}</mat-icon>
                    {{ canAddToCart() ? ('catalog.addToCart' | translate) : ('catalog.unavailable' | translate) }}
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: ProductResponse | null = null;
  project: Project | null = null;
  loading = false;
  error: string | null = null;
  isLiked = false;
  viewCount = 0;
  productId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productCatalogService: ProductCatalogService,
    private designLabService: DesignLabService,
    private authService: AuthenticationService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.productId = params['productId'];
      if (this.productId) {
        this.loadProduct();
        this.loadProductLikeStatus();
      }
    });
  }

  loadProduct() {
    this.loading = true;
    this.error = null;

    this.productCatalogService.getProductById(this.productId).subscribe({
      next: (product) => {
        this.product = product;
        this.viewCount = Math.floor(Math.random() * 1000); // Simulated view count

        // Load project details using the projectId from the product
        this.loadProjectDetails(product.projectId);
      },
      error: (error) => {
        this.error = error.message || 'Failed to load product';
        this.loading = false;
        console.error('Error loading product:', error);
      }
    });
  }

  loadProjectDetails(projectId: string) {
    this.designLabService.getProjectById(projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.loading = false;
        console.log('✅ Project details loaded:', project);
      },
      error: (error) => {
        console.error('Error loading project details:', error);
        this.loading = false;
        // Continue without project details if they fail to load
      }
    });
  }

  loadProductLikeStatus() {
    this.authService.currentUserId.subscribe(userId => {
      if (userId && userId !== '') {
        this.productCatalogService.isProductLikedByUser(this.productId, userId).subscribe({
          next: (status) => {
            this.isLiked = status.isLiked;
          },
          error: (error) => {
            console.error('Error loading like status:', error);
          }
        });
      }
    });
  }

  toggleLike() {
    this.authService.currentUserId.subscribe(userId => {
      if (userId && userId !== '' && this.product) {
        this.productCatalogService.toggleProductLike(this.product.id, userId).subscribe({
          next: (result) => {
            this.isLiked = result.isLiked;
            if (this.product) {
              this.product.likeCount = result.likeCount;
            }
          },
          error: (error) => {
            console.error('Error toggling like:', error);
          }
        });
      }
    });
  }

  addToCart() {
    if (!this.product) return;

    this.authService.currentUserId.subscribe(userId => {
      if (!userId || userId === '') {
        const message = this.translateService.instant('catalog.loginRequired');
        this.snackBar.open(message, this.translateService.instant('common.close'), {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        return;
      }

      // Add to cart logic (simulated)
      const message = this.translateService.instant('catalog.addedToCart');
      this.snackBar.open(message, this.translateService.instant('common.close'), {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });

      // Here you would call your cart service
      // this.cartService.addToCart(this.product);
    });
  }

  canAddToCart(): boolean {
    return this.product ? ProductUtils.canPurchase(this.product.status) : false;
  }

  goBack() {
    this.router.navigate(['/home/catalog']);
  }

  onImageError(event: any) {
    event.target.src = '/assets/placeholder-image.svg';
  }

  formatPrice(amount: number, currency: string): string {
    return ProductUtils.formatPrice(amount, currency);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  getStatusLabel(status: string): string {
    return ProductUtils.getStatusLabel(status as any);
  }

  getStatusClass(status: string): string {
    return ProductUtils.getStatusClass(status as any);
  }

  getStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE':
        return 'check_circle';
      case 'UNAVAILABLE':
        return 'cancel';
      case 'OUT_OF_STOCK':
        return 'inventory';
      case 'DISCONTINUED':
        return 'block';
      default:
        return 'help';
    }
  }

  getProductColor(): string {
    return this.project?.garmentColor || 'N/A';
  }

  getProductSize(): string {
    return this.project?.garmentSize || 'N/A';
  }

  getAvailabilityIcon(): string {
    return this.canAddToCart() ? 'check_circle' : 'cancel';
  }

  getAvailabilityIconClass(): string {
    return this.canAddToCart() ? 'available-icon' : 'unavailable-icon';
  }

  getAvailabilityText(): string {
    return this.canAddToCart()
      ? this.translateService.instant('catalog.available')
      : this.translateService.instant('catalog.unavailable');
  }

  getProjectInfo(): string {
    if (!this.project) return 'N/A';

    const info = [];
    if (this.project.garmentColor) info.push(`Color: ${this.project.garmentColor}`);
    if (this.project.garmentSize) info.push(`Size: ${this.project.garmentSize}`);

    return info.length > 0 ? info.join(' • ') : 'N/A';
  }
}
