// event-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { AppEvent } from '../../../models/event.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {
  eventForm!: FormGroup;
  isEditMode = false;
  eventId: string | null = null;
  isLoading = false;
  errorMessage = '';
  categories = ['Workshop', 'Conference', 'Meeting', 'Social', 'Other'];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.eventId = this.route.snapshot.paramMap.get('id');
    
    if (this.eventId) {
      this.isEditMode = true;
      this.loadEventData(this.eventId);
    }
  }

  initForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      location: ['', Validators.required],
      category: ['', Validators.required],
      max_participants: [null, [Validators.min(1)]],
    }, { validators: this.timeValidator });
  }

  timeValidator(group: FormGroup): {[key: string]: boolean} | null {
    const startDate = group.get('start_Date')?.value;
    const endDate = group.get('end_Date')?.value;
    
    if (startDate && endDate && startDate >= endDate) {
      return { 'invalidTimeRange': true };
    }
    
    return null;
  }

  loadEventData(id: string): void {
    this.isLoading = true;
    
    this.eventService.getEvent(id).subscribe({
      next: (event) => {
        this.patchFormValues(event);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load event data';
        this.isLoading = false;
        console.error('Error loading event:', error);
      }
    });
  }

  patchFormValues(event: AppEvent): void {
    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      start_date: event.start_date,
      end_date: event.end_date,
      location: event.location,
      category: event.category,
      max_participants: event.max_participants,
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.markFormGroupTouched(this.eventForm);
      return;
    }
    
    this.isLoading = true;
    const eventData = this.eventForm.value;
    
    if (this.isEditMode && this.eventId) {
      this.updateEvent(this.eventId, eventData);
    } else {
      this.createEvent(eventData);
    }
  }

  createEvent(eventData: any): void {
    this.eventService.createEvent(eventData).subscribe({
      next: () => {
        this.router.navigate(['/events']);
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  updateEvent(id: string, eventData: any): void {
    this.eventService.updateEvent(id, eventData).subscribe({
      next: () => {
        this.router.navigate(['/events', id]);
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  handleError(error: any): void {
    this.isLoading = false;
    
    if (error.status === 422 && error.error.errors) {
      // Handle validation errors from backend
      const validationErrors = error.error.errors;
      Object.keys(validationErrors).forEach(key => {
        const formControl = this.eventForm.get(key);
        if (formControl) {
          formControl.setErrors({ serverError: validationErrors[key][0] });
        }
      });
    } else {
      this.errorMessage = 'An error occurred while saving the event';
    }
    
    console.error('Error:', error);
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  cancel(): void {
    if (this.isEditMode && this.eventId) {
      this.router.navigate(['/events', this.eventId]);
    } else {
      this.router.navigate(['/events']);
    }
  }
}
