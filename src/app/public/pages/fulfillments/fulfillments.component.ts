import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-fulfillments',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 60vh; background: #f5f5f5;">
      <mat-card style="max-width: 420px; width: 100%; padding: 2rem; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <mat-card-header>
          <mat-card-title>
            <mat-icon color="primary" style="vertical-align: middle; margin-right: 8px;">local_shipping</mat-icon>
            Fulfillments
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p style="margin-top: 1rem; color: #666; text-align: center;">
            This is a placeholder for the Fulfillments section.<br>
            Only visible to manufacturers.
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class FulfillmentsComponent {}
