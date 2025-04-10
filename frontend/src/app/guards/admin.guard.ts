import { CanActivateFn, Router, CanMatchFn } from '@angular/router';
import {inject} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';

export const adminGuard: CanActivateFn | CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const adminChecker = inject(AdminService);

  if(authService.isLoggedIn() && adminChecker.adminChecker()) return true;

  if (authService.isLoggedIn()) return router.parseUrl('/dashboard');

  return router.parseUrl('/login');
};