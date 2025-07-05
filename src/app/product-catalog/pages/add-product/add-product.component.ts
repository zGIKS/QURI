import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DesignLabService } from '../../../design-lab/services/design-lab-real.service';
import { Project } from '../../../design-lab/model/project.entity';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    TranslateModule
  ],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  project: Project | null = null;
  projectId: string | null = null;
  isLoading = false;
  isSaving = false;
  error: string | null = null;

  currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'PEN', label: 'PEN (S/)' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private designLabService: DesignLabService,
    private translateService: TranslateService,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      priceAmount: [0, [Validators.required, Validators.min(0.01)]],
      priceCurrency: ['USD', [Validators.required]]
    });
  }

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('projectId');
    if (this.projectId) {
      this.loadProject();
    } else {
      this.error = 'No project ID provided';
    }
  }

  loadProject() {
    if (!this.projectId) return;

    this.isLoading = true;
    this.error = null;

    this.designLabService.getProjectById(this.projectId).subscribe({
      next: (project: Project) => {
        this.project = project;
        this.isLoading = false;
        console.log('✅ Project loaded:', project);
      },
      error: (error: any) => {
        this.error = error;
        this.isLoading = false;
        console.error('❌ Error loading project:', error);
      }
    });
  }

  onSubmit() {
    if (this.productForm.valid && this.project) {
      this.isSaving = true;
      const formData = this.productForm.value;

      console.log('📤 Adding product to catalog:', {
        project: this.project,
        priceAmount: formData.priceAmount,
        priceCurrency: formData.priceCurrency
      });

      // TODO: Implement product creation service call
      // For now, just show a success message and redirect
      setTimeout(() => {
        this.isSaving = false;

        const message = this.translateService.instant('catalog.productAddedSuccess');
        this.snackBar.open(message, 'OK', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });

        this.router.navigate(['/home/catalog']);
      }, 1000);
    }
  }

  onCancel() {
    this.router.navigate(['/home/design-lab']);
  }
}
