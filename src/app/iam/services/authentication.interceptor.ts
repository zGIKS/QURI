import {HttpInterceptorFn} from '@angular/common/http';

/**
 * Interceptor for adding the authentication token to the request headers.
 * @summary
 * This interceptor adds the authentication token to the request headers if it exists in local storage.
 * If the token does not exist, the request is sent as is.
 * @param request The request object.
 * @param next The next function.
 */
export const authenticationInterceptor: HttpInterceptorFn = (
  request,
  next) => {
  // Get the token from local storage.
  const token = localStorage.getItem('token');
  // If the token exists, add it to the request headers. Otherwise, send the request as is.
  const handledRequest = token
    ? request.clone({headers: request.headers.set('Authorization', `Bearer ${token}`)})
    : request;
  console.log(handledRequest);
  // Return the handled request.
  return next(handledRequest);
};
