import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

export interface DeleteProjectDialogData {
  projectTitle: string;
  projectId: string;
}

@Component({
  selector: 'app-delete-project-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <div class="delete-dialog">
      <div class="dialog-header">
        <mat-icon color="warn" class="warning-icon">warning</mat-icon>
        <h2 mat-dialog-title>{{ 'designLab.deleteProject.title' | translate }}</h2>
      </div>

      <div mat-dialog-content class="dialog-content">
        <p>{{ 'designLab.deleteProject.message' | translate }}</p>
        <div class="project-info">
          <strong>"{{ data.projectTitle }}"</strong>
        </div>
        <p class="warning-text">{{ 'designLab.deleteProject.warning' | translate }}</p>
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button
          mat-button
          (click)="onCancel()"
          class="cancel-button">
          {{ 'common.cancel' | translate }}
        </button>
        <button
          mat-raised-button
          color="warn"
          (click)="onConfirm()"
          class="delete-button">
          <mat-icon>delete</mat-icon>
          {{ 'designLab.deleteProject.confirm' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .delete-dialog {
      min-width: 400px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .warning-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .dialog-content {
      margin: 16px 0;
    }

    .project-info {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin: 16px 0;
      border-left: 4px solid #ff9800;
    }

    .warning-text {
      color: #f44336;
      font-weight: 500;
      margin-top: 16px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 24px;
    }

    .cancel-button {
      color: #666;
    }

    .delete-button {
      background-color: #f44336;
      color: white;
    }

    .delete-button:hover {
      background-color: #d32f2f;
    }
  `]
})
export class DeleteProjectDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<DeleteProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteProjectDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
