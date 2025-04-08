import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  error = '';
  success = false;
  private formInjections = inject(NonNullableFormBuilder);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    
    this.registerForm = this.formInjections.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required],
      role: ['user'] // Default role is 'user'
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Custom validator to check if passwords match
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    // 'control' here IS the FormGroup, but typed as AbstractControl
    const password = control.get('password');
    const passwordConfirmation = control.get('password_confirmation');

    // Check if controls exist to avoid errors during initialization
    if (!password || !passwordConfirmation) {
        return null; // Or handle as appropriate if controls might not exist
    }

    // Check if passwords don't match
    if (password.value !== passwordConfirmation.value) {
        // It's often good practice to set the error on the specific control
        // that is invalid, in addition to returning it for the group.
        // Make sure to merge with existing errors if necessary.
        passwordConfirmation.setErrors({ ...(passwordConfirmation.errors || {}), passwordMismatch: true });

        // Return the error object for the group
        return { passwordMismatch: true };
    } else {
        // Passwords match. Clear ONLY the mismatch error if it exists.
        if (passwordConfirmation.hasError('passwordMismatch')) {
             // Create a copy of existing errors
            const errors = { ...passwordConfirmation.errors };
            // Remove the specific mismatch error
            delete errors['passwordMismatch'];
            // Set the remaining errors, or null if none are left
            passwordConfirmation.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }
        // Group is valid regarding this specific check
        return null;
    }
  };

  onSubmit(): void {
    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      console.log('Invalid form');
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register(this.registerForm.value)
      .subscribe({
        next: () => {
          this.success = true;
          this.loading = false;
          
          // Redirect to login after successful registration
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: error => {
          if (error.error && error.error.errors) {
            // Handle validation errors from Laravel
            const errorMessages = [];
            for (const field in error.error.errors) {
              errorMessages.push(...error.error.errors[field]);
            }
            this.error = errorMessages.join('\n');
          } else {
            this.error = error.error?.message || 'Registration failed';
          }
          this.loading = false;
        }
      });
  }
}