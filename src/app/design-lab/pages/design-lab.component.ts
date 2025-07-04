import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-design-lab',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    RouterModule,
    TranslateModule
  ],
  template: `
    <div class="design-lab-container">
      <mat-toolbar color="primary" class="design-lab-toolbar">
        <button mat-icon-button routerLink="/home/dashboard">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="toolbar-title">{{ 'navigation.designLab' | translate }}</span>
        <span class="toolbar-spacer"></span>
        <button mat-icon-button>
          <mat-icon>help</mat-icon>
        </button>
      </mat-toolbar>

      <div class="design-lab-content">
        <section class="welcome-section">
          <mat-card class="welcome-card">
            <mat-card-header>
              <mat-icon mat-card-avatar class="welcome-avatar">brush</mat-icon>
              <mat-card-title>{{ 'dashboard.designLab.title' | translate }}</mat-card-title>
              <mat-card-subtitle>{{ 'dashboard.designLab.subtitle' | translate }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Welcome to the Design Lab! This is where you can create and manage your design projects.</p>
            </mat-card-content>
          </mat-card>
        </section>

        <section class="design-tools-section">
          <div class="tools-grid">
            <mat-card class="tool-card">
              <mat-card-header>
                <mat-icon mat-card-avatar>palette</mat-icon>
                <mat-card-title>Color Palette</mat-card-title>
                <mat-card-subtitle>Choose your colors</mat-card-subtitle>
              </mat-card-header>
              <mat-card-actions>
                <button mat-raised-button color="primary">
                  <mat-icon>colorize</mat-icon>
                  Open Palette
                </button>
              </mat-card-actions>
            </mat-card>

            <mat-card class="tool-card">
              <mat-card-header>
                <mat-icon mat-card-avatar>layers</mat-icon>
                <mat-card-title>Layer Editor</mat-card-title>
                <mat-card-subtitle>Manage design layers</mat-card-subtitle>
              </mat-card-header>
              <mat-card-actions>
                <button mat-raised-button color="primary">
                  <mat-icon>edit</mat-icon>
                  Edit Layers
                </button>
              </mat-card-actions>
            </mat-card>

            <mat-card class="tool-card">
              <mat-card-header>
                <mat-icon mat-card-avatar>image</mat-icon>
                <mat-card-title>Asset Library</mat-card-title>
                <mat-card-subtitle>Browse design assets</mat-card-subtitle>
              </mat-card-header>
              <mat-card-actions>
                <button mat-raised-button color="primary">
                  <mat-icon>photo_library</mat-icon>
                  Browse Assets
                </button>
              </mat-card-actions>
            </mat-card>

            <mat-card class="tool-card">
              <mat-card-header>
                <mat-icon mat-card-avatar>save</mat-icon>
                <mat-card-title>Project Manager</mat-card-title>
                <mat-card-subtitle>Save and load projects</mat-card-subtitle>
              </mat-card-header>
              <mat-card-actions>
                <button mat-raised-button color="primary">
                  <mat-icon>folder_open</mat-icon>
                  Manage Projects
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .design-lab-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .design-lab-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .toolbar-title {
      font-size: 20px;
      font-weight: 500;
      margin-left: 16px;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .design-lab-content {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section {
      margin-bottom: 32px;
    }

    .welcome-card {
      text-align: center;
    }

    .welcome-avatar {
      background-color: #673ab7 !important;
      color: white !important;
    }

    .design-tools-section {
      margin-bottom: 32px;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .tool-card {
      transition: transform 0.2s ease-in-out;
    }

    .tool-card:hover {
      transform: translateY(-2px);
    }

    .tool-card mat-card-header {
      padding-bottom: 16px;
    }

    .tool-card mat-card-actions {
      padding-top: 8px;
    }

    @media (max-width: 768px) {
      .design-lab-content {
        padding: 16px;
      }
      
      .tools-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `]
})
export class DesignLabComponent {
  constructor() {}
}
