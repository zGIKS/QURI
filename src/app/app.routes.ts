import { Routes } from '@angular/router';
import { authenticationGuard } from './iam/services/authentication.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: 'sign-in', loadComponent: () => import('./iam/pages/sign-in/sign-in.component').then(c => c.SignInComponent) },
  { path: 'sign-up', loadComponent: () => import('./iam/pages/sign-up/sign-up.component').then(c => c.SignUpComponent) },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(c => c.HomeComponent),
    canActivate: [authenticationGuard]
  },
  { path: '**', redirectTo: '/sign-in' }
];
