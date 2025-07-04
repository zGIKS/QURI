import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
  ],
  template: `
    <div class="welcome-container">
      <mat-card class="welcome-card">
        <mat-card-content>
          <h1>Hello Welcome!</h1>
          <p>You have successfully signed in to QURI TeeLab.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .welcome-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #303030;
    }

    .welcome-card {
      text-align: center;
      padding: 2rem;
      background-color: #424242;
      color: white;
    }

    h1 {
      margin-bottom: 1rem;
      color: #fff;
    }

    p {
      color: #ccc;
    }
  `]
})
export class HomeComponent {
}
