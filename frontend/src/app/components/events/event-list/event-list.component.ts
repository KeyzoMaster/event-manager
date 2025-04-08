// src/app/components/events/event-list/event-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EventService } from '../../../services/event.service';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { RouterLink } from '@angular/router';
import { SlicePipe, DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-event-list',
  standalone: true,
  templateUrl: './event-list.component.html',
  imports: [ReactiveFormsModule, RouterLink, SlicePipe, DatePipe, NgClass],
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  events: any[] = [];
  isAdmin: boolean = false;
  loading = false;
  error = '';
  filterForm: FormGroup;
  categories: string[] = [];
  locations: string[] = [];
  currentPage = 1;
  totalPages = 1;

  constructor(
    private eventService: EventService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.filterForm = this.formBuilder.group({
      category: [''],
      location: [''],
      startDate: [''],
      endDate: [''],
      sort: ['start_date'],
      direction: ['asc']
    });
  }

  ngOnInit(): void {
    this.loadEvents();
    this.isAdmin = this.authService.isAdmin();
    this.loadFilterOptions();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = '';
    
    this.eventService.getEvents(this.filterForm.value)
      .subscribe({
        next: (response) => {
          this.events = response.data;
          this.currentPage = response.current_page;
          this.totalPages = response.last_page;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message || 'Failed to load events';
          this.loading = false;
        }
      });
  }

  loadFilterOptions(): void {
    this.eventService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
    
    this.eventService.getLocations().subscribe(locations => {
      this.locations = locations;
    });
  }

  onFilterSubmit(): void {
    this.loadEvents();
  }

  resetFilters(): void {
    this.filterForm.reset({
      category: '',
      location: '',
      startDate: '',
      endDate: '',
      sort: 'start_date',
      direction: 'asc'
    });
    this.loadEvents();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.loadEvents();
  }
}