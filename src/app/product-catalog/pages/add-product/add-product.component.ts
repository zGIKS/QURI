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
import { ProductCatalogService } from '../../services/product-catalog.service';
import { Project } from '../../../design-lab/model/project.entity';
import { CreateProductRequest } from '../../services/product.request';
import { switchMap } from 'rxjs/operators';

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
    private productCatalogService: ProductCatalogService,
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

      // Create product request
      const createProductRequest: CreateProductRequest = {
        projectId: this.projectId!,
        priceAmount: formData.priceAmount,
        priceCurrency: formData.priceCurrency
      };

      // Create product and then update project status
      this.productCatalogService.createProduct(createProductRequest).pipe(
        switchMap((productResponse) => {
          console.log('✅ Product created successfully:', productResponse);

          // After creating the product, update the project status to GARMENT
          console.log('🔄 Updating project status to GARMENT for project:', this.projectId);
          return this.designLabService.updateProjectStatus(this.projectId!, 'GARMENT', this.project!);
        })
      ).subscribe({
        next: (updateResult) => {
          console.log('✅ Project status updated to GARMENT:', updateResult);
          this.isSaving = false;

          const message = this.translateService.instant('catalog.productAddedSuccess');
          this.snackBar.open(message, 'OK', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });

          this.router.navigate(['/home/catalog']);
        },
        error: (error) => {
          console.error('❌ Error in product creation or project update:', error);
          this.isSaving = false;

          const message = this.translateService.instant('catalog.productAddError');
          this.snackBar.open(message, 'OK', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/home/design-lab']);
  }
}
