import { CanActivateFn, Router, CanMatchFn } from '@angular/router';
import {inject} from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn | CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return true;

  if(authService.isLoggedIn() && authService.isAdmin()) return true;

  if (authService.isLoggedIn()) return router.parseUrl('/dashboard');

  return router.parseUrl('/login');
};