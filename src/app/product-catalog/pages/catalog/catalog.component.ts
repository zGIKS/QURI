import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ProductCatalogService } from '../../services/product-catalog.service';
import { ProductResponse } from '../../services/product.response';
import { ProductUtils } from '../../model/product.utils';
import { ProductStatus } from '../../model/product.entity';
import { AuthenticationService } from '../../../iam/services/authentication.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PurchaseConfirmationDialog } from '../../components/purchase-confirmation-dialog/purchase-confirmation-dialog.component';
import { CartService } from '../../../shared/services/cart.service';

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
    MatToolbarModule,
    MatBadgeModule,
    MatDividerModule,
    MatRippleModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslateModule
  ],
  template: `
    <div class="catalog-container">
      <!-- Header Toolbar -->
      <mat-toolbar color="primary" class="catalog-toolbar">
        <button mat-icon-button (click)="goBack()" matTooltip="{{ 'common.back' | translate }}">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="toolbar-title">{{ 'catalog.title' | translate }}</span>
        <span class="toolbar-spacer"></span>

        <!-- Cart Button -->
        <button
          mat-icon-button
          (click)="viewCart()"
          [matBadge]="cartService.cartCount > 0 ? cartService.cartCount : null"
          matBadgeColor="accent"
          matBadgeSize="small"
          matTooltip="{{ 'catalog.viewCart' | translate }}">
          <mat-icon>shopping_cart</mat-icon>
        </button>

        <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="{{ 'common.options' | translate }}">
          <mat-icon>more_vert</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item (click)="refreshProducts()">
            <mat-icon>refresh</mat-icon>
            <span>{{ 'common.refresh' | translate }}</span>
          </button>
        </mat-menu>
      </mat-toolbar>

      <!-- Content Area -->
      <div class="catalog-content">
        <!-- Loading State -->
        <div *ngIf="loading" class="state-container loading-state">
          <mat-spinner diameter="64"></mat-spinner>
          <h3>{{ 'catalog.loadingProducts' | translate }}</h3>
          <p>{{ 'catalog.loadingDescription' | translate }}</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !loading" class="state-container error-state">
          <mat-icon class="state-icon error-icon">error_outline</mat-icon>
          <h3>{{ 'catalog.errorLoadingProducts' | translate }}</h3>
          <p class="error-message">{{ error }}</p>
          <button mat-raised-button color="primary" (click)="loadProducts()">
            <mat-icon>refresh</mat-icon>
            {{ 'common.retry' | translate }}
          </button>
        </div>

        <!-- Products Section -->
        <div *ngIf="!loading && !error && products.length > 0" class="products-section">
          <!-- Section Header -->
          <div class="section-header">
            <div class="header-content">
              <h2 class="section-title">{{ 'catalog.availableProducts' | translate }}</h2>
              <mat-chip-set>
                <mat-chip class="products-count">
                  <mat-icon matChipAvatar>inventory_2</mat-icon>
                  {{ products.length }} {{ products.length !== 1 ? ('catalog.products' | translate) : ('catalog.product' | translate) }}
                </mat-chip>
              </mat-chip-set>
            </div>
            <mat-divider></mat-divider>
          </div>

          <!-- Products Grid -->
          <div class="products-grid">
            <mat-card *ngFor="let product of products" class="product-card" matRipple>
              <!-- Product Image Container -->
              <div class="product-image-container">
                <img
                  [src]="product.projectPreviewUrl || '/assets/placeholder-image.svg'"
                  [alt]="product.projectTitle"
                  (error)="onImageError($event)"
                  class="product-image">

                <!-- Overlay with Actions -->
                <div class="product-overlay">
                  <button
                    mat-mini-fab
                    color="accent"
                    class="like-button"
                    (click)="toggleLike(product)"
                    matTooltip="{{ 'catalog.addToFavorites' | translate }}">
                    <mat-icon>{{ isProductLiked(product) ? 'favorite' : 'favorite_border' }}</mat-icon>
                  </button>
                </div>

                <!-- Status Badge -->
                <div class="status-badge">
                  <mat-chip [class]="getStatusClass(product.status)">
                    <mat-icon matChipAvatar>{{ getStatusIcon(product.status) }}</mat-icon>
                    {{ getStatusLabel(product.status) }}
                  </mat-chip>
                </div>
              </div>

              <!-- Product Information -->
              <mat-card-header class="product-header">
                <div class="product-title-section">
                  <mat-card-title class="product-title">{{ product.projectTitle }}</mat-card-title>
                  <mat-card-subtitle class="product-price">
                    {{ formatPrice(product.priceAmount, product.priceCurrency) }}
                  </mat-card-subtitle>
                </div>
              </mat-card-header>

              <mat-card-content class="product-content">
                <!-- Product Stats -->
                <div class="product-stats">
                  <div class="stat-item">
                    <mat-icon class="stat-icon">favorite</mat-icon>
                    <span class="stat-label">{{ product.likeCount || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <mat-icon class="stat-icon">visibility</mat-icon>
                    <span class="stat-label">{{ getProductViewCount(product) }}</span>
                  </div>
                  <div class="stat-item">
                    <mat-icon class="stat-icon">person</mat-icon>
                    <span class="stat-label">{{ 'catalog.designer' | translate }}</span>
                  </div>
                </div>

                <mat-divider class="content-divider"></mat-divider>


              </mat-card-content>

              <!-- Product Actions -->
              <mat-card-actions class="product-actions">
                <button
                  mat-button
                  color="primary"
                  (click)="viewProduct(product)"
                  matTooltip="{{ 'catalog.viewDetails' | translate }}">
                  <mat-icon>visibility</mat-icon>
                  {{ 'catalog.viewDetails' | translate }}
                </button>

                <button
                  mat-button
                  color="accent"
                  [disabled]="!canPurchase(product.status) || isProductInCart(product.id)"
                  (click)="addToCart(product)"
                  [matTooltip]="getAddToCartTooltip(product)">
                  <mat-icon>{{ getAddToCartIcon(product) }}</mat-icon>
                  {{ getAddToCartText(product) }}
                </button>

                <button
                  mat-raised-button
                  [color]="canPurchase(product.status) ? 'accent' : 'warn'"
                  [disabled]="!canPurchase(product.status)"
                  (click)="purchaseProduct(product)"
                  [matTooltip]="canPurchase(product.status) ? ('catalog.buyNow' | translate) : ('catalog.unavailable' | translate)">
                  <mat-icon>{{ canPurchase(product.status) ? 'shopping_cart' : 'block' }}</mat-icon>
                  {{ canPurchase(product.status) ? ('catalog.buyNow' | translate) : ('catalog.unavailable' | translate) }}
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !error && products.length === 0" class="state-container empty-state">
          <mat-icon class="state-icon empty-icon">inventory_2</mat-icon>
          <h3>{{ 'catalog.noProducts' | translate }}</h3>
          <p>{{ 'catalog.noProductsDescription' | translate }}</p>
          <button mat-raised-button color="primary" (click)="loadProducts()">
            <mat-icon>refresh</mat-icon>
            {{ 'common.refresh' | translate }}
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
    private authService: AuthenticationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    public cartService: CartService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  // Helper method to check if product is liked by user
  isProductLiked(_product: ProductResponse): boolean {
    // This would need to be implemented based on your business logic
    return false;
  }

  // Helper method to get product view count
  getProductViewCount(_product: ProductResponse): number {
    // This would need to be implemented based on your business logic
    return 0;
  }

  // Helper method to get product garment color
  getProductGarmentColor(_product: ProductResponse): string {
    // This would need to be implemented based on your business logic
    return 'N/A';
  }

  // Helper method to get product garment size
  getProductGarmentSize(_product: ProductResponse): string {
    // This would need to be implemented based on your business logic
    return 'N/A';
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

  /**
   * Refresh products (alias for loadProducts)
   */
  refreshProducts() {
    this.loadProducts();
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  viewProduct(product: ProductResponse) {
    // Navigate to product detail page
    this.router.navigate(['/home/catalog', product.id]);
  }

  viewCart() {
    // Navigate to cart page
    this.router.navigate(['/home/cart']);
  }

  purchaseProduct(product: ProductResponse) {
    // Check if user is authenticated
    this.authService.currentUserId.subscribe(userId => {
      if (!userId || userId === '') {
        // Show login required message
        const message = this.translateService.instant('catalog.loginRequired');
        this.snackBar.open(message, this.translateService.instant('common.close'), {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        return;
      }

      // Check if product is available for purchase
      if (!this.canPurchase(product.status)) {
        const message = this.translateService.instant('catalog.productNotAvailable');
        this.snackBar.open(message, this.translateService.instant('common.close'), {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        return;
      }

      // Show purchase confirmation dialog
      this.showPurchaseConfirmation(product);
    });
  }

  private showPurchaseConfirmation(product: ProductResponse) {
    const dialogRef = this.dialog.open(PurchaseConfirmationDialog, {
      width: '400px',
      data: {
        product: product,
        price: this.formatPrice(product.priceAmount, product.priceCurrency)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.processPurchase(product);
      }
    });
  }

  private processPurchase(product: ProductResponse) {
    // Show processing message
    const processingMessage = this.translateService.instant('catalog.processingPurchase');
    this.snackBar.open(processingMessage, '', {
      duration: 0, // Keep open until dismissed
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });

    // Simulate purchase processing (replace with actual API call)
    setTimeout(() => {
      this.snackBar.dismiss();

      // Show success message
      const successMessage = this.translateService.instant('catalog.purchaseSuccess');
      this.snackBar.open(successMessage, this.translateService.instant('common.close'), {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });

      // Update product status to UNAVAILABLE (optional, depends on your business logic)
      const productIndex = this.products.findIndex(p => p.id === product.id);
      if (productIndex !== -1) {
        this.products[productIndex].status = ProductStatus.UNAVAILABLE;
      }

      // Navigate to order confirmation or user orders
      // this.router.navigate(['/orders']);
    }, 2000);
  }

  toggleLike(product: ProductResponse) {
    // Get current user ID from auth service
    this.authService.currentUserId.subscribe(userId => {
      if (userId && userId !== '') {
        this.productCatalogService.toggleProductLike(product.id, userId).subscribe({
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

  getStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE':
        return 'check_circle';
      case 'SOLD':
        return 'sold';
      case 'PENDING':
        return 'schedule';
      case 'DISCONTINUED':
        return 'cancel';
      default:
        return 'help';
    }
  }

  canPurchase(status: string): boolean {
    return ProductUtils.canPurchase(status as any);
  }

  /**
   * Check if product is in cart
   */
  isProductInCart(productId: string): boolean {
    return this.cartService.isInCart(productId);
  }

  /**
   * Add product to cart
   */
  addToCart(product: ProductResponse) {
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

      const success = this.cartService.addToCart(product.id);

      if (success) {
        const message = this.translateService.instant('catalog.addedToCart');
        this.snackBar.open(message, this.translateService.instant('common.close'), {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      } else {
        const message = this.translateService.instant('catalog.alreadyInCart');
        this.snackBar.open(message, this.translateService.instant('common.close'), {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['warning-snackbar']
        });
      }
    });
  }

  /**
   * Get add to cart button icon
   */
  getAddToCartIcon(product: ProductResponse): string {
    if (!this.canPurchase(product.status)) return 'block';
    if (this.isProductInCart(product.id)) return 'check_circle';
    return 'add_shopping_cart';
  }

  /**
   * Get add to cart button text
   */
  getAddToCartText(product: ProductResponse): string {
    if (!this.canPurchase(product.status)) {
      return this.translateService.instant('catalog.unavailable');
    }
    if (this.isProductInCart(product.id)) {
      return this.translateService.instant('catalog.inCart');
    }
    return this.translateService.instant('catalog.addToCart');
  }

  /**
   * Get add to cart button tooltip
   */
  getAddToCartTooltip(product: ProductResponse): string {
    if (!this.canPurchase(product.status)) {
      return this.translateService.instant('catalog.unavailable');
    }
    if (this.isProductInCart(product.id)) {
      return this.translateService.instant('catalog.alreadyInCart');
    }
    return this.translateService.instant('catalog.addToCart');
  }
}
