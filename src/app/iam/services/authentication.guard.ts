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
    hasUsername: !!username,
    tokenPrefix: token?.substring(0, 20) + '...'
  });

  // Check authentication service state
  const serviceToken = authenticationService.getToken();
  const hasValidToken = authenticationService.hasValidToken();

  console.log('🔐 AuthenticationService state:', {
    serviceToken: !!serviceToken,
    hasValidToken
  });

  // Try to restore authentication if we have localStorage data but service doesn't
  if (token && userId && username && !serviceToken) {
    console.log('🔐 Attempting to restore authentication from localStorage...');
    const restored = authenticationService.checkStoredAuthentication();
    console.log('🔐 Restoration result:', restored);
  }

  // Final check
  const finalCheck = authenticationService.hasValidToken();
  console.log('🔐 Final authentication check:', finalCheck);

  if (finalCheck) {
    console.log('✅ Authentication guard: Access granted to', state.url);
    return true;
  } else {
    console.log('❌ Authentication guard: Access denied, redirecting to sign-in');
    router.navigate(['/sign-in']).then();
    return false;
  }
};
