import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { map, take } from 'rxjs';

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

  // First check if there's a valid token in localStorage
  const hasValidToken = authenticationService.hasValidToken();

  return authenticationService.isSignedIn.pipe(
    take(1),
    map((isSignedIn) => {
      // If user is signed in OR has a valid token, allow access
      if (isSignedIn || hasValidToken) {
        return true;
      } else {
        router.navigate(['/sign-in']).then();
        return false;
      }
    })
  );
};
