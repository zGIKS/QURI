import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DesignLabApplicationService } from '../../services/design-lab-application.service';
import { CreateProjectCommand } from '../../services/design-lab.commands';
import { GARMENT_COLOR, GARMENT_SIZE, PROJECT_GENDER } from '../../../const';

interface ColorOption {
  name: string;
  value: GARMENT_COLOR;
  hex: string;
}

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatToolbarModule,
    TranslateModule
  ],
  template: `
    <div class="create-project-container">
      <mat-toolbar color="primary" class="create-project-toolbar">
        <button mat-icon-button routerLink="/home/design-lab">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="toolbar-title">{{ 'designLab.createProject' | translate }}</span>
      </mat-toolbar>

      <div class="create-project-content">
        <mat-card class="project-form-card">
          <mat-card-header>
            <mat-card-title>{{ 'designLab.newProject' | translate }}</mat-card-title>
            <mat-card-subtitle>{{ 'designLab.configureProject' | translate }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
              <!-- Nombre del Proyecto -->
              <mat-form-field class="full-width">
                <mat-label>{{ 'designLab.projectName' | translate }}</mat-label>
                <input matInput
                       formControlName="title"
                       [placeholder]="'designLab.projectNamePlaceholder' | translate">
                <mat-error *ngIf="projectForm.get('title')?.hasError('required')">
                  {{ 'designLab.validation.nameRequired' | translate }}
                </mat-error>
                <mat-error *ngIf="projectForm.get('title')?.hasError('minlength')">
                  {{ 'designLab.validation.nameMinLength' | translate }}
                </mat-error>
              </mat-form-field>

              <!-- Género -->
              <mat-form-field class="full-width">
                <mat-label>{{ 'designLab.gender' | translate }}</mat-label>
                <mat-select formControlName="garmentGender">
                  <mat-option [value]="PROJECT_GENDER.MEN">{{ 'designLab.genders.men' | translate }}</mat-option>
                  <mat-option [value]="PROJECT_GENDER.WOMEN">{{ 'designLab.genders.women' | translate }}</mat-option>
                  <mat-option [value]="PROJECT_GENDER.UNISEX">{{ 'designLab.genders.unisex' | translate }}</mat-option>
                  <mat-option [value]="PROJECT_GENDER.KIDS">{{ 'designLab.genders.kids' | translate }}</mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Talla -->
              <mat-form-field class="full-width">
                <mat-label>{{ 'designLab.size' | translate }}</mat-label>
                <mat-select formControlName="garmentSize">
                  <mat-option [value]="GARMENT_SIZE.XS">XS</mat-option>
                  <mat-option [value]="GARMENT_SIZE.S">S</mat-option>
                  <mat-option [value]="GARMENT_SIZE.M">M</mat-option>
                  <mat-option [value]="GARMENT_SIZE.L">L</mat-option>
                  <mat-option [value]="GARMENT_SIZE.XL">XL</mat-option>
                  <mat-option [value]="GARMENT_SIZE.XXL">XXL</mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Selector de Color -->
              <div class="color-selector-section">
                <h3>{{ 'designLab.selectBaseColor' | translate }}</h3>
                <div class="color-options">
                  <div *ngFor="let color of availableColors"
                       class="color-option"
                       [class.selected]="projectForm.get('garmentColor')?.value === color.value"
                       (click)="selectColor(color.value)"
                       [style.background-color]="color.hex"
                       [title]="color.name">
                    <div class="color-name">{{ color.name }}</div>
                    <mat-icon *ngIf="projectForm.get('garmentColor')?.value === color.value"
                              class="selected-icon">check</mat-icon>
                  </div>
                </div>
              </div>

              <!-- Botones de Acción -->
              <div class="form-actions">
                <button mat-button
                        type="button"
                        routerLink="/home/design-lab">
                  {{ 'common.cancel' | translate }}
                </button>
                <button mat-raised-button
                        color="primary"
                        type="submit"
                        [disabled]="projectForm.invalid || isCreating">
                  <mat-icon *ngIf="isCreating">hourglass_empty</mat-icon>
                  <mat-icon *ngIf="!isCreating">add</mat-icon>
                  {{ isCreating ? ('designLab.creating' | translate) : ('designLab.createProject' | translate) }}
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .create-project-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .create-project-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .toolbar-title {
      font-size: 20px;
      font-weight: 500;
      margin-left: 16px;
    }

    .create-project-content {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .project-form-card {
      padding: 24px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .garment-option {
      display: flex;
      flex-direction: column;
    }

    .garment-name {
      font-weight: 500;
    }

    .garment-description {
      font-size: 0.875rem;
      color: #666;
    }

    .color-selector-section {
      margin: 24px 0;
    }

    .color-selector-section h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 500;
    }

    .color-options {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
    }

    .color-option {
      position: relative;
      width: 100%;
      height: 80px;
      border-radius: 8px;
      cursor: pointer;
      border: 3px solid transparent;
      transition: all 0.2s ease-in-out;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      overflow: hidden;
    }

    .color-option:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .color-option.selected {
      border-color: #1976d2;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
    }

    .color-name {
      background-color: rgba(0,0,0,0.7);
      color: white;
      padding: 4px 8px;
      font-size: 12px;
      border-radius: 4px 4px 0 0;
      width: 100%;
      text-align: center;
    }

    .selected-icon {
      position: absolute;
      top: 8px;
      right: 8px;
      color: #1976d2;
      background-color: white;
      border-radius: 50%;
      padding: 2px;
      font-size: 20px;
      width: 24px;
      height: 24px;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;
      gap: 16px;
    }

    .form-actions button {
      flex: 1;
    }

    @media (max-width: 768px) {
      .create-project-content {
        padding: 16px;
      }

      .color-options {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 8px;
      }

      .color-option {
        height: 60px;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ProjectCreateComponent implements OnInit {
  projectForm: FormGroup;
  isCreating = false;

  // Enums para el template
  PROJECT_GENDER = PROJECT_GENDER;
  GARMENT_SIZE = GARMENT_SIZE;

  // Servicios
  private fb = inject(FormBuilder);
  private designLabService = inject(DesignLabApplicationService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private translateService = inject(TranslateService);

  // Opciones de colores disponibles
  availableColors: ColorOption[] = [
    { name: 'Blanco', value: GARMENT_COLOR.WHITE, hex: '#FFFFFF' },
    { name: 'Negro', value: GARMENT_COLOR.BLACK, hex: '#000000' },
    { name: 'Gris', value: GARMENT_COLOR.GRAY, hex: '#6B7280' },
    { name: 'Gris Claro', value: GARMENT_COLOR.LIGHT_GRAY, hex: '#D1D5DB' },
    { name: 'Rojo', value: GARMENT_COLOR.RED, hex: '#DC2626' },
    { name: 'Rosa', value: GARMENT_COLOR.PINK, hex: '#EC4899' },
    { name: 'Púrpura Claro', value: GARMENT_COLOR.LIGHT_PURPLE, hex: '#A78BFA' },
    { name: 'Púrpura', value: GARMENT_COLOR.PURPLE, hex: '#7C3AED' },
    { name: 'Azul Claro', value: GARMENT_COLOR.LIGHT_BLUE, hex: '#60A5FA' },
    { name: 'Cian', value: GARMENT_COLOR.CYAN, hex: '#06B6D4' },
    { name: 'Azul Cielo', value: GARMENT_COLOR.SKY_BLUE, hex: '#0EA5E9' },
    { name: 'Azul', value: GARMENT_COLOR.BLUE, hex: '#2563EB' },
    { name: 'Verde', value: GARMENT_COLOR.GREEN, hex: '#059669' },
    { name: 'Verde Claro', value: GARMENT_COLOR.LIGHT_GREEN, hex: '#34D399' },
    { name: 'Amarillo', value: GARMENT_COLOR.YELLOW, hex: '#FBBF24' },
    { name: 'Amarillo Oscuro', value: GARMENT_COLOR.DARK_YELLOW, hex: '#D97706' }
  ];

  constructor() {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      garmentColor: [GARMENT_COLOR.WHITE, Validators.required],
      garmentGender: [PROJECT_GENDER.UNISEX, Validators.required],
      garmentSize: [GARMENT_SIZE.M, Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('🆕 ProjectCreateComponent initialized');
  }

  /**
   * Seleccionar color de la prenda
   */
  selectColor(color: GARMENT_COLOR): void {
    this.projectForm.patchValue({ garmentColor: color });
    console.log('🎨 Color selected:', color);
  }

  /**
   * Enviar formulario para crear proyecto
   */
  onSubmit(): void {
    if (this.projectForm.valid) {
      this.createProject();
    } else {
      console.warn('⚠️ Form is invalid:', this.projectForm.errors);
      this.markFormGroupTouched();
    }
  }

  /**
   * Crear el proyecto
   */
  private createProject(): void {
    this.isCreating = true;
    const formValue = this.projectForm.value;
    const userId = this.designLabService.getCurrentUserId();

    if (!userId) {
      this.showError(this.translateService.instant('designLab.errors.userNotAuthenticated'));
      this.isCreating = false;
      return;
    }

    const command: CreateProjectCommand = {
      title: formValue.title,
      garmentColor: formValue.garmentColor,
      garmentGender: formValue.garmentGender,
      garmentSize: formValue.garmentSize,
      userId: userId
    };

    console.log('🆕 Creating project with command:', command);

    this.designLabService.createProject(command).subscribe({
      next: (result) => {
        if (result.success && result.projectId) {
          console.log('✅ Project created successfully:', result.projectId);

          this.snackBar.open(
            this.translateService.instant('designLab.messages.projectCreated'),
            this.translateService.instant('common.close'),
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );

          // Navegar al editor del proyecto
          this.router.navigate(['/home/design-lab/edit', result.projectId]);
        } else {
          console.error('❌ Project creation failed:', result.error);
          this.showError(result.error || this.translateService.instant('designLab.errors.creationFailed'));
        }
        this.isCreating = false;
      },
      error: (error) => {
        console.error('❌ Error creating project:', error);
        this.showError(error.message || this.translateService.instant('designLab.errors.creationFailed'));
        this.isCreating = false;
      }
    });
  }

  /**
   * Mostrar mensaje de error
   */
  private showError(message: string): void {
    this.snackBar.open(message, this.translateService.instant('common.close'), {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Marcar todos los campos del formulario como tocados para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.projectForm.controls).forEach(key => {
      const control = this.projectForm.get(key);
      control?.markAsTouched();
    });
  }
}
