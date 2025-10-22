import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('Interceptor URL:', req.url); // DEBUG

  if (req.url.includes('/auth/login')) {
    console.log('Login endpoint - skip withCredentials'); // DEBUG
    return next(req);
  }

  console.log('Adding withCredentials'); // DEBUG
  const clonedRequest = req.clone({
    withCredentials: true,
  });

  return next(clonedRequest);
};
