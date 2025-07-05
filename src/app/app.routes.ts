import { Routes } from '@angular/router';
import { authenticationGuard } from './iam/services/authentication.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./iam/pages/sign-in/sign-in.component').then(
        (c) => c.SignInComponent
      ),
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./iam/pages/sign-up/sign-up.component').then(
        (c) => c.SignUpComponent
      ),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./public/pages/home/home.component').then((c) => c.HomeComponent),
    canActivate: [authenticationGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./public/pages/dashboard/dashboard.component').then(
            (c) => c.DashboardComponent
          ),
      },
      {
        path: 'catalog',
        loadComponent: () =>
          import('./product-catalog/pages/catalog/catalog.component').then(
            (c) => c.CatalogComponent
          ),
      },
      {
        path: 'catalog/:productId',
        loadComponent: () =>
          import('./product-catalog/pages/product-detail/product-detail.component').then(
            (c) => c.ProductDetailComponent
          ),
      },
      {
        path: 'catalog/add-product/:projectId',
        loadComponent: () =>
          import('./product-catalog/pages/add-product/add-product.component').then(
            (c) => c.AddProductComponent
          ),
      },
      {
        path: 'design-lab',
        loadComponent: () =>
          import('./design-lab/pages/design-lab.component').then(
            (c) => c.DesignLabComponent
          ),
      },
      {
        path: 'design-lab/create',
        loadComponent: () =>
          import('./design-lab/components/project-create/project-create.component').then(
            (c) => c.ProjectCreateComponent
          ),
      },
      {
        path: 'design-lab/edit/:id',
        loadComponent: () =>
          import('./design-lab/components/simple-editor/simple-editor.component').then(
            (c) => c.SimpleEditorComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '/sign-in' },
];
