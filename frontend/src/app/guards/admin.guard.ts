import { CanActivateFn, Router, CanMatchFn } from '@angular/router';
import {inject} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AppUser } from '../models/user.model';


class AdminChecker{
  private isAdmin : boolean = false;
  constructor(private authService: AuthService){
    this.authService.getUser().subscribe(user => {this.isAdmin = user.role === 'admin';})
  }
  isAdminFn(){
    console.log('is admin:'+this.isAdmin);
    return this.isAdmin;
  }

}

export const adminGuard: CanActivateFn | CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const adminChecker = true;

  if(authService.isLoggedIn() && adminChecker) return true;

  if (authService.isLoggedIn()) return router.parseUrl('/dashboard');

  return router.parseUrl('/login');
};