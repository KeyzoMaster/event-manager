import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [NgClass, ReactiveFormsModule, RouterLink],
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      console.log('Form invalid');
      return;
    }
  
    this.loading = true;
    this.error = '';
  
    const { email, password } = this.loginForm.value;
    
    console.log('Attempting login for:', email);
    
    this.authService.login(email, password)
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          // Add a small delay before navigation to ensure token is saved
          setTimeout(() => {
            console.log('Navigating to dashboard...');
            this.router.navigate(['/dashboard']).then(
              success => console.log('Navigation result:', success),
              error => console.error('Navigation error:', error)
            );
          }, 100);
        },
        error: error => {
          console.error('Login error in component:', error);
          this.error = error.error?.message || 'Login failed';
          this.loading = false;
        }
      });
  }

  navigateToRegister(event: Event): void {
    event.preventDefault();
    console.log('Manually navigating to register');
    this.router.navigate(['/register']).then(
      success => console.log('Navigation to register result:', success),
      error => console.error('Navigation to register error:', error)
    );
  }
}