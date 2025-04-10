import { ApplicationConfig} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; // Import provideHttpClient, withInterceptorsFromDi
import { HTTP_INTERCEPTORS } from '@angular/common/http'; // Import HTTP_INTERCEPTORS
import { routes } from './app.routes';
import { AuthInterceptor } from './auth.interceptor'; // Import your interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Provide HttpClient and enable interceptors defined using the multi-provider approach
    provideHttpClient(withInterceptorsFromDi()),
    // Provide the interceptor using the traditional multi-provider approach
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
};