import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CartService } from '../../services/cart.service';
import { ProductCatalogService } from '../../../product-catalog/services/product-catalog.service';
import { ProductResponse } from '../../../product-catalog/services/product.response';
import { ProductUtils } from '../../../product-catalog/model/product.utils';
import { AuthenticationService } from '../../../iam/services/authentication.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    TranslateModule
  ],
  template: `
    <div class="cart-container">
      <!-- Header Toolbar -->
      <mat-toolbar color="primary" class="cart-toolbar">
        <button mat-icon-button (click)="goBack()" matTooltip="{{ 'common.back' | translate }}">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="toolbar-title">{{ 'cart.title' | translate }}</span>
        <span class="toolbar-spacer"></span>
        <mat-chip class="cart-count-chip" *ngIf="cartService.cartCount > 0">
          <mat-icon matChipAvatar>shopping_cart</mat-icon>
          {{ cartService.cartCount }} {{ cartService.cartCount === 1 ? ('cart.item' | translate) : ('cart.items' | translate) }}
        </mat-chip>
      </mat-toolbar>

      <!-- Content Area -->
      <div class="cart-content">
        <!-- Loading State -->
        <div *ngIf="loading" class="state-container loading-state">
          <mat-spinner diameter="64"></mat-spinner>
          <h3>{{ 'cart.loadingProducts' | translate }}</h3>
        </div>

        <!-- Empty Cart State -->
        <div *ngIf="!loading && cartProducts.length === 0" class="state-container empty-state">
          <mat-icon class="state-icon empty-icon">shopping_cart</mat-icon>
          <h3>{{ 'cart.emptyCart' | translate }}</h3>
          <p>{{ 'cart.emptyCartDescription' | translate }}</p>
          <button mat-raised-button color="primary" (click)="goToCatalog()">
            <mat-icon>storefront</mat-icon>
            {{ 'cart.goToCatalog' | translate }}
          </button>
        </div>

        <!-- Cart Products -->
        <div *ngIf="!loading && cartProducts.length > 0" class="cart-products-section">
          <!-- Cart Items -->
          <div class="cart-items">
            <mat-card *ngFor="let product of cartProducts" class="cart-item-card">
              <div class="cart-item-content">
                <!-- Product Image -->
                <div class="product-image-container">
                  <img
                    [src]="product.projectPreviewUrl || '/assets/placeholder-image.svg'"
                    [alt]="product.projectTitle"
                    (error)="onImageError($event)"
                    class="product-image">
                </div>

                <!-- Product Info -->
                <div class="product-info">
                  <h4 class="product-title">{{ product.projectTitle }}</h4>
                  <p class="product-price">{{ formatPrice(product.priceAmount, product.priceCurrency) }}</p>
                  <div class="product-meta">
                    <mat-chip class="status-chip" [class]="getStatusClass(product.status)">
                      <mat-icon matChipAvatar>{{ getStatusIcon(product.status) }}</mat-icon>
                      {{ getStatusLabel(product.status) }}
                    </mat-chip>
                  </div>
                </div>

                <!-- Actions -->
                <div class="item-actions">
                  <button
                    mat-button
                    color="primary"
                    (click)="viewProduct(product)"
                    matTooltip="{{ 'cart.viewDetails' | translate }}">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button
                    mat-button
                    color="warn"
                    (click)="removeFromCart(product)"
                    matTooltip="{{ 'cart.removeFromCart' | translate }}">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </mat-card>
          </div>

          <mat-divider class="cart-divider"></mat-divider>

          <!-- Cart Summary -->
          <div class="cart-summary">
            <mat-card class="summary-card">
              <mat-card-header>
                <mat-card-title>{{ 'cart.summary' | translate }}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="summary-row">
                  <span class="summary-label">{{ 'cart.totalItems' | translate }}:</span>
                  <span class="summary-value">{{ cartProducts.length }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">{{ 'cart.totalPrice' | translate }}:</span>
                  <span class="summary-value total-price">{{ getTotalPrice() }}</span>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button
                  mat-button
                  color="primary"
                  (click)="clearCart()"
                  [disabled]="cartProducts.length === 0">
                  <mat-icon>clear_all</mat-icon>
                  {{ 'cart.clearCart' | translate }}
                </button>
                <button
                  mat-raised-button
                  color="accent"
                  (click)="proceedToCheckout()"
                  [disabled]="cartProducts.length === 0">
                  <mat-icon>payment</mat-icon>
                  {{ 'cart.proceedToCheckout' | translate }}
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartProducts: ProductResponse[] = [];
  loading = false;

  constructor(
    public cartService: CartService,
    private productCatalogService: ProductCatalogService,
    private router: Router,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    private authService: AuthenticationService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadCartProducts();
  }

  loadCartProducts() {
    this.loading = true;
    const productIds = this.cartService.getCartProductIds();

    if (productIds.length === 0) {
      this.cartProducts = [];
      this.loading = false;
      return;
    }

    // Load product details for each product in cart
    const productObservables = productIds.map(id =>
      this.productCatalogService.getProductById(id)
    );

    forkJoin(productObservables).subscribe({
      next: (products) => {
        this.cartProducts = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cart products:', error);
        this.loading = false;
        const message = this.translateService.instant('cart.errorLoadingProducts');
        this.snackBar.open(message, this.translateService.instant('common.close'), {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  goToCatalog() {
    this.router.navigate(['/home/catalog']);
  }

  viewProduct(product: ProductResponse) {
    this.router.navigate(['/home/catalog', product.id]);
  }

  removeFromCart(product: ProductResponse) {
    const success = this.cartService.removeFromCart(product.id);

    if (success) {
      // Remove from local array
      this.cartProducts = this.cartProducts.filter(p => p.id !== product.id);

      const message = this.translateService.instant('cart.removedFromCart');
      this.snackBar.open(message, this.translateService.instant('common.close'), {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    }
  }

  clearCart() {
    this.cartService.clearCart();
    this.cartProducts = [];

    const message = this.translateService.instant('cart.cartCleared');
    this.snackBar.open(message, this.translateService.instant('common.close'), {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  proceedToCheckout() {
    // Check if user is authenticated
    this.authService.currentUserId.subscribe(userId => {
      if (!userId || userId === '') {
        const message = this.translateService.instant('cart.loginRequired');
        this.snackBar.open(message, this.translateService.instant('common.close'), {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
        return;
      }

      // For now, show a message that checkout is not implemented
      const message = this.translateService.instant('cart.checkoutNotImplemented');
      this.snackBar.open(message, this.translateService.instant('common.close'), {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    });
  }

  getTotalPrice(): string {
    const total = this.cartProducts.reduce((sum, product) => sum + product.priceAmount, 0);
    // Assume all products have the same currency for simplicity
    const currency = this.cartProducts.length > 0 ? this.cartProducts[0].priceCurrency : 'USD';
    return ProductUtils.formatPrice(total, currency);
  }

  onImageError(event: any) {
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
}
