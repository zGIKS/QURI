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
  templateUrl: "./project-create.component.html",
  styleUrl: "./project-create.component.css",
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
      next: (result: any) => {
        console.log('✅ Project creation response:', result);

        // Verificar diferentes formatos de respuesta
        let success = false;
        let projectId = null;
        let errorMessage = null;

        if (result && typeof result === 'object') {
          // Formato esperado: { success: boolean, projectId?: string, error?: string }
          if (result.success !== undefined) {
            success = result.success;
            projectId = result.projectId;
            errorMessage = result.error;
          }
          // Formato alternativo: respuesta directa con id
          else if (result.id) {
            success = true;
            projectId = result.id;
          }
          // Formato alternativo: respuesta con projectId
          else if (result.projectId) {
            success = true;
            projectId = result.projectId;
          }
        }

        if (success && projectId) {
          console.log('✅ Project created successfully with ID:', projectId);

          this.snackBar.open(
            this.translateService.instant('designLab.messages.projectCreated'),
            this.translateService.instant('common.close'),
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );

          // Navegar al editor del proyecto
          this.router.navigate(['/home/design-lab/edit', projectId]);
        } else {
          console.error('❌ Project creation failed:', errorMessage || 'Unknown error');
          this.showError(errorMessage || this.translateService.instant('designLab.errors.creationFailed'));
        }
        this.isCreating = false;
      },
      error: (error: any) => {
        console.error('❌ Error creating project:', error);

        // Extraer mensaje de error más específico
        let errorMessage = this.translateService.instant('designLab.errors.creationFailed');

        if (error) {
          if (typeof error === 'string') {
            errorMessage = error;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          }
        }

        this.showError(errorMessage);
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
