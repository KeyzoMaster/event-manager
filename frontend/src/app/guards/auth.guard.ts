import { CanActivateFn, Router, CanMatchFn } from '@angular/router';
import {inject} from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn | CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  console.log('Auth guard checking if logged in');
  console.log('Token present:', !!authService.getToken());

  return true;

  return router.parseUrl('/login');
};

