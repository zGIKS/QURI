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

  console.log('🔧 Interceptor - Request URL:', request.url);
  console.log('🔧 Interceptor - Request Method:', request.method);
  console.log('🔧 Interceptor - Request Body:', request.body);
  console.log('🔧 Interceptor - Token exists:', !!token);

  // If no token, send request as is
  if (!token) {
    console.log('🔧 Interceptor - No token found, sending request without Authorization header');
    return next(request);
  }

  // Validate token format (basic check)
  if (token.length < 10) {
    console.error('🔧 Interceptor - Token seems invalid (too short):', token);
    return next(request);
  }

  console.log('🔧 Interceptor - Token preview:', token.substring(0, 20) + '...');
  console.log('🔧 Interceptor - Token full length:', token.length);

  // Add Bearer prefix to token and set Authorization header
  const authHeaderValue = `Bearer ${token}`;
  const handledRequest = request.clone({
    headers: request.headers.set('Authorization', authHeaderValue)
  });

  console.log('🔧 Interceptor - Authorization header set to:', authHeaderValue.substring(0, 30) + '...');
  console.log('🔧 Interceptor - Final request headers:', handledRequest.headers.keys());
  console.log('🔧 Interceptor - Final request URL:', handledRequest.url);

  // Return the handled request.
  return next(handledRequest);
};
