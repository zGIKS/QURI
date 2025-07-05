import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from './authentication.service';

/**
 * Guard for checking if the user is signed in.
 * @summary
 * This guard checks if the user is signed in. If the user is signed in, the guard returns true.
 * If the user is not signed in, the guard navigates the user to the sign-in page and returns false.
 * @param route The route object.
 * @param state The state object.
 */
export const authenticationGuard: CanActivateFn = (_route, _state) => {
  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);

  // Simple check: if we have token, userId, and username in localStorage, allow access
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  if (token && userId && username) {
    // Ensure authentication service is synced (silent sync)
    authenticationService.checkStoredAuthentication();
    return true;
  }

  // No valid authentication found, redirect to sign-in
  console.log('❌ Authentication guard: No valid authentication, redirecting to sign-in');
  router.navigate(['/sign-in']).then();
  return false;
};
