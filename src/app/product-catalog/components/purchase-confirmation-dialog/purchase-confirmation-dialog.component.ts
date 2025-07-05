import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ProductResponse } from '../../services/product.response';

export interface PurchaseDialogData {
  product: ProductResponse;
  price: string;
}

@Component({
  selector: 'app-purchase-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <div class="purchase-dialog">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon>shopping_cart</mat-icon>
        {{ 'catalog.confirmPurchase' | translate }}
      </h2>

      <div mat-dialog-content class="dialog-content">
        <div class="product-info">
          <img
            [src]="data.product.projectPreviewUrl || '/assets/placeholder-image.svg'"
            [alt]="data.product.projectTitle"
            class="product-image">

          <div class="product-details">
            <h3 class="product-title">{{ data.product.projectTitle }}</h3>
            <p class="product-price">{{ data.price }}</p>
            <p class="product-description">{{ 'catalog.purchaseDescription' | translate }}</p>
          </div>
        </div>

        <div class="purchase-warning">
          <mat-icon class="warning-icon">info</mat-icon>
          <p>{{ 'catalog.purchaseWarning' | translate }}</p>
        </div>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button
          mat-button
          (click)="onCancel()"
          class="cancel-button">
          <mat-icon>close</mat-icon>
          {{ 'common.cancel' | translate }}
        </button>

        <button
          mat-raised-button
          color="primary"
          (click)="onConfirm()"
          class="confirm-button">
          <mat-icon>shopping_cart</mat-icon>
          {{ 'catalog.buyNow' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .purchase-dialog {
      max-width: 500px;
      width: 100%;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #2d3748;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .dialog-content {
      padding: 16px 0;
    }

    .product-info {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .product-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      object-fit: cover;
      border: 1px solid #e2e8f0;
    }

    .product-details {
      flex: 1;
    }

    .product-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #2d3748;
    }

    .product-price {
      font-size: 1.2rem;
      font-weight: 700;
      color: #667eea;
      margin: 0 0 8px 0;
    }

    .product-description {
      font-size: 0.9rem;
      color: #4a5568;
      margin: 0;
      line-height: 1.4;
    }

    .purchase-warning {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: #fef5e7;
      border-radius: 8px;
      border-left: 4px solid #f6ad55;
    }

    .warning-icon {
      color: #f6ad55;
      font-size: 20px;
      margin-top: 2px;
    }

    .purchase-warning p {
      margin: 0;
      font-size: 0.9rem;
      color: #744210;
      line-height: 1.4;
    }

    .dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }

    .cancel-button {
      color: #4a5568;
    }

    .confirm-button {
      background: #667eea;
      color: white;
    }

    .confirm-button:hover {
      background: #5a6fd8;
    }
  `]
})
export class PurchaseConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<PurchaseConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: PurchaseDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close('confirm');
  }
}
