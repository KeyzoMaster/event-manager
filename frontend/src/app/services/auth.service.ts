import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { appSettings } from '../app.settings';

interface TokenPayload {
  sub: string;
  roles?: string[];
  isAdmin?: boolean;
  permissions?: string[];
  exp: number;
}

interface LoginResponse {
  access_token: string;
  user?: any;
  message?: string;
}

interface RegisterResponse {
  access_token?: string;
  message?: string;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'auth_token';
  private apiUrl = appSettings.apiUrl+'/auth'; // Replace with your actual API base URL
  
  constructor(private http: HttpClient) {}
  
  // Login method
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response.access_token) {
          this.saveToken(response.access_token);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }
  
  // Register new user
  register(userData: any): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        // If registration returns a token, save it
        if (response.access_token) {
          this.saveToken(response.access_token);
        }
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }
  
  // Save token with safety checks
  saveToken(token: string): boolean {
    try {
      if (this.isLocalStorageAvailable()) {
        console.log('TokenKey :'+ this.tokenKey),
        console.log(token);
        localStorage.setItem(this.tokenKey, token);
        console.log('saved')
        return true;
      } else {
        console.error('localStorage is not available');
        return false;
      }
    } catch (e) {
      console.error('Error saving token:', e);
      return false;
    }
  }
  
  // Get token with safety checks
  getToken(): string | null {
    try {
      if (this.isLocalStorageAvailable()) {
        return localStorage.getItem(this.tokenKey);
      } else {
        console.error('localStorage is not available');
        return null;
      }
    } catch (e) {
      console.error('Error getting token:', e);
      return null;
    }
  }
  
  // Check if user is an admin
  isAdmin(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    try {
      const decodedToken = jwtDecode<TokenPayload>(token);
      
      // Check token expiration
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        console.warn('Token expired');
        return false;
      }
      
      // Check admin status
      if (decodedToken.isAdmin === true) {
        return true;
      }
      
      if (decodedToken.roles && Array.isArray(decodedToken.roles)) {
        return decodedToken.roles.includes('admin') || decodedToken.roles.includes('ADMIN');
      }
      
      if (decodedToken.permissions && Array.isArray(decodedToken.permissions)) {
        return decodedToken.permissions.includes('admin:access') || decodedToken.permissions.includes('ADMIN_ACCESS');
      }
      
      return false;
    } catch (e) {
      console.error('Error decoding token or checking admin status:', e);
      return false;
    }
  }
  
  // Remove token on logout
  logout(): void {
    try {
      if (this.isLocalStorageAvailable()) {
        localStorage.removeItem(this.tokenKey);
      }
    } catch (e) {
      console.error('Error during logout:', e);
    }
  }
  
  // Check if localStorage is available
  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}