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
        canActivate: [authenticationGuard],
      },
      {
        path: 'catalog',
        loadComponent: () =>
          import('./product-catalog/pages/catalog/catalog.component').then(
            (c) => c.CatalogComponent
          ),
        canActivate: [authenticationGuard],
      },
      {
        path: 'design-lab',
        loadComponent: () =>
          import('./design-lab/pages/design-lab.component').then(
            (c) => c.DesignLabComponent
          ),
        canActivate: [authenticationGuard],
      },
      {
        path: 'design-lab/create',
        loadComponent: () =>
          import('./design-lab/components/project-create/project-create.component').then(
            (c) => c.ProjectCreateComponent
          ),
        canActivate: [authenticationGuard],
      },
      {
        path: 'design-lab/edit/:id',
        loadComponent: () =>
          import('./design-lab/components/project-edit/project-edit.component').then(
            (c) => c.ProjectEditComponent
          ),
        canActivate: [authenticationGuard],
      },
    ],
  },
  { path: '**', redirectTo: '/sign-in' },
];
