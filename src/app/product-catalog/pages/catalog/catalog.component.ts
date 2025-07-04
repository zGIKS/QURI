import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { ProductCatalogService } from '../../services/product-catalog.service';
import { ProductResponse } from '../../services/product.response';
import { ProductUtils } from '../../model/product.utils';
import { AuthenticationService } from '../../../iam/services/authentication.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatToolbarModule
  ],
  template: `
    <div class="catalog-container">
      <!-- Header -->
      <mat-toolbar class="catalog-toolbar">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="toolbar-title">Product Catalog</span>
        <span class="toolbar-spacer"></span>
        <button mat-icon-button>
          <mat-icon>search</mat-icon>
        </button>
        <button mat-icon-button>
          <mat-icon>filter_list</mat-icon>
        </button>
      </mat-toolbar>

      <!-- Content -->
      <div class="catalog-content">
        <!-- Loading State -->
        <div *ngIf="loading" class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading products...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !loading" class="error-container">
          <mat-icon class="error-icon">error</mat-icon>
          <h3>Error Loading Products</h3>
          <p>{{ error }}</p>
          <button mat-raised-button color="primary" (click)="loadProducts()">
            <mat-icon>refresh</mat-icon>
            Retry
          </button>
        </div>

        <!-- Products Grid -->
        <div *ngIf="!loading && !error && products.length > 0" class="products-section">
          <div class="products-header">
            <h2>Available Products</h2>
            <p>{{ products.length }} product{{ products.length !== 1 ? 's' : '' }} found</p>
          </div>

          <mat-grid-list cols="4" rowHeight="350px" gutterSize="24px" class="products-grid">
            <mat-grid-tile *ngFor="let product of products">
              <mat-card class="product-card">
                <!-- Product Image -->
                <div class="product-image">
                  <img
                    [src]="product.projectPreviewUrl || '/assets/placeholder-image.svg'"
                    [alt]="product.projectTitle"
                    (error)="onImageError($event)"
                    class="product-img">
                  <div class="product-overlay">
                    <button mat-icon-button class="like-btn" (click)="toggleLike(product)">
                      <mat-icon>favorite_border</mat-icon>
                    </button>
                  </div>
                </div>

                <!-- Product Content -->
                <mat-card-content class="product-content">
                  <div class="product-info">
                    <h3 class="product-title">{{ product.projectTitle }}</h3>
                    <p class="product-price">{{ formatPrice(product.priceAmount, product.priceCurrency) }}</p>

                    <!-- Product Status -->
                    <mat-chip-set>
                      <mat-chip [class]="getStatusClass(product.status)">
                        {{ getStatusLabel(product.status) }}
                      </mat-chip>
                    </mat-chip-set>

                    <!-- Product Stats -->
                    <div class="product-stats">
                      <span class="stat-item">
                        <mat-icon>favorite</mat-icon>
                        {{ product.likeCount }} likes
                      </span>
                      <span class="stat-item">
                        <mat-icon>person</mat-icon>
                        Designer
                      </span>
                    </div>
                  </div>
                </mat-card-content>

                <!-- Product Actions -->
                <mat-card-actions class="product-actions">
                  <button mat-button (click)="viewProduct(product)">
                    <mat-icon>visibility</mat-icon>
                    View Details
                  </button>
                  <button
                    mat-raised-button
                    color="primary"
                    [disabled]="!canPurchase(product.status)"
                    (click)="purchaseProduct(product)">
                    <mat-icon>shopping_cart</mat-icon>
                    {{ canPurchase(product.status) ? 'Buy Now' : 'Unavailable' }}
                  </button>
                </mat-card-actions>
              </mat-card>
            </mat-grid-tile>
          </mat-grid-list>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && products.length === 0" class="empty-container">
          <mat-icon class="empty-icon">inventory_2</mat-icon>
          <h3>No Products Found</h3>
          <p>There are no products available in the catalog at the moment.</p>
          <button mat-raised-button color="primary" (click)="loadProducts()">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  products: ProductResponse[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private productCatalogService: ProductCatalogService,
    private router: Router,
    private authService: AuthenticationService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.error = null;

    this.productCatalogService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load products';
        this.loading = false;
        console.error('Error loading products:', error);
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  viewProduct(product: ProductResponse) {
    // Navigate to product detail page
    console.log('Viewing product:', product.id);
    // this.router.navigate(['/product', product.id]);
  }

  purchaseProduct(product: ProductResponse) {
    // Handle purchase logic
    console.log('Purchasing product:', product.id);
    // Add purchase logic here
  }

  toggleLike(product: ProductResponse) {
    // Get current user ID from auth service
    this.authService.currentUserId.subscribe(userId => {
      if (userId > 0) {
        this.productCatalogService.toggleProductLike(product.id, userId.toString()).subscribe({
          next: (result) => {
            // Update product like count
            const productIndex = this.products.findIndex(p => p.id === product.id);
            if (productIndex !== -1) {
              this.products[productIndex].likeCount = result.likeCount;
            }
          },
          error: (error) => {
            console.error('Error toggling like:', error);
          }
        });
      }
    });
  }

  onImageError(event: any) {
    // Handle image loading errors
    event.target.src = '/assets/placeholder-image.svg';
  }

  formatPrice(amount: number, currency: string): string {
    return ProductUtils.formatPrice(amount, currency);
  }

  getStatusLabel(status: string): string {
    return ProductUtils.getStatusLabel(status as any);
  }

  getStatusClass(status: string): string {
    return ProductUtils.getStatusClass(status as any);
  }

  canPurchase(status: string): boolean {
    return ProductUtils.canPurchase(status as any);
  }
}
