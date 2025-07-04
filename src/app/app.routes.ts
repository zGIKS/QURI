import { Routes } from '@angular/router';
import { authenticationGuard } from './iam/services/authentication.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: 'sign-in', loadComponent: () => import('./iam/pages/sign-in/sign-in.component').then(c => c.SignInComponent) },
  { path: 'sign-up', loadComponent: () => import('./iam/pages/sign-up/sign-up.component').then(c => c.SignUpComponent) },
  {
    path: 'home',
    loadComponent: () => import('./public/pages/home/home.component').then(c => c.HomeComponent),
    canActivate: [authenticationGuard],
    children: [
      {
        path: 'catalog',
        loadComponent: () => import('./product-catalog/pages/catalog/catalog.component').then(c => c.CatalogComponent),
        canActivate: [authenticationGuard]
      }
    ]
  },
  {
    path: 'catalog',
    loadComponent: () => import('./product-catalog/pages/catalog/catalog.component').then(c => c.CatalogComponent),
    canActivate: [authenticationGuard]
  },
  { path: '**', redirectTo: '/sign-in' }
];
