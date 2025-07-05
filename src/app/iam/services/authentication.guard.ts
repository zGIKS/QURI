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
export const authenticationGuard: CanActivateFn = (route, state) => {
  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);

  console.log('🔐 Authentication Guard - Checking access to:', state.url);

  // Check localStorage directly first
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  console.log('🔐 localStorage state:', {
    hasToken: !!token,
    hasUserId: !!userId,
    hasUsername: !!username
  });

  // If we have all required data in localStorage, allow access
  if (token && userId && username) {
    console.log('🔐 Valid authentication data found in localStorage');

    // Ensure authentication service is aware of the session
    const restored = authenticationService.checkStoredAuthentication();
    console.log('🔐 Authentication service restored:', restored);

    console.log('✅ Authentication guard: Access granted to', state.url);
    return true;
  }

  // Check authentication service as fallback
  const hasValidToken = authenticationService.hasValidToken();
  console.log('🔐 AuthenticationService hasValidToken:', hasValidToken);

  if (hasValidToken) {
    console.log('✅ Authentication guard: Access granted via service to', state.url);
    return true;
  }

  // No valid authentication found, redirect to sign-in
  console.log('❌ Authentication guard: No valid authentication, redirecting to sign-in');
  router.navigate(['/sign-in']).then();
  return false;
};
